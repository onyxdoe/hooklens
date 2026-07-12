import { and, desc, eq, notInArray } from 'drizzle-orm'
import { Hono, type Context } from 'hono'
import { inertia } from '@hono/inertia'
import { createNodeWebSocket } from '@hono/node-ws'
import { db } from './db/index.js'
import { endpoints, requests, type RequestView } from './db/schema.js'
import { buildCurl } from './lib/curl.js'
import { replayRequest } from './lib/replay.js'
import {
  clearRelayConnection,
  handleRelayMessage,
  isRelayConnected,
  setRelayConnection,
} from './lib/relay.js'
import { broadcast as sseBroadcast, createSseStream } from './lib/sse.js'
import { appUrl } from './lib/app-url.js'
import { getClientIp } from './lib/client-ip.js'
import { checkRateLimit } from './lib/rate-limit.js'
import { rootView } from './root-view.js'

const MAX_BODY_BYTES = 1_048_576
const MAX_REQUESTS = 100

const app = new Hono()
const nodeWs = createNodeWebSocket({ app })

app.use(inertia({ rootView }))

function webhookUrl(endpointId: string) {
  return `${appUrl()}/h/${endpointId}`
}

function toRequestView(row: typeof requests.$inferSelect): RequestView {
  return {
    ...row,
    headers: JSON.parse(row.headers) as Record<string, string>,
    query: JSON.parse(row.query) as Record<string, string>,
  }
}

async function readCaptureBody(c: { req: { arrayBuffer: () => Promise<ArrayBuffer> } }) {
  const raw = await c.req.arrayBuffer()
  if (raw.byteLength <= MAX_BODY_BYTES) {
    return {
      bytes: raw,
      text: raw.byteLength > 0 ? new TextDecoder().decode(raw) : null,
    }
  }
  const slice = raw.slice(0, MAX_BODY_BYTES)
  return {
    bytes: slice,
    text: new TextDecoder().decode(slice),
  }
}

async function pruneRequests(endpointId: string) {
  const keep = await db
    .select({ id: requests.id })
    .from(requests)
    .where(eq(requests.endpointId, endpointId))
    .orderBy(desc(requests.createdAt))
    .limit(MAX_REQUESTS)

  if (keep.length < MAX_REQUESTS) return

  await db.delete(requests).where(
    and(
      eq(requests.endpointId, endpointId),
      notInArray(
        requests.id,
        keep.map((row) => row.id),
      ),
    ),
  )
}

async function captureRequest(c: Context, endpointId: string) {
  const endpointRows = await db.select().from(endpoints).where(eq(endpoints.id, endpointId)).limit(1)
  const endpoint = endpointRows[0]
  if (!endpoint) return c.json({ error: 'Not found' }, 404)

  const started = Date.now()
  const { text: bodyText } = await readCaptureBody(c)
  const latencyMs = Date.now() - started

  const headers: Record<string, string> = {}
  c.req.raw.headers.forEach((value, key) => {
    headers[key] = value
  })

  const query: Record<string, string> = {}
  const url = new URL(c.req.url)
  url.searchParams.forEach((value, key) => {
    query[key] = value
  })

  const clientIp = getClientIp(c)
  const inserted = await db
    .insert(requests)
    .values({
      endpointId,
      method: c.req.method,
      headers: JSON.stringify(headers),
      query: JSON.stringify(query),
      body: bodyText,
      contentType: c.req.header('content-type') ?? null,
      clientIp: clientIp === 'unknown' ? null : clientIp,
      userAgent: c.req.header('user-agent') ?? null,
      sizeBytes: bodyText?.length ?? 0,
      latencyMs,
    })
    .returning()

  await pruneRequests(endpointId)

  const request = toRequestView(inserted[0])
  await sseBroadcast(endpointId, 'message', { type: 'request', data: request })

  if (endpoint.forwardEnabled && endpoint.forwardUrl) {
    void runAutoForward(endpointId, request.id, endpoint.forwardUrl)
  }

  return c.json({ ok: true })
}

async function runAutoForward(endpointId: string, requestId: string, forwardUrl: string) {
  const rows = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1)
  const row = rows[0]
  if (!row) return

  const request = toRequestView(row)
  const result = await replayRequest(request, forwardUrl, endpointId)

  await db
    .update(requests)
    .set({
      forwardStatus: result.status || null,
      forwardError: result.error ?? null,
      forwardMs: result.executionMs,
    })
    .where(eq(requests.id, requestId))

  const updatedRows = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1)
  const updated = updatedRows[0]
  if (updated) {
    await sseBroadcast(endpointId, 'message', { type: 'forward', data: toRequestView(updated) })
  }
}

app.get('/', (c) => c.render('home', { appUrl: appUrl() }))

app.get('/start', async (c) => {
  c.header('Cache-Control', 'no-store')

  const ip = getClientIp(c)
  const limit = checkRateLimit(`create:${ip}`)
  if (!limit.ok) {
    c.header('Retry-After', String(limit.retryAfterSec))
    return c.text(
      `Too many webhook URLs created. Try again in ${limit.retryAfterSec}s.`,
      429,
    )
  }

  const inserted = await db.insert(endpoints).values({ forwardEnabled: false }).returning()
  return c.redirect(`/h/${inserted[0].id}`)
})

app.get('/h/:id/events', async (c) => {
  const endpointId = c.req.param('id')
  const endpointRows = await db.select().from(endpoints).where(eq(endpoints.id, endpointId)).limit(1)
  if (!endpointRows[0]) return c.json({ error: 'Not found' }, 404)

  return new Response(createSseStream(endpointId), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
})

app.get(
  '/h/:id/relay',
  nodeWs.upgradeWebSocket((c) => {
    const endpointId = c.req.param('id')!
    return {
      onOpen(_event, ws) {
        setRelayConnection(endpointId, ws)
        void sseBroadcast(endpointId, 'message', {
          type: 'relay_status',
          data: { connected: true },
        })
      },
      onMessage(event) {
        handleRelayMessage(String(event.data))
      },
      onClose(_event, ws) {
        clearRelayConnection(endpointId, ws)
        void sseBroadcast(endpointId, 'message', {
          type: 'relay_status',
          data: { connected: false },
        })
      },
    }
  }),
)

app.get('/h/:id', async (c) => {
  const endpointId = c.req.param('id')
  const accept = c.req.header('Accept') ?? ''
  const wantsHtml = accept.includes('text/html')
  if (!wantsHtml) {
    return captureRequest(c, endpointId)
  }

  const endpointRows = await db.select().from(endpoints).where(eq(endpoints.id, endpointId)).limit(1)
  const endpoint = endpointRows[0]
  if (!endpoint) return c.redirect('/start')

  const requestRows = await db
    .select()
    .from(requests)
    .where(eq(requests.endpointId, endpointId))
    .orderBy(desc(requests.createdAt))
    .limit(MAX_REQUESTS)

  return c.render('endpoint/show', {
    appUrl: appUrl(),
    endpoint,
    webhookUrl: webhookUrl(endpointId),
    requests: requestRows.map(toRequestView),
    relayConnected: isRelayConnected(endpointId),
  })
})

app.patch('/h/:id/settings', async (c) => {
  const endpointId = c.req.param('id')
  const endpointRows = await db.select().from(endpoints).where(eq(endpoints.id, endpointId)).limit(1)
  if (!endpointRows[0]) return c.json({ error: 'Not found' }, 404)

  const body = await c.req.json<{ forwardEnabled: boolean; forwardUrl: string | null }>()
  await db
    .update(endpoints)
    .set({ forwardEnabled: body.forwardEnabled, forwardUrl: body.forwardUrl })
    .where(eq(endpoints.id, endpointId))

  return c.json({ ok: true })
})

app.post('/h/:id/requests/:requestId/replay', async (c) => {
  const endpointId = c.req.param('id')
  const requestId = c.req.param('requestId')
  const endpointRows = await db.select().from(endpoints).where(eq(endpoints.id, endpointId)).limit(1)
  if (!endpointRows[0]) return c.json({ error: 'Not found' }, 404)

  const requestRows = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1)
  const row = requestRows[0]
  if (!row || row.endpointId !== endpointId) {
    return c.json({ error: 'Not found' }, 404)
  }

  const body = await c.req.json<{ destinationUrl: string }>()
  const result = await replayRequest(toRequestView(row), body.destinationUrl, endpointId)
  return c.json(result)
})

app.get('/h/:id/requests/:requestId/curl', async (c) => {
  const endpointId = c.req.param('id')
  const requestId = c.req.param('requestId')
  const requestRows = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1)
  const row = requestRows[0]
  if (!row || row.endpointId !== endpointId) {
    return c.json({ error: 'Not found' }, 404)
  }
  return c.json({ curl: buildCurl(toRequestView(row), webhookUrl(endpointId)) })
})

app.delete('/h/:id/requests/:requestId', async (c) => {
  const endpointId = c.req.param('id')
  const requestId = c.req.param('requestId')
  const requestRows = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1)
  const row = requestRows[0]
  if (!row || row.endpointId !== endpointId) {
    return c.json({ error: 'Not found' }, 404)
  }
  await db.delete(requests).where(eq(requests.id, requestId))
  return c.json({ ok: true })
})

app.delete('/h/:id/requests', async (c) => {
  const endpointId = c.req.param('id')
  const endpointRows = await db.select().from(endpoints).where(eq(endpoints.id, endpointId)).limit(1)
  if (!endpointRows[0]) return c.json({ error: 'Not found' }, 404)
  await db.delete(requests).where(eq(requests.endpointId, endpointId))
  return c.json({ ok: true })
})

app.all('/h/:id', async (c) => {
  const endpointId = c.req.param('id')
  return captureRequest(c, endpointId)
})

export { app, nodeWs }
