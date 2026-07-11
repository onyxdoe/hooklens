#!/usr/bin/env node

import WebSocket from 'ws'

const args = process.argv.slice(2)

function getArg(name: string) {
  const index = args.indexOf(`--${name}`)
  if (index === -1) return null
  return args[index + 1] ?? null
}

const endpointId = getArg('endpoint')
const port = getArg('port') ?? '4000'
const baseUrl = getArg('url') ?? 'http://localhost:3000'

if (!endpointId) {
  console.error('Usage: hooklens --endpoint <id> [--port 4000] [--url http://localhost:3000]')
  process.exit(1)
}

const wsBase = baseUrl.replace(/^http/, 'ws').replace(/\/$/, '')
const relayUrl = `${wsBase}/h/${endpointId}/relay`

const HOP_BY_HOP = new Set(['host', 'connection', 'content-length', 'transfer-encoding'])

function cleanHeaders(headers: Record<string, string>) {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    if (HOP_BY_HOP.has(key.toLowerCase())) continue
    result[key] = value
  }
  return result
}

function connect() {
  const ws = new WebSocket(relayUrl)

  ws.on('open', () => {
    console.log(`Hooklens relay connected → localhost:${port}`)
  })

  ws.on('message', async (raw) => {
    const message = JSON.parse(String(raw)) as {
      type: string
      jobId: string
      method: string
      url: string
      headers: Record<string, string>
      body: string | null
    }

    if (message.type !== 'forward') return

    const started = Date.now()
    try {
      const headers = cleanHeaders(message.headers)
      const response = await fetch(message.url, {
        method: message.method,
        headers,
        body:
          message.body && message.method !== 'GET' && message.method !== 'HEAD'
            ? message.body
            : undefined,
        signal: AbortSignal.timeout(30000),
      })
      const body = await response.text()
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })
      ws.send(
        JSON.stringify({
          type: 'result',
          jobId: message.jobId,
          status: response.status,
          headers: responseHeaders,
          body,
          executionMs: Date.now() - started,
        }),
      )
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: 'result',
          jobId: message.jobId,
          status: 0,
          headers: {},
          body: '',
          executionMs: Date.now() - started,
          error: error instanceof Error ? error.message : 'Forward failed',
        }),
      )
    }
  })

  ws.on('close', () => {
    console.log('Relay disconnected, reconnecting in 2s…')
    setTimeout(connect, 2000)
  })

  ws.on('error', () => {
    ws.close()
  })
}

connect()
