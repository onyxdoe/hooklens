import { MethodBadge } from './MethodBadge'
import { StatusBadge } from './ui/StatusBadge'

export function WebhookPreview() {
  return (
    <div className="pointer-events-none overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/40">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2 text-xs">
        <span className="flex items-center gap-2 text-zinc-400">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Hooklens connected
        </span>
        <span className="font-mono text-zinc-600">port 4000</span>
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <MethodBadge method="POST" />
          <div className="flex items-center gap-2">
            <StatusBadge status={200} />
            <span className="text-xs text-zinc-500">200</span>
          </div>
        </div>
        <p className="mb-2 font-mono text-xs text-zinc-400">/h/7xk2m9p4q</p>
        <p className="mb-3 text-xs text-zinc-600">14:32:01 · 842 B · 12ms</p>

        <div className="mb-2 border-b border-zinc-800">
          <span className="inline-block border-b border-zinc-100 py-1.5 text-xs text-zinc-100">
            Body
          </span>
        </div>

        <pre className="overflow-hidden font-mono text-xs leading-relaxed text-zinc-300">
{`{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_live_...",
      "amount_total": 2000
    }
  }
}`}
        </pre>
      </div>
    </div>
  )
}
