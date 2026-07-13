import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/form/Button'
import { Input } from './ui/form/Input'
import { Toggle } from './ui/form/Toggle'

type ForwardSetupProps = {
  endpointId: string
  forwardEnabled: boolean
  forwardUrl: string | null
  suggestedUrl?: string
  focusUrl?: boolean
  onFocusUrlComplete?: () => void
  onUpdate: (settings: { forwardEnabled: boolean; forwardUrl: string | null }) => void
}

export function ForwardSetup({
  endpointId,
  forwardEnabled,
  forwardUrl,
  suggestedUrl,
  focusUrl,
  onFocusUrlComplete,
  onUpdate,
}: ForwardSetupProps) {
  const [enabled, setEnabled] = useState(forwardEnabled)
  const [url, setUrl] = useState(forwardUrl ?? suggestedUrl ?? '')
  const [saving, setSaving] = useState(false)
  const urlInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEnabled(forwardEnabled)
    setUrl(forwardUrl ?? suggestedUrl ?? '')
  }, [forwardEnabled, forwardUrl, suggestedUrl])

  useEffect(() => {
    if (!focusUrl) return
    const timer = window.setTimeout(() => {
      urlInputRef.current?.focus()
      urlInputRef.current?.select()
      onFocusUrlComplete?.()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [focusUrl, onFocusUrlComplete])

  async function saveEnabled(nextEnabled: boolean) {
    setEnabled(nextEnabled)
    await fetch(`/h/${endpointId}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ forwardEnabled: nextEnabled }),
    })
    onUpdate({ forwardEnabled: nextEnabled, forwardUrl: url || null })
    if (nextEnabled) {
      window.setTimeout(() => urlInputRef.current?.focus(), 0)
    }
  }

  async function saveUrl() {
    setSaving(true)
    try {
      const nextUrl = url.trim() || null
      await fetch(`/h/${endpointId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forwardEnabled: enabled,
          forwardUrl: nextUrl,
        }),
      })
      setUrl(nextUrl ?? '')
      onUpdate({ forwardEnabled: enabled, forwardUrl: nextUrl })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <Toggle
        checked={enabled}
        onChange={(checked) => void saveEnabled(checked)}
        label="Auto-forward incoming webhooks"
      />
      {enabled ? (
        <>
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Input
                ref={urlInputRef}
                label="Forward URL"
                type="text"
                value={url}
                placeholder={suggestedUrl ?? 'http://127.0.0.1:4000/webhook'}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="toolbar"
              className="shrink-0"
              disabled={saving}
              onClick={() => void saveUrl()}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
          <p className="text-xs text-zinc-300">
            When enabled, each captured webhook is forwarded in the background. Localhost URLs require
            the relay CLI.
          </p>
        </>
      ) : null}
    </div>
  )
}
