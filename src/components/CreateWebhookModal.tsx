import { useEffect, useId, useState } from 'react'
import { router } from '@inertiajs/react'
import { siGithub, siGoogle } from 'simple-icons'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/form/Button'
import { Input } from '@/components/ui/form/Input'
import type { AuthUser } from '@/types/auth'

type CreateWebhookModalProps = {
  open: boolean
  user: AuthUser | null
  onClose: () => void
  /** When true, start at name step even if logged out (after OAuth return). */
  forceNameStep?: boolean
  /** Sign-in only (no guest), used for locked owned dashboards. */
  signInOnly?: boolean
  /** When false, backdrop and Escape do not close the modal. */
  dismissible?: boolean
  callbackPath?: string
}

type Step = 'auth' | 'name'

export function CreateWebhookModal({
  open,
  user,
  onClose,
  forceNameStep = false,
  signInOnly = false,
  dismissible = true,
  callbackPath = '/?create=1',
}: CreateWebhookModalProps) {
  const titleId = useId()
  const [step, setStep] = useState<Step>(() => (user || forceNameStep ? 'name' : 'auth'))
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setName('')
    setStep(user || forceNameStep ? 'name' : 'auth')
  }, [open, user, forceNameStep])

  useEffect(() => {
    if (!open || !dismissible || submitting) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, dismissible, submitting])

  if (!open) return null

  async function signIn(provider: 'github' | 'google') {
    setError(null)
    await authClient.signIn.social({
      provider,
      callbackURL: callbackPath,
    })
  }

  async function createEndpoint() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ name: name.trim() || undefined }),
      })
      const data = (await res.json()) as { id?: string; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Could not create webhook URL')
        setSubmitting(false)
        return
      }
      if (!data.id) {
        setError('Could not create webhook URL')
        setSubmitting(false)
        return
      }
      if (user) {
        router.visit('/h')
      } else {
        router.visit(`/h/${data.id}`)
      }
    } catch {
      setError('Could not create webhook URL')
      setSubmitting(false)
    }
  }

  const authTitle = signInOnly ? 'Sign in to view your webhook URLs' : 'Save your webhooks'
  const authDescription = signInOnly
    ? 'Sign in with Google or GitHub to continue.'
    : 'Keep your webhook URLs in one place. Or continue as a guest for a quick one-off.'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {dismissible && !submitting ? (
        <button
          type="button"
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          aria-label="Close"
          onClick={onClose}
        />
      ) : (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden />
      )}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
      >
        {step === 'auth' || signInOnly ? (
          <>
            <h2 id={titleId} className="text-xl font-semibold text-zinc-100">
              {authTitle}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{authDescription}</p>
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void signIn('google')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-white"
              >
                <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                  <path d={siGoogle.path} fill="currentColor" />
                </svg>
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => void signIn('github')}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-100 transition hover:bg-zinc-800"
              >
                <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                  <path d={siGithub.path} fill="currentColor" />
                </svg>
                Continue with GitHub
              </button>
              {!signInOnly ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep('name')}
                >
                  Continue as guest
                </Button>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <h2 id={titleId} className="text-xl font-semibold text-zinc-100">
              Name this webhook
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Optional. Leave blank to use the generated id.
            </p>
            <div className="mt-6 space-y-4">
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Stripe development"
                maxLength={80}
                autoFocus
                disabled={submitting}
              />
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="button" pill disabled={submitting} onClick={() => void createEndpoint()}>
                  {submitting ? 'Creating…' : 'Create webhook URL'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
