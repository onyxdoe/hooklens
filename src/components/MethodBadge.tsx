type MethodBadgeProps = {
  method: string
}

const colors: Record<string, string> = {
  GET: 'text-sky-400 bg-sky-950',
  POST: 'text-emerald-400 bg-emerald-950',
  PUT: 'text-amber-400 bg-amber-950',
  PATCH: 'text-amber-400 bg-amber-950',
  DELETE: 'text-red-400 bg-red-950',
}

export function MethodBadge({ method }: MethodBadgeProps) {
  const upper = method.toUpperCase()
  const color = colors[upper] ?? 'text-zinc-400 bg-zinc-800'
  return (
    <span className={`inline-block w-14 shrink-0 rounded px-1.5 py-0.5 text-center text-xs font-medium ${color}`}>
      {upper}
    </span>
  )
}
