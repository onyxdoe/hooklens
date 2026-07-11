import { useMemo, useState } from 'react'
import type { RequestView } from '../../app/db/schema'
import { CopyButton } from './CopyButton'
import { MethodBadge } from './MethodBadge'
import { CodeBlock } from './ui/CodeBlock'
import { Button } from './ui/form/Button'

type RequestInspectorProps = {
  request: RequestView | null
  endpointId: string
  onDelete: (id: string) => void
}

type Tab = 'body' | 'headers' | 'query' | 'meta'

function formatBody(body: string | null) {
  if (!body) return '—'
  try {
    return JSON.stringify(JSON.parse(body), null, 2)
  } catch {
    return body
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export function RequestInspector({ request, endpointId, onDelete }: RequestInspectorProps) {
  const [tab, setTab] = useState<Tab>('body')
  const [curl, setCurl] = useState<string | null>(null)

  const bodyText = useMemo(() => (request ? formatBody(request.body) : ''), [request])

  if (!request) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-600">
        Select a request to inspect
      </div>
    )
  }

  async function loadCurl() {
    const res = await fetch(`/h/${endpointId}/requests/${request!.id}/curl`)
    const data = (await res.json()) as { curl: string }
    setCurl(data.curl)
    await navigator.clipboard.writeText(data.curl)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'body', label: 'Body' },
    { id: 'headers', label: 'Headers' },
    { id: 'query', label: 'Query' },
    { id: 'meta', label: 'Meta' },
  ]

  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 px-5 py-3">
        <MethodBadge method={request.method} />
        <span className="text-xs text-zinc-300">{new Date(request.createdAt).toLocaleString()}</span>
        <span className="text-xs text-zinc-500">·</span>
        <span className="text-xs text-zinc-300">{formatBytes(request.sizeBytes)}</span>
        <span className="text-xs text-zinc-500">·</span>
        <span className="text-xs text-zinc-300">{request.latencyMs}ms</span>
      </div>

      <div className="flex gap-4 border-b border-zinc-800 px-5">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`py-3 text-sm ${tab === item.id ? 'border-b border-zinc-100 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-auto p-5">
        {tab === 'body' ? <CodeBlock code={bodyText} className="max-h-full" /> : null}
        {tab === 'headers' ? (
          <table className="w-full text-xs">
            <tbody>
              {Object.entries(request.headers).map(([key, value]) => (
                <tr key={key} className="border-b border-zinc-800/50">
                  <td className="py-1.5 pr-4 align-top text-zinc-400">{key}</td>
                  <td className="py-1.5 font-mono break-all text-zinc-300">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
        {tab === 'query' ? (
          Object.keys(request.query).length === 0 ? (
            <p className="text-sm text-zinc-400">—</p>
          ) : (
            <table className="w-full text-xs">
              <tbody>
                {Object.entries(request.query).map(([key, value]) => (
                  <tr key={key} className="border-b border-zinc-800/50">
                    <td className="py-1.5 pr-4 align-top text-zinc-400">{key}</td>
                    <td className="py-1.5 font-mono break-all text-zinc-300">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : null}
        {tab === 'meta' ? (
          <dl className="space-y-2 text-xs">
            {[
              ['Request ID', request.id],
              ['IP', request.clientIp ?? '—'],
              ['User-Agent', request.userAgent ?? '—'],
              ['Content-Type', request.contentType ?? '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-zinc-400">{label}</dt>
                <dd className="mt-0.5 font-mono break-all text-zinc-300">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800 px-5 py-3 text-xs">
        <CopyButton text={bodyText} label="Copy body" variant="toolbar" className="text-xs" />
        <CopyButton
          text={JSON.stringify(request.headers, null, 2)}
          label="Copy headers"
          variant="toolbar"
          className="text-xs"
        />
        <Button variant="toolbar" className="text-xs" onClick={() => void loadCurl()}>
          {curl ? 'Copied cURL' : 'Copy cURL'}
        </Button>
        <Button variant="dangerFilled" className="text-xs" onClick={() => onDelete(request.id)}>
          Delete
        </Button>
      </div>
    </div>
  )
}
