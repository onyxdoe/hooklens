import { useEffect, useRef, useState } from 'react'
import { router } from '@inertiajs/react'
import { Link2, LogOut, Plus } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import type { AuthUser } from '@/types/auth'

type UserAvatarMenuProps = {
  user: AuthUser
  onCreateWebhook?: () => void
}

function initialFromUser(user: AuthUser) {
  const source = user.name?.trim() || user.email?.trim() || '?'
  return source.charAt(0).toUpperCase()
}

export function UserAvatarMenu({ user, onCreateWebhook }: UserAvatarMenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  async function handleSignOut() {
    setOpen(false)
    await authClient.signOut()
    router.visit('/')
  }

  function handleCreate() {
    setOpen(false)
    if (onCreateWebhook) {
      onCreateWebhook()
      return
    }
    window.dispatchEvent(new CustomEvent('hooklens:open-create'))
  }

  return (
    <div className="relative shrink-0" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-zinc-800 text-sm font-medium text-zinc-100 ring-1 ring-zinc-700 transition hover:ring-zinc-500"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {user.image ? (
          <img src={user.image} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span>{initialFromUser(user)}</span>
        )}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 py-1.5 shadow-xl"
        >
          <div className="border-b border-zinc-800 px-3 py-2">
            <p className="truncate text-sm font-medium text-zinc-100">{user.name}</p>
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          </div>
          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-100"
              onClick={() => {
                setOpen(false)
                router.visit('/h')
              }}
            >
              <Link2 className="size-4 shrink-0 text-zinc-500" aria-hidden />
              Webhook URLs
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-100"
              onClick={handleCreate}
            >
              <Plus className="size-4 shrink-0 text-zinc-500" aria-hidden />
              Create webhook URL
            </button>
          </div>
          <div className="border-t border-zinc-800 py-1">
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-100"
              onClick={() => void handleSignOut()}
            >
              <LogOut className="size-4 shrink-0 text-zinc-500" aria-hidden />
              Log out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
