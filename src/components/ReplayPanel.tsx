import { useEffect, useState } from 'react'
import type { RequestView } from '../../app/db/schema'
import { CodeBlock } from './ui/CodeBlock'
import { Button } from './ui/form/Button'
import { Input } from './ui/form/Input'

type ReplayResult = {
  status: number
  headers: Record<string, string>
  body: string
  executionMs: number
  error?: string
}

type ReplayPanelProps = {
  request: RequestView | null
  endpointId: string
  defaultUrl?: string
  relayConnected?: boolean
}

function formatBody(body: string) {
  try {
    return JSON.stringify(JSON.parse(body), null, 2)
  } catch {
    return body
  }
}

export function ReplayPanel({ request, endpointId, defaultUrl = '', relayConnected }: ReplayPanelProps) {
  const [url, setUrl] = useState(defaultUrl)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReplayResult | null>(null)

  useEffect(() => {
    setUrl(defaultUrl)
    setResult(null)
  }, [defaultUrl, request?.id])

  async function handleReplay() {
    if (!request || !url) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/h/${endpointId}/requests/${request.id}/replay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationUrl: url }),
      })
      const data = (await res.json()) as ReplayResult
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  if (!request) return null

  return (
    <div className="min-w-0 border-t border-zinc-800 px-5 py-4">
      <p className="mb-2 text-xs font-medium tracking-wide text-zinc-200 uppercase">Replay</p>
      {!relayConnected && defaultUrl.includes('127.0.0.1') ? (
        <p className="mb-2 text-xs text-zinc-300">Start the relay CLI to replay to localhost.</p>
      ) : null}
      <div className="flex gap-2">
        <Input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://127.0.0.1:4000/webhook"
          className="flex-1"
        />
        <Button onClick={() => void handleReplay()} disabled={loading || !url}>
          {loading ? 'Replaying…' : 'Replay'}
        </Button>
      </div>
      {result ? (
        <div className="mt-3 min-w-0">
          <p className={`mb-2 text-xs ${result.error ? 'text-red-400' : 'text-zinc-400'}`}>
            {result.error
              ? result.error
              : `${result.status} · ${result.executionMs}ms`}
          </p>
          {result.body ? <CodeBlock code={formatBody(result.body)} /> : null}
        </div>
      ) : null}
    </div>
  )
}
