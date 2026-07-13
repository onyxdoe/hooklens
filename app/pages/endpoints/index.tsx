import { Link } from '@inertiajs/react'
import { Trash2 } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { CreateWebhookModal } from '@/components/CreateWebhookModal'
import { Logo } from '@/components/Logo'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'
import { Button } from '@/components/ui/form/Button'
import type { AuthUser } from '@/types/auth'

type EndpointCard = {
  id: string
  name: string
  createdAt: number
  requestCount: number
  webhookUrl: string
}

type EndpointsIndexProps = {
  appUrl: string
  user: AuthUser
  endpoints: EndpointCard[]
}

export default function EndpointsIndex({ user, endpoints: initial }: EndpointsIndexProps) {
  const [endpoints, setEndpoints] = useState(initial)
  const [createOpen, setCreateOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<EndpointCard | null>(null)
  const [deleting, setDeleting] = useState(false)
  const titleId = useId()

  useEffect(() => {
    if (!pendingDelete || deleting) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setPendingDelete(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [pendingDelete, deleting])

  function requestDelete(endpoint: EndpointCard, event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    setPendingDelete(endpoint)
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/endpoints/${pendingDelete.id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
      })
      if (res.ok) {
        const id = pendingDelete.id
        setEndpoints((prev) => prev.filter((item) => item.id !== id))
        setPendingDelete(null)
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="bg-grid-shell relative min-h-screen">
      <div className="bg-grid-frame pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-6xl -translate-x-1/2 border-x border-zinc-800" />

      <header className="relative border-b border-zinc-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-8 lg:px-12">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Button pill onClick={() => setCreateOpen(true)}>
              New webhook URL
            </Button>
            <UserAvatarMenu user={user} onCreateWebhook={() => setCreateOpen(true)} />
          </div>
        </div>
      </header>

      <main className="relative">
        <div className="mx-auto max-w-6xl px-8 py-12 lg:px-12">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
            Your webhook URLs
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Open a URL to inspect traffic, or delete one you no longer need.
          </p>

          {endpoints.length === 0 ? (
            <div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/40 px-6 py-10 text-center">
              <p className="text-sm text-zinc-400">No webhook URLs yet.</p>
              <Button pill className="mt-4" onClick={() => setCreateOpen(true)}>
                Create your first URL
              </Button>
            </div>
          ) : (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {endpoints.map((endpoint) => (
                <li key={endpoint.id}>
                  <Link
                    href={`/h/${endpoint.id}`}
                    className="group flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/70"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-zinc-100">{endpoint.name}</p>
                      <p className="mt-1 truncate font-mono text-xs text-zinc-500">{endpoint.webhookUrl}</p>
                      <p className="mt-3 text-sm text-zinc-400">
                        {endpoint.requestCount} {endpoint.requestCount === 1 ? 'request' : 'requests'}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Delete ${endpoint.name}`}
                      onClick={(event) => requestDelete(endpoint, event)}
                      className="shrink-0 rounded p-1.5 text-red-400 transition hover:bg-red-950/50 hover:text-red-300"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <CreateWebhookModal open={createOpen} user={user} onClose={() => setCreateOpen(false)} />

      {pendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {deleting ? (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden />
          ) : (
            <button
              type="button"
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              aria-label="Close"
              onClick={() => setPendingDelete(null)}
            />
          )}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
          >
            <h2 id={titleId} className="text-xl font-semibold text-zinc-100">
              Delete webhook URL?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              This permanently deletes{' '}
              <span className="font-medium text-zinc-200">{pendingDelete.name}</span> and all captured
              requests. Providers using this URL will stop working.
            </p>
            <p className="mt-3 break-all font-mono text-xs text-zinc-500">{pendingDelete.webhookUrl}</p>
            <p className="mt-2 text-sm text-zinc-500">
              {pendingDelete.requestCount}{' '}
              {pendingDelete.requestCount === 1 ? 'request' : 'requests'} will be removed.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={deleting}
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="dangerFilled"
                disabled={deleting}
                onClick={() => void confirmDelete()}
              >
                {deleting ? 'Deleting…' : 'Delete forever'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
