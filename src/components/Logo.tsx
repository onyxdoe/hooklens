type LogoProps = {
  showWordmark?: boolean
  size?: 'sm' | 'md'
  className?: string
}

const iconSizes = {
  sm: 'h-6 w-6',
  md: 'h-9 w-9',
}

const wordmarkSizes = {
  sm: 'text-base',
  md: 'text-xl',
}

export function Logo({ showWordmark = true, size = 'md', className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-zinc-100 ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className={`${iconSizes[size]} shrink-0`}
      >
        <circle cx="14" cy="14" r="8.5" stroke="currentColor" strokeWidth="2.25" />
        <path
          d="M20.5 20.5L27 27"
          stroke="currentColor"
          strokeWidth="2.25"
          strokeLinecap="round"
        />
        <path
          d="M22.5 7.5C24.2 8.8 25.5 10.8 25.8 13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark ? (
        <span className={`${wordmarkSizes[size]} font-semibold tracking-tight`}>hooklens</span>
      ) : null}
    </span>
  )
}
