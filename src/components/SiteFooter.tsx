import { Link } from '@inertiajs/react'

const githubUrl = 'https://github.com/onyxdoe/hooklens'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-8 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-12">
        <p className="text-sm text-zinc-500">© {year} Hooklens</p>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-400">
          <Link href="/terms" className="transition-colors hover:text-zinc-100">
            Terms
          </Link>
          <Link href="/privacy" className="transition-colors hover:text-zinc-100">
            Privacy
          </Link>
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-zinc-100"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}
