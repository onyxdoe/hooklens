import { useMemo } from 'react'
import { CopyButton } from './CopyButton'
import { CodeBlock } from './ui/CodeBlock'
import { Input } from './ui/form/Input'

type RelaySetupProps = {
  endpointId: string
  appUrl: string
  port: string
  path: string
  onPortChange: (port: string) => void
  onPathChange: (path: string) => void
}

function buildLocalUrl(port: string, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `http://127.0.0.1:${port || '4000'}${normalizedPath}`
}

export function RelaySetup({
  endpointId,
  appUrl,
  port,
  path,
  onPortChange,
  onPathChange,
}: RelaySetupProps) {
  const command = useMemo(() => {
    const base = `npx @hooklens/cli --endpoint ${endpointId} --port ${port || '4000'}`
    if (appUrl && appUrl !== 'http://localhost:3000') {
      return `${base} --url ${appUrl}`
    }
    return base
  }, [endpointId, port, appUrl])

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Local port"
          type="number"
          value={port}
          onChange={(e) => onPortChange(e.target.value)}
        />
        <Input
          label="Path"
          type="text"
          value={path}
          onChange={(e) => onPathChange(e.target.value)}
        />
      </div>
      <CodeBlock code={command} />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-zinc-300">
          Run this in your project terminal on the machine where your app listens on port {port || '4000'}.
        </p>
        <CopyButton text={command} label="Copy command" variant="primary" />
      </div>
      <p className="font-mono text-xs text-zinc-200">{buildLocalUrl(port, path)}</p>
    </div>
  )
}
