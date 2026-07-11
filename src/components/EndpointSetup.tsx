import { ForwardSetup } from './ForwardSetup'
import { RelaySetup } from './RelaySetup'

type EndpointSetupProps = {
  open: boolean
  endpointId: string
  appUrl: string
  relayPort: string
  relayPath: string
  forwardEnabled: boolean
  forwardUrl: string | null
  localUrl: string
  focusForwardUrl?: boolean
  onFocusForwardUrlComplete?: () => void
  onPortChange: (port: string) => void
  onPathChange: (path: string) => void
  onForwardUpdate: (settings: { forwardEnabled: boolean; forwardUrl: string | null }) => void
}

export function EndpointSetup({
  open,
  endpointId,
  appUrl,
  relayPort,
  relayPath,
  forwardEnabled,
  forwardUrl,
  localUrl,
  focusForwardUrl,
  onFocusForwardUrlComplete,
  onPortChange,
  onPathChange,
  onForwardUpdate,
}: EndpointSetupProps) {
  if (!open) return null

  return (
    <div className="shrink-0 border-b border-zinc-800 bg-zinc-900/40">
      <div className="flex flex-col md:flex-row md:items-stretch">
        <section className="min-w-0 flex-1 px-6 py-5 md:pr-8">
          <h2 className="mb-3 text-xs font-bold tracking-wide text-white uppercase">Localhost</h2>
          <RelaySetup
            endpointId={endpointId}
            appUrl={appUrl}
            port={relayPort}
            path={relayPath}
            onPortChange={onPortChange}
            onPathChange={onPathChange}
          />
        </section>
        <div className="h-px shrink-0 bg-zinc-800 md:h-auto md:w-px" aria-hidden />
        <section className="min-w-0 flex-1 px-6 py-5 md:pl-8">
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
      </div>
    </div>
  )
}
