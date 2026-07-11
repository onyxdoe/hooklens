import { createId } from '@paralleldrive/cuid2'
import type { RequestView } from '../db/schema.js'
import { dispatchRelayJob } from './relay.js'

const HOP_BY_HOP = new Set(['host', 'connection', 'content-length', 'transfer-encoding'])

function cleanHeaders(headers: Record<string, string>) {
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    if (HOP_BY_HOP.has(key.toLowerCase())) continue
    result[key] = value
  }
  return result
}

function isLocalDestination(url: string) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.endsWith('.local')) {
      return true
    }
    if (host.startsWith('10.') || host.startsWith('192.168.')) return true
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true
    return false
  } catch {
    return false
  }
}

export type ReplayResult = {
  status: number
  headers: Record<string, string>
  body: string
  executionMs: number
  error?: string
}

export async function replayRequest(
  request: RequestView,
  destinationUrl: string,
  endpointId: string,
): Promise<ReplayResult> {
  const headers = cleanHeaders(request.headers)
  const started = Date.now()

  if (isLocalDestination(destinationUrl)) {
    try {
      const relayResult = await dispatchRelayJob(endpointId, {
        jobId: createId(),
        method: request.method,
        url: destinationUrl,
        headers,
        body: request.body,
      })
      return relayResult
    } catch (error) {
      return {
        status: 0,
        headers: {},
        body: '',
        executionMs: Date.now() - started,
        error: error instanceof Error ? error.message : 'Relay failed',
      }
    }
  }

  try {
    const response = await fetch(destinationUrl, {
      method: request.method,
      headers,
      body: request.body && request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      signal: AbortSignal.timeout(30000),
    })
    const body = await response.text()
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })
    return {
      status: response.status,
      headers: responseHeaders,
      body,
      executionMs: Date.now() - started,
    }
  } catch (error) {
    return {
      status: 0,
      headers: {},
      body: '',
      executionMs: Date.now() - started,
      error: error instanceof Error ? error.message : 'Replay failed',
    }
  }
}
