import { serveStatic } from '@hono/node-server/serve-static'
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { Readable } from 'node:stream'
import { createServer as createViteServer, type ViteDevServer } from 'vite'
import { initDatabase } from './db/index.js'
import { app, nodeWs } from './routes.js'

const port = Number(process.env.PORT ?? 3000)
const isProd = process.env.NODE_ENV === 'production'

async function sendNodeResponse(response: Response, res: ServerResponse) {
  res.statusCode = response.status
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'content-encoding') return
    res.setHeader(key, value)
  })
  if (!response.body) {
    res.end()
    return
  }
  Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]).pipe(res)
}

async function handleHono(req: IncomingMessage, res: ServerResponse) {
  const host = req.headers.host ?? `localhost:${port}`
  const url = `http://${host}${req.url ?? '/'}`
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'
  const request = new Request(url, {
    method: req.method,
    headers: req.headers as HeadersInit,
    body: hasBody ? (req as unknown as BodyInit) : undefined,
    duplex: hasBody ? 'half' : undefined,
  } as RequestInit)
  const response = await app.fetch(request)
  await sendNodeResponse(response, res)
}

function handleRequest(vite: ViteDevServer | null) {
  return (req: IncomingMessage, res: ServerResponse) => {
    if (vite) {
      vite.middlewares(req, res, () => {
        void handleHono(req, res)
      })
      return
    }
    void handleHono(req, res)
  }
}

async function main() {
  await initDatabase()

  if (isProd) {
    app.use('*', serveStatic({ root: './dist/client' }))
  }

  const server = createHttpServer()

  const vite = isProd
    ? null
    : await createViteServer({
        server: {
          middlewareMode: true,
          hmr: {
            port: Number(process.env.HMR_PORT ?? 24678),
          },
        },
        appType: 'custom',
      })

  server.on('request', handleRequest(vite))
  nodeWs.injectWebSocket(server)

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Stop the other process or run with PORT=<port> pnpm dev`)
      process.exit(1)
    }
    throw error
  })

  server.listen(port, '0.0.0.0', () => {
    console.log(`Hooklens listening on http://0.0.0.0:${port}`)
  })
}

main()
