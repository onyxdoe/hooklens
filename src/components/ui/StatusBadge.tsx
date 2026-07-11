type StatusBadgeProps = {
  status: number | null
  error?: string | null
  pending?: boolean
}

export function StatusBadge({ status, error, pending }: StatusBadgeProps) {
  if (pending && status === null && !error) {
    return <span className="inline-block h-2 w-2 rounded-full bg-amber-500" title="Forwarding…" />
  }
  if (error || (status !== null && status >= 400)) {
    return <span className="inline-block h-2 w-2 rounded-full bg-red-500" title={error ?? `HTTP ${status}`} />
  }
  if (status !== null && status >= 200 && status < 300) {
    return <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" title={`HTTP ${status}`} />
  }
  return null
}
