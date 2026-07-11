import { Link } from '@inertiajs/react'
import { IntegrationMarquee } from '@/components/IntegrationMarquee'
import { Logo } from '@/components/Logo'
import { WebhookPreview } from '@/components/WebhookPreview'
import { Button } from '@/components/ui/form/Button'

export default function Home() {
  return (
    <div className="bg-grid-shell relative min-h-screen">
      <div className="bg-grid-frame pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-6xl -translate-x-1/2 border-x border-zinc-800" />

      <header className="relative border-b border-zinc-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-8 lg:px-12">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/start">
            <Button pill>Get a webhook URL →</Button>
          </Link>
        </div>
      </header>

      <main className="relative border-b border-zinc-800">
        <div className="mx-auto max-w-6xl px-8 py-16 lg:px-12 lg:py-24">
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
            <div className="lg:w-3/5">
              <h1 className="text-4xl leading-[1.1] font-semibold tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">
                Stop fighting your webhooks.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400">
                The easiest way to inspect, debug, replay, and test webhooks locally and in production.
              </p>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-zinc-400">
                No localtunnel or ngrok needed to receive webhooks while developing locally. Inspect every event
                and replay to your localhost as many times as you want.
              </p>
              <Link href="/start" className="mt-10 inline-block">
                <Button pill>Get a webhook URL →</Button>
              </Link>
            </div>
            <div className="lg:w-2/5">
              <WebhookPreview />
            </div>
          </div>
        </div>
      </main>

      <footer className="relative">
        <div className="mx-auto max-w-6xl px-8 py-8 text-center lg:px-12">
          <p className="mb-6 text-sm text-zinc-500">Built for the webhooks you already use</p>
          <IntegrationMarquee />
        </div>
      </footer>
    </div>
  )
}
