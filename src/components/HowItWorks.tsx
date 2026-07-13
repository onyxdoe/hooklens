const steps = [
  {
    number: '01',
    numberClass: 'text-sky-400',
    title: 'Get a Webhook URL',
    body: [
      'Once the app is running, click the "Get a webhook URL" button on the homepage. You\'ll be redirected to a unique URL. This is your new Hooklens endpoint. Copy it and paste it into your webhook provider (e.g., Stripe, GitHub, your own backend).',
    ],
  },
  {
    number: '02',
    numberClass: 'text-emerald-400',
    title: 'Send a Test Webhook',
    body: [
      'To see it working, send a simple POST request to your new URL. You should instantly see the request appear in your Hooklens dashboard. You can inspect its headers, body, query parameters, and more.',
    ],
  },
  {
    number: '03',
    numberClass: 'text-amber-400',
    title: 'Connect to Localhost for Replay and Auto-forward',
    body: [
      'To send captured webhooks to your local development server, go to the "Setup" panel in the Hooklens dashboard and copy the relay command. Run this command in your terminal where your local application is listening for webhooks (e.g., a Node.js server running on port 4000).',
      'Replay: Once the relay status turns green in the dashboard, you can click "Replay" on any captured event. Hooklens will send that event again directly to your local application, letting you debug specific scenarios without re-triggering the original source.',
      'Auto-forward: You can also enable auto-forwarding in the "Setup" panel. With this enabled, every new webhook received by Hooklens will automatically be sent to your configured local URL.',
    ],
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
  numberClass,
  className = '',
}: {
  number: string
  title: string
  body: readonly string[]
  numberClass: string
  className?: string
}) {
  return (
    <div className={`min-w-0 rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-5 ${className}`}>
      <span className={`font-mono text-3xl font-medium tracking-tight ${numberClass}`}>{number}</span>
      <h3 className="mt-3 text-xl font-medium text-zinc-100">{title}</h3>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-400">
        {body.map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </div>
    </div>
  )
}

export function HowItWorks() {
  const [step1, step2, step3] = steps

  return (
    <section className="relative border-b border-zinc-800">
      <div className="mx-auto max-w-6xl px-8 py-16 lg:px-12 lg:py-24">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">How it works</h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
          Here’s how you can use Hooklens to streamline your webhook debugging:
        </p>

        <div className="mt-12 flex flex-col gap-7 md:hidden">
          <Step {...step1} />
          <VerticalConnector />
          <Step {...step2} />
          <VerticalConnector />
          <Step {...step3} />
        </div>

        <div className="mt-14 hidden md:grid md:grid-cols-[1fr_auto_1fr] md:items-stretch md:gap-x-5 md:gap-y-3">
          <Step {...step1} className="h-full" />
          <HorizontalConnector className="mt-8" />
          <Step {...step2} className="h-full" />
          <div className="col-span-3 flex justify-center py-7">
            <VerticalConnector />
          </div>
          <Step {...step3} className="col-span-3" />
        </div>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('hooklens:open-create'))}
          className="mt-12 inline-block text-sm text-zinc-300 transition-colors hover:text-zinc-100"
        >
          Get a webhook URL →
        </button>
      </div>
    </section>
  )
}
