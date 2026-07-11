import type { WSContext } from 'hono/ws'

type RelayJob = {
  jobId: string
  method: string
  url: string
  headers: Record<string, string>
  body: string | null
}

type RelayResult = {
  status: number
  headers: Record<string, string>
  body: string
  executionMs: number
  error?: string
}

type PendingJob = {
  resolve: (result: RelayResult) => void
  reject: (error: Error) => void
  timer: ReturnType<typeof setTimeout>
}

const connections = new Map<string, WSContext>()
const pending = new Map<string, PendingJob>()

export function isRelayConnected(endpointId: string) {
  return connections.has(endpointId)
}

export function setRelayConnection(endpointId: string, ws: WSContext) {
  connections.set(endpointId, ws)
}

export function clearRelayConnection(endpointId: string, ws: WSContext) {
  const current = connections.get(endpointId)
  if (current === ws) connections.delete(endpointId)
}

export function handleRelayMessage(raw: string) {
  const message = JSON.parse(raw) as {
    type: string
    jobId: string
    status?: number
    headers?: Record<string, string>
    body?: string
    executionMs?: number
    error?: string
  }

  if (message.type !== 'result') return

  const job = pending.get(message.jobId)
  if (!job) return

  clearTimeout(job.timer)
  pending.delete(message.jobId)

  if (message.error) {
    job.resolve({
      status: message.status ?? 0,
      headers: message.headers ?? {},
      body: message.body ?? '',
      executionMs: message.executionMs ?? 0,
      error: message.error,
    })
    return
  }

  job.resolve({
    status: message.status ?? 0,
    headers: message.headers ?? {},
    body: message.body ?? '',
    executionMs: message.executionMs ?? 0,
  })
}

export function dispatchRelayJob(endpointId: string, job: RelayJob, timeoutMs = 30000) {
  const ws = connections.get(endpointId)
  if (!ws) {
    return Promise.reject(new Error('Relay not connected'))
  }

  return new Promise<RelayResult>((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(job.jobId)
      reject(new Error('Relay timeout'))
    }, timeoutMs)

    pending.set(job.jobId, { resolve, reject, timer })

    ws.send(
      JSON.stringify({
        type: 'forward',
        jobId: job.jobId,
        method: job.method,
        url: job.url,
        headers: job.headers,
        body: job.body,
      }),
    )
  })
}
