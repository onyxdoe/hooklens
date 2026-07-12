import { Link } from '@inertiajs/react'

const steps = [
  {
    number: '01',
    title: 'Get a public URL',
    body: 'Click Get a webhook URL. Paste it into Stripe, GitHub, or any webhook provider.',
  },
  {
    number: '02',
    title: 'Receive and inspect',
    body: 'Each request appears in your dashboard right away. Check headers, body, and timing in one place.',
  },
  {
    number: '03',
    title: 'Connect your localhost app',
    body: 'Open Setup and run the relay command. When the status is connected, Hooklens can send traffic to localhost.',
  },
  {
    number: '04',
    title: 'Test with replay or auto-forward',
    body: 'Replay sends one saved event again. Auto-forward sends every new webhook to your local endpoint.',
  },
] as const

function HorizontalConnector({ className = '' }: { className?: string }) {
  return (
    <span className={`flex items-center justify-center self-center text-zinc-700/70 ${className}`} aria-hidden>
      <span className="h-px w-10 bg-zinc-700/70" />
      <svg viewBox="0 0 12 12" fill="none" className="size-3" stroke="currentColor" strokeWidth="1.6">
        <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function VerticalConnector({ className = '' }: { className?: string }) {
  return (
    <span className={`flex flex-col items-center justify-center text-zinc-700/70 ${className}`} aria-hidden>
      <span className="h-6 w-px bg-zinc-700/70" />
      <svg viewBox="0 0 12 12" fill="none" className="size-3" stroke="currentColor" strokeWidth="1.6">
        <path d="M2 4l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function Step({
  number,
  title,
  body,
}: {
  number: string
  title: string
  body: string
}) {
  return (
    <div className="min-w-0 rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-5">
      <span className="font-mono text-xs tracking-wide text-zinc-600">{number}</span>
      <h3 className="mt-2 text-xl font-medium text-zinc-100">{title}</h3>
      <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-zinc-400">{body}</p>
    </div>
  )
}

export function HowItWorks() {
  const [step1, step2, step3, step4] = steps

  return (
    <section className="relative border-b border-zinc-800">
      <div className="mx-auto max-w-6xl px-8 py-16 lg:px-12 lg:py-24">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">How it works</h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
          Create one URL, receive events, connect localhost, then test delivery with confidence.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-zinc-500">From endpoint setup to local testing in four clear steps.</p>

        <div className="mt-12 flex flex-col gap-7 md:hidden">
          <Step {...step1} />
          <VerticalConnector />
          <Step {...step2} />
          <VerticalConnector />
          <Step {...step3} />
          <VerticalConnector />
          <Step {...step4} />
        </div>

        <div className="mt-14 hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-start md:gap-x-5 md:gap-y-3">
          <Step {...step1} />
          <HorizontalConnector className="mt-8" />
          <Step {...step2} />
          <div className="col-span-3 flex justify-center py-7">
            <VerticalConnector />
          </div>
          <Step {...step3} />
          <HorizontalConnector className="mt-8" />
          <Step {...step4} />
        </div>

        <Link
          href="/start"
          className="mt-12 inline-block text-sm text-zinc-300 transition-colors hover:text-zinc-100"
        >
          Get a webhook URL →
        </Link>
      </div>
    </section>
  )
}
