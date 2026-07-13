import { and, count, desc, eq, notInArray, sql } from 'drizzle-orm'
import { Hono, type Context } from 'hono'
import { inertia } from '@hono/inertia'
import { createNodeWebSocket } from '@hono/node-ws'
import { createId } from '@paralleldrive/cuid2'
import { db } from './db/index.js'
import { endpoints, requests, type RequestView } from './db/schema.js'
import { auth } from './lib/auth.js'
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
import {
  getSessionUser,
  isAllowedOrigin,
  normalizeEndpointName,
  toAuthUserProp,
} from './lib/session.js'
import type { SessionUser } from './lib/auth.js'
import { rootView } from './root-view.js'

const MAX_BODY_BYTES = 1_048_576
const MAX_REQUESTS = 100

const app = new Hono()
const nodeWs = createNodeWebSocket({ app })

app.use(inertia({ rootView }))

app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))

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

function requireSameOrigin(c: Context) {
  if (!isAllowedOrigin(c)) {
    return c.json({ error: 'Invalid origin' }, 403)
  }
  return null
}

function canMutateEndpoint(
  endpoint: typeof endpoints.$inferSelect,
  user: SessionUser | null,
) {
  if (!endpoint.userId) return true
  return Boolean(user && user.id === endpoint.userId)
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

app.get('/', async (c) => {
  const user = await getSessionUser(c)
  return c.render('home', { appUrl: appUrl(), user: toAuthUserProp(user) })
})

app.get('/terms', (c) => c.render('terms', {}))

app.get('/privacy', (c) => c.render('privacy', {}))

app.post('/api/endpoints', async (c) => {
  const originError = requireSameOrigin(c)
  if (originError) return originError

  const user = await getSessionUser(c)
  const ip = getClientIp(c)
  const limitKey = user ? `create:user:${user.id}` : `create:ip:${ip}`
  const windows = user
    ? [
        { windowMs: 60_000, max: 10 },
        { windowMs: 3_600_000, max: 20 },
      ]
    : [
        { windowMs: 60_000, max: 3 },
        { windowMs: 3_600_000, max: 10 },
        { windowMs: 86_400_000, max: 30 },
      ]

  const limit = checkRateLimit(limitKey, windows)
  if (!limit.ok) {
    c.header('Retry-After', String(limit.retryAfterSec))
    return c.json({ error: 'Too many webhook URLs created', retryAfterSec: limit.retryAfterSec }, 429)
  }

  let body: { name?: string } = {}
  try {
    body = await c.req.json<{ name?: string }>()
  } catch {
    body = {}
  }

  const id = createId()
  const name = normalizeEndpointName(body.name, id)
  const inserted = await db
    .insert(endpoints)
    .values({
      id,
      name,
      userId: user?.id ?? null,
      forwardEnabled: false,
    })
    .returning()

  return c.json({ id: inserted[0].id, name: inserted[0].name })
})

app.delete('/api/endpoints/:id', async (c) => {
  const originError = requireSameOrigin(c)
  if (originError) return originError

  const user = await getSessionUser(c)
  if (!user) return c.json({ error: 'Unauthorized' }, 401)

  const endpointId = c.req.param('id')
  const endpointRows = await db.select().from(endpoints).where(eq(endpoints.id, endpointId)).limit(1)
  const endpoint = endpointRows[0]
  if (!endpoint || endpoint.userId !== user.id) {
    return c.json({ error: 'Not found' }, 404)
  }

  await db.delete(requests).where(eq(requests.endpointId, endpointId))
  await db.delete(endpoints).where(eq(endpoints.id, endpointId))
  return c.json({ ok: true })
})

app.get('/h', async (c) => {
  const user = await getSessionUser(c)
  if (!user) return c.redirect('/')

  const rows = await db
    .select({
      id: endpoints.id,
      name: endpoints.name,
      createdAt: endpoints.createdAt,
      requestCount: sql<number>`coalesce(${count(requests.id)}, 0)`.mapWith(Number),
    })
    .from(endpoints)
    .leftJoin(requests, eq(requests.endpointId, endpoints.id))
    .where(eq(endpoints.userId, user.id))
    .groupBy(endpoints.id)
    .orderBy(desc(endpoints.createdAt))

  return c.render('endpoints/index', {
    appUrl: appUrl(),
    user: toAuthUserProp(user),
    endpoints: rows.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
      requestCount: row.requestCount,
      webhookUrl: webhookUrl(row.id),
    })),
  })
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
  if (!endpoint) return c.redirect('/')

  const user = await getSessionUser(c)
  const isGuestEndpoint = !endpoint.userId
  const isOwner = Boolean(user && endpoint.userId && user.id === endpoint.userId)
  const locked = Boolean(endpoint.userId) && !isOwner

  if (locked) {
    return c.render('endpoint/show', {
      appUrl: appUrl(),
      user: toAuthUserProp(user),
      locked: true,
      endpoint: {
        id: endpoint.id,
        name: endpoint.name,
        userId: endpoint.userId,
        forwardEnabled: false,
        forwardUrl: null,
        createdAt: endpoint.createdAt,
        updatedAt: endpoint.updatedAt,
      },
      webhookUrl: webhookUrl(endpointId),
      requests: [],
      relayConnected: false,
    })
  }

  const requestRows = await db
    .select()
    .from(requests)
    .where(eq(requests.endpointId, endpointId))
    .orderBy(desc(requests.createdAt))
    .limit(MAX_REQUESTS)

  return c.render('endpoint/show', {
    appUrl: appUrl(),
    user: toAuthUserProp(user),
    locked: false,
    endpoint,
    webhookUrl: webhookUrl(endpointId),
    requests: requestRows.map(toRequestView),
    relayConnected: isRelayConnected(endpointId),
    isGuestEndpoint,
  })
})

app.patch('/h/:id/settings', async (c) => {
  const originError = requireSameOrigin(c)
  if (originError) return originError

  const endpointId = c.req.param('id')
  const endpointRows = await db.select().from(endpoints).where(eq(endpoints.id, endpointId)).limit(1)
  const endpoint = endpointRows[0]
  if (!endpoint) return c.json({ error: 'Not found' }, 404)

  const user = await getSessionUser(c)
  if (!canMutateEndpoint(endpoint, user)) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const body = await c.req.json<{ forwardEnabled: boolean; forwardUrl: string | null }>()
  await db
    .update(endpoints)
    .set({ forwardEnabled: body.forwardEnabled, forwardUrl: body.forwardUrl })
    .where(eq(endpoints.id, endpointId))

  return c.json({ ok: true })
})

app.post('/h/:id/requests/:requestId/replay', async (c) => {
  const originError = requireSameOrigin(c)
  if (originError) return originError

  const endpointId = c.req.param('id')
  const requestId = c.req.param('requestId')
  const endpointRows = await db.select().from(endpoints).where(eq(endpoints.id, endpointId)).limit(1)
  const endpoint = endpointRows[0]
  if (!endpoint) return c.json({ error: 'Not found' }, 404)

  const user = await getSessionUser(c)
  if (!canMutateEndpoint(endpoint, user)) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

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
  const endpointRows = await db.select().from(endpoints).where(eq(endpoints.id, endpointId)).limit(1)
  const endpoint = endpointRows[0]
  if (!endpoint) return c.json({ error: 'Not found' }, 404)

  const user = await getSessionUser(c)
  if (!canMutateEndpoint(endpoint, user)) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const requestRows = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1)
  const row = requestRows[0]
  if (!row || row.endpointId !== endpointId) {
    return c.json({ error: 'Not found' }, 404)
  }
  return c.json({ curl: buildCurl(toRequestView(row), webhookUrl(endpointId)) })
})

app.delete('/h/:id/requests/:requestId', async (c) => {
  const originError = requireSameOrigin(c)
  if (originError) return originError

  const endpointId = c.req.param('id')
  const requestId = c.req.param('requestId')
  const endpointRows = await db.select().from(endpoints).where(eq(endpoints.id, endpointId)).limit(1)
  const endpoint = endpointRows[0]
  if (!endpoint) return c.json({ error: 'Not found' }, 404)

  const user = await getSessionUser(c)
  if (!canMutateEndpoint(endpoint, user)) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const requestRows = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1)
  const row = requestRows[0]
  if (!row || row.endpointId !== endpointId) {
    return c.json({ error: 'Not found' }, 404)
  }
  await db.delete(requests).where(eq(requests.id, requestId))
  return c.json({ ok: true })
})

app.delete('/h/:id/requests', async (c) => {
  const originError = requireSameOrigin(c)
  if (originError) return originError

  const endpointId = c.req.param('id')
  const endpointRows = await db.select().from(endpoints).where(eq(endpoints.id, endpointId)).limit(1)
  const endpoint = endpointRows[0]
  if (!endpoint) return c.json({ error: 'Not found' }, 404)

  const user = await getSessionUser(c)
  if (!canMutateEndpoint(endpoint, user)) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  await db.delete(requests).where(eq(requests.endpointId, endpointId))
  return c.json({ ok: true })
})

app.all('/h/:id', async (c) => {
  const endpointId = c.req.param('id')
  return captureRequest(c, endpointId)
})

export { app, nodeWs }
