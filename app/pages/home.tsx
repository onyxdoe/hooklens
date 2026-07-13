import { useEffect, useState } from 'react'
import { siGithub } from 'simple-icons'
import { Contribute } from '@/components/Contribute'
import { CreateWebhookModal } from '@/components/CreateWebhookModal'
import { Features } from '@/components/Features'
import { HapprSupport } from '@/components/HapprSupport'
import { HowItWorks } from '@/components/HowItWorks'
import { IntegrationMarquee } from '@/components/IntegrationMarquee'
import { Logo } from '@/components/Logo'
import { SiteFooter } from '@/components/SiteFooter'
import { UserAvatarMenu } from '@/components/UserAvatarMenu'
import { WebhookPreview } from '@/components/WebhookPreview'
import { Button } from '@/components/ui/form/Button'
import type { AuthUser } from '@/types/auth'
import { Link } from '@inertiajs/react'

const githubUrl = 'https://github.com/onyxdoe/hooklens'

type HomeProps = {
  appUrl: string
  user: AuthUser | null
}

export default function Home({ user }: HomeProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [forceNameStep, setForceNameStep] = useState(false)
  const [signInOpen, setSignInOpen] = useState(false)

  useEffect(() => {
    function onOpenCreate() {
      openCreate()
    }
    window.addEventListener('hooklens:open-create', onOpenCreate)
    return () => window.removeEventListener('hooklens:open-create', onOpenCreate)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('create') === '1') {
      setForceNameStep(true)
      setCreateOpen(true)
      window.history.replaceState({}, '', '/')
    }
  }, [])

  function openCreate() {
    setForceNameStep(false)
    setCreateOpen(true)
  }

  return (
    <div className="bg-grid-shell relative min-h-screen">
      <div className="bg-grid-frame pointer-events-none absolute inset-y-0 left-1/2 w-full max-w-6xl -translate-x-1/2 border-x border-zinc-800" />

      <header className="relative border-b border-zinc-800">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-8 lg:px-12">
          <Link href="/">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <Button pill onClick={openCreate}>
                Get a webhook URL →
              </Button>
            </div>
            {user ? (
              <UserAvatarMenu user={user} onCreateWebhook={openCreate} />
            ) : (
              <Button variant="ghost" onClick={() => setSignInOpen(true)}>
                Sign in
              </Button>
            )}
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
              <Button pill className="mt-10" onClick={openCreate}>
                Get a webhook URL →
              </Button>
            </div>
            <div className="lg:w-2/5">
              <WebhookPreview />
            </div>
          </div>
        </div>
      </main>

      <section className="relative border-b border-zinc-800">
        <div className="mx-auto max-w-6xl px-8 py-8 text-center lg:px-12">
          <p className="mb-6 text-sm text-zinc-500">Built for the webhooks you already use</p>
          <IntegrationMarquee />
        </div>
      </section>

      <HowItWorks />
      <Features />
      <Contribute supportSlot={<HapprSupport />} />
      <SiteFooter />

      <CreateWebhookModal
        open={createOpen}
        user={user}
        forceNameStep={forceNameStep}
        onClose={() => setCreateOpen(false)}
      />
      <CreateWebhookModal
        open={signInOpen}
        user={null}
        signInOnly
        callbackPath="/h"
        onClose={() => setSignInOpen(false)}
      />
    </div>
  )
}
