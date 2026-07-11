type CodeBlockProps = {
  code: string
  className?: string
}

export function CodeBlock({ code, className = '' }: CodeBlockProps) {
  return (
    <pre
      className={`max-w-full min-w-0 overflow-x-auto rounded border border-zinc-800 bg-zinc-950 p-4 font-mono text-xs leading-relaxed whitespace-pre text-zinc-100 ${className}`}
    >
      <code className="block min-w-max">{code}</code>
    </pre>
  )
}
