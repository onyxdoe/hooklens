import { useEffect, useState } from 'react'
import type { RequestView } from '../../app/db/schema'
import { MethodBadge } from './MethodBadge'
import { StatusBadge } from './ui/StatusBadge'

type RequestListProps = {
  requests: RequestView[]
  selectedId: string | null
  forwardEnabled: boolean
  onSelect: (id: string) => void
  onClearAll: () => void
  flashId?: string | null
}

function formatRelative(ms: number) {
  const diff = Date.now() - ms
  if (diff < 60_000) return `${Math.max(1, Math.floor(diff / 1000))}s ago`
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  return new Date(ms).toLocaleTimeString()
}

export function RequestList({
  requests,
  selectedId,
  forwardEnabled,
  onSelect,
  onClearAll,
  flashId,
}: RequestListProps) {
  const [flashing, setFlashing] = useState<string | null>(null)

  useEffect(() => {
    if (!flashId) return
    setFlashing(flashId)
    const timer = setTimeout(() => setFlashing(null), 300)
    return () => clearTimeout(timer)
  }, [flashId])

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-800 px-5 py-3 text-xs font-medium tracking-wide text-zinc-400 uppercase">
        Requests
      </div>
      <div className="flex-1 overflow-y-auto">
        {requests.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-zinc-600">Waiting for webhooks…</p>
        ) : (
          requests.map((request) => (
            <button
              key={request.id}
              type="button"
              onClick={() => onSelect(request.id)}
              title={new Date(request.createdAt).toLocaleString()}
              className={`flex w-full items-center gap-2 border-b border-zinc-800/50 px-5 py-3 text-left text-sm transition-colors hover:bg-zinc-900 ${
                selectedId === request.id ? 'border-l-2 border-l-zinc-100 bg-zinc-900' : 'border-l-2 border-l-transparent'
              } ${flashing === request.id ? 'bg-zinc-800' : ''}`}
            >
              <MethodBadge method={request.method} />
              <span className="flex-1 truncate text-zinc-300">{formatRelative(request.createdAt)}</span>
              {forwardEnabled ? (
                <StatusBadge
                  status={request.forwardStatus}
                  error={request.forwardError}
                  pending={request.forwardStatus === null && !request.forwardError}
                />
              ) : null}
            </button>
          ))
        )}
      </div>
      {requests.length > 0 ? (
        <div className="border-t border-zinc-800 px-5 py-3">
          <button
            type="button"
            onClick={onClearAll}
            className="text-red-400 hover:text-red-500"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </div>
  )
}
