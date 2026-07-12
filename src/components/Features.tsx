import type { LucideIcon } from 'lucide-react'
import {
  ArrowRightLeft,
  Code2,
  Link2,
  ListChecks,
  RefreshCw,
  ScanSearch,
  Settings2,
} from 'lucide-react'

const features: {
  title: string
  body: string
  icon: LucideIcon
  iconClass: string
}[] = [
  {
    title: 'Instant Webhook URLs',
    body: 'Quickly generate a unique URL to start capturing webhooks in one click.',
    icon: Link2,
    iconClass: 'text-sky-400',
  },
  {
    title: 'Real-time Inspection',
    body: 'See every incoming webhook event live, including headers, request body, query parameters, timing, and client metadata.',
    icon: ScanSearch,
    iconClass: 'text-emerald-400',
  },
  {
    title: 'Event Replay',
    body: 'Replay any captured webhook event to a specified destination, including your local development server, as many times as you need.',
    icon: RefreshCw,
    iconClass: 'text-amber-400',
  },
  {
    title: 'Localhost Auto-forwarding',
    body: 'Automatically send new incoming webhooks to your local app using the provided CLI relay, eliminating the need for complex tunneling solutions during development.',
    icon: ArrowRightLeft,
    iconClass: 'text-cyan-400',
  },
  {
    title: 'Configurable Forwarding',
    body: 'Easily enable or disable auto-forwarding and set a custom destination URL for your webhooks.',
    icon: Settings2,
    iconClass: 'text-orange-400',
  },
  {
    title: 'Request Management',
    body: 'Clear individual requests or all requests for an endpoint directly from the dashboard.',
    icon: ListChecks,
    iconClass: 'text-rose-400',
  },
  {
    title: 'Open Source',
    body: 'Hooklens is open source, welcoming contributions and improvements from the community.',
    icon: Code2,
    iconClass: 'text-teal-400',
  },
]

export function Features() {
  return (
    <section className="relative border-b border-zinc-800">
      <div className="mx-auto max-w-6xl px-8 py-16 lg:px-12 lg:py-24">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">Features</h2>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, body, icon: Icon, iconClass }) => (
            <li
              key={title}
              className="min-w-0 rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-5"
            >
              <Icon className={`size-8 ${iconClass}`} strokeWidth={1.5} aria-hidden />
              <h3 className="mt-4 text-lg font-medium text-zinc-100">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
