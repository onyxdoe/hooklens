import { CopyButton } from './CopyButton'
import { Button } from './ui/form/Button'

type EndpointEmptyStateProps = {
  webhookUrl: string
  onOpenSetup: () => void
}

function buildTestCurl(webhookUrl: string) {
  return `curl -X POST '${webhookUrl}' -H 'Content-Type: application/json' -d '{"test":true}'`
}

export function EndpointEmptyState({ webhookUrl, onOpenSetup }: EndpointEmptyStateProps) {
  const testCurl = buildTestCurl(webhookUrl)

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-zinc-100">No webhooks yet</h2>
        <ol className="mt-4 space-y-3 text-sm text-zinc-300">
          <li className="flex items-start gap-3">
            <span className="mt-0.5 font-mono text-xs text-zinc-500">1</span>
            <span>Copy your webhook URL and add it to Stripe, GitHub, or your provider.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 font-mono text-xs text-zinc-500">2</span>
            <span>Send a test request to confirm events are arriving.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-0.5 font-mono text-xs text-zinc-500">3</span>
            <span>Optional: connect localhost to replay events to your dev server.</span>
          </li>
        </ol>
        <div className="mt-6 flex flex-wrap gap-2">
          <CopyButton text={webhookUrl} label="Copy URL" variant="primary" />
          <CopyButton text={testCurl} label="Copy test cURL" variant="primary" />
          <Button onClick={onOpenSetup}>Connect localhost →</Button>
        </div>
      </div>
    </div>
  )
}
