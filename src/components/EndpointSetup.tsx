import { ForwardSetup } from './ForwardSetup'
import { RelaySetup } from './RelaySetup'
import { VerifySetup } from './VerifySetup'

type EndpointSetupProps = {
  open: boolean
  endpointId: string
  appUrl: string
  relayPort: string
  relayPath: string
  forwardEnabled: boolean
  forwardUrl: string | null
  verifyEnabled: boolean
  verifyToken: string | null
  localUrl: string
  focusForwardUrl?: boolean
  onFocusForwardUrlComplete?: () => void
  onPortChange: (port: string) => void
  onPathChange: (path: string) => void
  onForwardUpdate: (settings: { forwardEnabled: boolean; forwardUrl: string | null }) => void
  onVerifyUpdate: (settings: { verifyEnabled: boolean; verifyToken: string | null }) => void
}

function buildLocalUrl(port: string, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `http://127.0.0.1:${port || '4000'}${normalizedPath}`
}

export function EndpointSetup({
  open,
  endpointId,
  appUrl,
  relayPort,
  relayPath,
  forwardEnabled,
  forwardUrl,
  verifyEnabled,
  verifyToken,
  localUrl,
  focusForwardUrl,
  onFocusForwardUrlComplete,
  onPortChange,
  onPathChange,
  onForwardUpdate,
  onVerifyUpdate,
}: EndpointSetupProps) {
  if (!open) return null

  async function saveLocalUrl({ port, path }: { port: string; path: string }) {
    const previousLocal = localUrl
    const nextLocal = buildLocalUrl(port, path)
    onPortChange(port)
    onPathChange(path)

    const currentForward = (forwardUrl ?? '').trim()
    const shouldSync = !currentForward || currentForward === previousLocal
    if (!shouldSync || nextLocal === currentForward) return

    await fetch(`/h/${endpointId}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ forwardUrl: nextLocal }),
    })
    onForwardUpdate({ forwardEnabled, forwardUrl: nextLocal })
  }

  return (
    <div className="shrink-0 border-b border-zinc-800 bg-zinc-900/40">
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        <section className="min-w-0 flex-1 px-6 py-5 lg:pr-8">
          <h2 className="mb-3 text-xs font-bold tracking-wide text-white uppercase">Localhost</h2>
          <RelaySetup
            endpointId={endpointId}
            appUrl={appUrl}
            port={relayPort}
            path={relayPath}
            onSave={(next) => void saveLocalUrl(next)}
          />
        </section>
        <div className="h-px shrink-0 bg-zinc-800 lg:h-auto lg:w-px" aria-hidden />
        <section className="min-w-0 flex-1 px-6 py-5 lg:px-8">
          <h2 className="mb-3 text-xs font-bold tracking-wide text-white uppercase">Auto-forward</h2>
          <ForwardSetup
            endpointId={endpointId}
            forwardEnabled={forwardEnabled}
            forwardUrl={forwardUrl}
            suggestedUrl={localUrl}
            focusUrl={focusForwardUrl}
            onFocusUrlComplete={onFocusForwardUrlComplete}
            onUpdate={onForwardUpdate}
          />
        </section>
        <div className="h-px shrink-0 bg-zinc-800 lg:h-auto lg:w-px" aria-hidden />
        <section className="min-w-0 flex-1 px-6 py-5 lg:pl-8">
          <h2 className="mb-3 text-xs font-bold tracking-wide text-white uppercase">Meta verify</h2>
          <VerifySetup
            endpointId={endpointId}
            verifyEnabled={verifyEnabled}
            verifyToken={verifyToken}
            onUpdate={onVerifyUpdate}
          />
        </section>
      </div>
    </div>
  )
}
