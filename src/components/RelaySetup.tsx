import { useEffect, useMemo, useState } from 'react'
import { CopyButton } from './CopyButton'
import { CodeBlock } from './ui/CodeBlock'
import { Button } from './ui/form/Button'
import { Input } from './ui/form/Input'

type RelaySetupProps = {
  endpointId: string
  appUrl: string
  port: string
  path: string
  onSave: (next: { port: string; path: string }) => void
}

function buildLocalUrl(port: string, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `http://127.0.0.1:${port || '4000'}${normalizedPath}`
}

function parseLocalUrl(value: string): { port: string; path: string } | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    const parsed = new URL(trimmed.includes('://') ? trimmed : `http://${trimmed}`)
    const port = parsed.port || '4000'
    const path = parsed.pathname || '/'
    return { port, path }
  } catch {
    return null
  }
}

export function RelaySetup({ endpointId, appUrl, port, path, onSave }: RelaySetupProps) {
  const [draftUrl, setDraftUrl] = useState(() => buildLocalUrl(port, path))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDraftUrl(buildLocalUrl(port, path))
    setError(null)
  }, [port, path])

  const command = useMemo(() => {
    const base = `npx @hooklens/cli --endpoint ${endpointId} --port ${port || '4000'}`
    if (appUrl && !/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(appUrl)) {
      return `${base} --url ${appUrl}`
    }
    return base
  }, [endpointId, port, appUrl])

  async function handleSave() {
    const parsed = parseLocalUrl(draftUrl)
    if (!parsed) {
      setError('Enter a valid URL like http://127.0.0.1:4000/webhook')
      return
    }
    setSaving(true)
    try {
      setError(null)
      setDraftUrl(buildLocalUrl(parsed.port, parsed.path))
      onSave(parsed)
      await new Promise((resolve) => setTimeout(resolve, 400))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <Input
            label="Local URL"
            type="text"
            value={draftUrl}
            placeholder="http://127.0.0.1:4000/webhook"
            className="font-mono"
            onChange={(e) => {
              setDraftUrl(e.target.value)
              if (error) setError(null)
            }}
          />
        </div>
        <Button
          type="button"
          variant="toolbar"
          className="shrink-0"
          disabled={saving}
          onClick={() => void handleSave()}
        >
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      <CodeBlock code={command} />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-zinc-300">
          Run this in your project terminal on the machine where your app listens on port {port || '4000'}.
        </p>
        <CopyButton text={command} label="Copy command" variant="primary" />
      </div>
    </div>
  )
}
