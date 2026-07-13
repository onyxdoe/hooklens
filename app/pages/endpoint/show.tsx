import { Link } from '@inertiajs/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Endpoint, RequestView } from '../../db/schema'
import { CopyButton } from '@/components/CopyButton'
import { CreateWebhookModal } from '@/components/CreateWebhookModal'
import { EndpointEmptyState } from '@/components/EndpointEmptyState'
import { EndpointSetup } from '@/components/EndpointSetup'
import { Logo } from '@/components/Logo'
import { ReplayPanel } from '@/components/ReplayPanel'
import { RequestInspector } from '@/components/RequestInspector'
import { RequestList } from '@/components/RequestList'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'
import { Button } from '@/components/ui/form/Button'
import type { AuthUser } from '@/types/auth'

type ShowProps = {
  appUrl: string
  user: AuthUser | null
  locked: boolean
  endpoint: Endpoint
  webhookUrl: string
  requests: RequestView[]
  relayConnected: boolean
  isGuestEndpoint?: boolean
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

export default function Show({
  appUrl,
  user,
  locked,
  endpoint,
  webhookUrl,
  requests: initialRequests,
  relayConnected: initialRelay,
}: ShowProps) {
  const [requests, setRequests] = useState(initialRequests)
  const [selectedId, setSelectedId] = useState<string | null>(initialRequests[0]?.id ?? null)
  const [flashId, setFlashId] = useState<string | null>(null)
  const [relayConnected, setRelayConnected] = useState(initialRelay)
  const [forwardEnabled, setForwardEnabled] = useState(endpoint.forwardEnabled)
  const [forwardUrl, setForwardUrl] = useState(endpoint.forwardUrl)
  const [relayPort, setRelayPort] = useState('4000')
  const [relayPath, setRelayPath] = useState('/webhook')
  const [setupOpen, setSetupOpen] = useState(() => {
    if (typeof window === 'undefined' || locked) return false
    const stored = window.localStorage.getItem(setupStorageKey(endpoint.id))
    if (stored === null) return false
    return stored === 'true'
  })
  const [focusForwardUrl, setFocusForwardUrl] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)

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
    if (locked) return
    const source = new EventSource(`/h/${endpoint.id}/events`)

    source.addEventListener('message', handleSse)
    source.onerror = () => {
      if (source.readyState === EventSource.CLOSED) {
        source.close()
      }
    }

    return () => source.close()
  }, [endpoint.id, handleSse, locked])

  useEffect(() => {
    if (locked) return
    window.localStorage.setItem(setupStorageKey(endpoint.id), String(setupOpen))
  }, [endpoint.id, setupOpen, locked])

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

  const displayName = endpoint.name || endpoint.id

  return (
    <div className="relative flex h-screen flex-col bg-zinc-950">
      <header className="flex shrink-0 items-center gap-3 border-b border-zinc-800 px-6 py-3">
        <Link href="/" className="shrink-0">
          <Logo showWordmark={false} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-200">{displayName}</p>
          <p className="truncate font-mono text-xs text-zinc-500" title={webhookUrl}>
            {webhookUrl}
          </p>
        </div>
        {!locked ? (
          <>
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
            <Button className="shrink-0 gap-1.5" onClick={() => setCreateOpen(true)}>
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
          </>
        ) : null}
        {user ? (
          <UserAvatarMenu user={user} onCreateWebhook={() => setCreateOpen(true)} />
        ) : (
          <Button className="shrink-0" onClick={() => setSignInOpen(true)}>
            Sign in
          </Button>
        )}
      </header>

      <div className={locked ? 'pointer-events-none min-h-0 flex-1 select-none blur-md' : 'contents'}>
        {!locked ? (
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
        ) : null}

        {locked ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-8">
            <div className="w-full max-w-lg space-y-4 opacity-60">
              <div className="h-24 rounded-lg border border-zinc-800 bg-zinc-900" />
              <div className="h-40 rounded-lg border border-zinc-800 bg-zinc-900" />
              <div className="h-32 rounded-lg border border-zinc-800 bg-zinc-900" />
            </div>
          </div>
        ) : requests.length === 0 ? (
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

      <CreateWebhookModal
        open={createOpen}
        user={user}
        onClose={() => setCreateOpen(false)}
      />
      {locked && user ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
          >
            <h2 className="text-xl font-semibold text-zinc-100">No access</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              This webhook belongs to another account. Switch accounts or go back to your webhook URLs.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Link href="/h">
                <Button pill>Webhook URLs</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <CreateWebhookModal
          open={locked || signInOpen}
          user={null}
          signInOnly
          dismissible={!locked}
          callbackPath={`/h/${endpoint.id}`}
          onClose={() => setSignInOpen(false)}
        />
      )}
    </div>
  )
}
