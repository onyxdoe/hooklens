import { useEffect, useRef, useState } from 'react'
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

  async function save(nextEnabled: boolean, nextUrl: string) {
    setEnabled(nextEnabled)
    setUrl(nextUrl)
    await fetch(`/h/${endpointId}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        forwardEnabled: nextEnabled,
        forwardUrl: nextUrl || null,
      }),
    })
    onUpdate({ forwardEnabled: nextEnabled, forwardUrl: nextUrl || null })
  }

  return (
    <div className="space-y-3">
      <Toggle
        checked={enabled}
        onChange={(checked) => void save(checked, url)}
        label="Auto-forward incoming webhooks"
      />
      <Input
        ref={urlInputRef}
        label="Forward URL"
        type="text"
        value={url}
        placeholder={suggestedUrl ?? 'http://127.0.0.1:4000/webhook'}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={() => void save(enabled, url)}
      />
      <p className="text-xs text-zinc-300">
        When enabled, each captured webhook is forwarded in the background. Localhost URLs require the relay CLI.
      </p>
    </div>
  )
}
