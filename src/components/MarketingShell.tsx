import { Link } from '@inertiajs/react'
import { siGithub } from 'simple-icons'
import { Logo } from '@/components/Logo'
import { SiteFooter } from '@/components/SiteFooter'
import type { ReactNode } from 'react'

const githubUrl = 'https://github.com/onyxdoe/hooklens'

type MarketingShellProps = {
  children: ReactNode
}

export function MarketingShell({ children }: MarketingShellProps) {
  return (
    <div className="bg-grid-shell relative min-h-screen">
      <div className="bg-grid-frame pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-6xl -translate-x-1/2 border-x border-zinc-800" />

      <header className="relative border-b border-zinc-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-8 lg:px-12">
          <Link href="/">
            <Logo />
          </Link>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Hooklens on GitHub"
            className="rounded-md p-1 text-zinc-400 transition-colors hover:text-zinc-100"
          >
            <svg role="img" viewBox="0 0 24 24" aria-hidden="true" className="size-6">
              <path d={siGithub.path} fill="currentColor" />
            </svg>
          </a>
        </div>
      </header>

      {children}

      <SiteFooter />
    </div>
  )
}
