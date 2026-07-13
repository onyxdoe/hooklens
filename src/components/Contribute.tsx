import { useEffect, useRef } from 'react'
import { siGithub } from 'simple-icons'

const githubUrl = 'https://github.com/onyxdoe/hooklens'
const happrScriptSrc = 'https://myhappr.com/widget.js'

export function Contribute() {
  const happrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = happrRef.current
    if (!host) return

    host.replaceChildren()

    const script = document.createElement('script')
    script.src = happrScriptSrc
    script.async = true
    script.dataset.username = 'doe'
    script.dataset.color = '#FF5E5E'
    script.dataset.textColor = '#FFFFFF'
    script.dataset.radius = '9999px'
    script.dataset.text = 'Buy me a coffee'
    script.dataset.title = 'Buy me a coffee'
    host.appendChild(script)

    return () => {
      host.replaceChildren()
    }
  }, [])

  return (
    <section className="relative border-b border-zinc-800">
      <div className="mx-auto max-w-6xl px-8 py-16 lg:px-12 lg:py-24">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-16">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
              Help build Hooklens
            </h2>
            <p className="mt-3 text-base leading-relaxed text-zinc-400">
              Hooklens is open source. If something is rough, open an issue. If you want to fix it, send a
              PR. Have an idea for a feature? Build it and share it. Stars help others find it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div ref={happrRef} />
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-zinc-100 px-6 py-2.5 text-sm font-medium text-zinc-950 transition-colors hover:bg-white"
              >
                Contribute on GitHub →
              </a>
            </div>
          </div>

          <div className="hidden shrink-0 text-zinc-600 md:block" aria-hidden>
            <svg role="img" viewBox="0 0 24 24" className="size-16">
              <path d={siGithub.path} fill="currentColor" />
            </svg>
            <p className="mt-3 text-sm text-zinc-500">Open source</p>
          </div>
        </div>
      </div>
    </section>
  )
}
