import { useEffect, useRef, useState } from 'react'
import { Button } from './ui/form/Button'
import { Input } from './ui/form/Input'
import { Toggle } from './ui/form/Toggle'

type VerifySetupProps = {
  endpointId: string
  verifyEnabled: boolean
  verifyToken: string | null
  onUpdate: (settings: { verifyEnabled: boolean; verifyToken: string | null }) => void
}

export function VerifySetup({ endpointId, verifyEnabled, verifyToken, onUpdate }: VerifySetupProps) {
  const [enabled, setEnabled] = useState(verifyEnabled)
  const [token, setToken] = useState(verifyToken ?? '')
  const [saving, setSaving] = useState(false)
  const tokenInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEnabled(verifyEnabled)
    setToken(verifyToken ?? '')
  }, [verifyEnabled, verifyToken])

  async function saveVerifyEnabled(nextEnabled: boolean) {
    setEnabled(nextEnabled)
    await fetch(`/h/${endpointId}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verifyEnabled: nextEnabled }),
    })
    onUpdate({ verifyEnabled: nextEnabled, verifyToken: token || null })
    if (nextEnabled) {
      window.setTimeout(() => tokenInputRef.current?.focus(), 0)
    }
  }

  async function saveToken() {
    setSaving(true)
    try {
      const nextToken = token.trim() || null
      await fetch(`/h/${endpointId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifyEnabled: true, verifyToken: nextToken }),
      })
      setToken(nextToken ?? '')
      onUpdate({ verifyEnabled: true, verifyToken: nextToken })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <Toggle
        checked={enabled}
        onChange={(checked) => void saveVerifyEnabled(checked)}
        label="Meta webhook verify"
      />
      {enabled ? (
        <>
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Input
                ref={tokenInputRef}
                label="Verify token"
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={token}
                placeholder="Your Meta verify token"
                className="font-mono"
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="toolbar"
              className="shrink-0"
              disabled={saving}
              onClick={() => void saveToken()}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
          <p className="text-xs text-zinc-300">
            Use this as the Verify Token in Meta’s webhook config. Callback URL is your Hooklens webhook
            URL.
          </p>
        </>
      ) : null}
    </div>
  )
}
