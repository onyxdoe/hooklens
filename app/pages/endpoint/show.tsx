import { Link } from '@inertiajs/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Endpoint, RequestView } from '../../db/schema'
import { CopyButton } from '@/components/CopyButton'
import { EndpointEmptyState } from '@/components/EndpointEmptyState'
import { EndpointSetup } from '@/components/EndpointSetup'
import { Logo } from '@/components/Logo'
import { ReplayPanel } from '@/components/ReplayPanel'
import { RequestInspector } from '@/components/RequestInspector'
import { RequestList } from '@/components/RequestList'
import { Button } from '@/components/ui/form/Button'

type ShowProps = {
  appUrl: string
  endpoint: Endpoint
  webhookUrl: string
  requests: RequestView[]
  relayConnected: boolean
}

type SseMessage =
  | { type: 'request'; data: RequestView }
  | { type: 'forward'; data: RequestView }
  | { type: 'relay_status'; data: { connected: boolean } }

function buildLocalUrl(port: string, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `http://127.0.0.1:${port || '4000'}${normalizedPath}`
}

function setupStorageKey(endpointId: string) {
  return `hooklens-setup-open-${endpointId}`
}

export default function Show({ appUrl, endpoint, webhookUrl, requests: initialRequests, relayConnected: initialRelay }: ShowProps) {
  const [requests, setRequests] = useState(initialRequests)
  const [selectedId, setSelectedId] = useState<string | null>(initialRequests[0]?.id ?? null)
  const [flashId, setFlashId] = useState<string | null>(null)
  const [relayConnected, setRelayConnected] = useState(initialRelay)
  const [forwardEnabled, setForwardEnabled] = useState(endpoint.forwardEnabled)
  const [forwardUrl, setForwardUrl] = useState(endpoint.forwardUrl)
  const [relayPort, setRelayPort] = useState('4000')
  const [relayPath, setRelayPath] = useState('/webhook')
  const [setupOpen, setSetupOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    const stored = window.localStorage.getItem(setupStorageKey(endpoint.id))
    if (stored === null) return true
    return stored === 'true'
  })
  const [focusForwardUrl, setFocusForwardUrl] = useState(false)

  const localUrl = useMemo(() => buildLocalUrl(relayPort, relayPath), [relayPort, relayPath])

  const selected = useMemo(
    () => requests.find((r) => r.id === selectedId) ?? null,
    [requests, selectedId],
  )

  const handleSse = useCallback((event: MessageEvent) => {
    const message = JSON.parse(event.data) as SseMessage
    if (message.type === 'request') {
      setRequests((prev) => {
        const next = [message.data, ...prev.filter((r) => r.id !== message.data.id)]
        return next.slice(0, 100)
      })
      setSelectedId((prev) => prev ?? message.data.id)
      setFlashId(message.data.id)
    }
    if (message.type === 'forward') {
      setRequests((prev) => prev.map((r) => (r.id === message.data.id ? message.data : r)))
    }
    if (message.type === 'relay_status') {
      setRelayConnected(message.data.connected)
    }
  }, [])

  useEffect(() => {
    const source = new EventSource(`/h/${endpoint.id}/events`)

    source.addEventListener('message', handleSse)
    source.onerror = () => {
      if (source.readyState === EventSource.CLOSED) {
        source.close()
      }
    }

    return () => source.close()
  }, [endpoint.id, handleSse])

  useEffect(() => {
    window.localStorage.setItem(setupStorageKey(endpoint.id), String(setupOpen))
  }, [endpoint.id, setupOpen])

  async function handleDelete(id: string) {
    await fetch(`/h/${endpoint.id}/requests/${id}`, { method: 'DELETE' })
    setRequests((prev) => {
      const next = prev.filter((r) => r.id !== id)
      if (selectedId === id) setSelectedId(next[0]?.id ?? null)
      return next
    })
  }

  async function handleClearAll() {
    await fetch(`/h/${endpoint.id}/requests`, { method: 'DELETE' })
    setRequests([])
    setSelectedId(null)
  }

  function toggleSetup() {
    setSetupOpen((open) => !open)
  }

  function openSetupWithForwardUrl() {
    setSetupOpen(true)
    setFocusForwardUrl(true)
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      <header className="flex shrink-0 items-center gap-3 border-b border-zinc-800 px-6 py-3">
        <Link href="/" className="shrink-0">
          <Logo showWordmark={false} size="sm" />
        </Link>
        <p className="min-w-0 flex-1 truncate font-mono text-sm text-zinc-300" title={webhookUrl}>
          {webhookUrl}
        </p>
        <span className="hidden shrink-0 items-center gap-2 text-xs text-zinc-300 sm:flex">
          <span
            className={`inline-block h-2 w-2 rounded-full ${relayConnected ? 'bg-emerald-500' : 'bg-zinc-500'}`}
          />
          {relayConnected ? `Connected · :${relayPort}` : 'Relay offline'}
        </span>
        <CopyButton text={webhookUrl} label="Copy" variant="primary" className="shrink-0" />
        <Button onClick={toggleSetup} className="shrink-0 gap-1.5">
          Setup
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5"
            aria-hidden
          >
            {setupOpen ? <path d="M4 10l4-4 4 4" /> : <path d="M4 6l4 4 4-4" />}
          </svg>
        </Button>
        <Link href="/start" className="shrink-0">
          <Button className="gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="size-3.5"
              aria-hidden
            >
              <path d="M8 3v10M3 8h10" />
            </svg>
            New
          </Button>
        </Link>
      </header>

      <EndpointSetup
        open={setupOpen}
        endpointId={endpoint.id}
        appUrl={appUrl}
        relayPort={relayPort}
        relayPath={relayPath}
        forwardEnabled={forwardEnabled}
        forwardUrl={forwardUrl}
        localUrl={localUrl}
        focusForwardUrl={focusForwardUrl}
        onFocusForwardUrlComplete={() => setFocusForwardUrl(false)}
        onPortChange={setRelayPort}
        onPathChange={setRelayPath}
        onForwardUpdate={({ forwardEnabled: enabled, forwardUrl: url }) => {
          setForwardEnabled(enabled)
          setForwardUrl(url)
        }}
      />

      {requests.length === 0 ? (
        <EndpointEmptyState webhookUrl={webhookUrl} onOpenSetup={openSetupWithForwardUrl} />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <aside className="w-full shrink-0 border-b border-zinc-800 md:w-80 md:border-r md:border-b-0">
            <RequestList
              requests={requests}
              selectedId={selectedId}
              forwardEnabled={forwardEnabled}
              onSelect={setSelectedId}
              onClearAll={() => void handleClearAll()}
              flashId={flashId}
            />
          </aside>
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
              <RequestInspector
                request={selected}
                endpointId={endpoint.id}
                onDelete={(id) => void handleDelete(id)}
              />
            </div>
            <ReplayPanel
              request={selected}
              endpointId={endpoint.id}
              defaultUrl={forwardUrl ?? localUrl}
              relayConnected={relayConnected}
            />
          </main>
        </div>
      )}
    </div>
  )
}
