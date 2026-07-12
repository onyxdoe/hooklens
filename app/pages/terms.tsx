import { MarketingShell } from '@/components/MarketingShell'

export default function Terms() {
  return (
    <MarketingShell>
      <main className="relative border-b border-zinc-800">
        <article className="mx-auto max-w-6xl px-8 py-16 lg:px-12 lg:py-20">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-3 text-sm text-zinc-500">Last updated: July 12, 2026</p>

            <div className="mt-10 space-y-8 text-base leading-relaxed text-zinc-400">
              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">1. Agreement</h2>
                <p>
                  These Terms of Service ("Terms") govern your access to and use of Hooklens, including
                  the website, webhook capture endpoints, dashboard, and related tools (the "Service").
                  By creating a webhook URL or otherwise using the Service, you agree to these Terms.
                  If you do not agree, do not use the Service.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">2. The Service</h2>
                <p>
                  Hooklens helps developers inspect, debug, replay, and forward HTTP webhook requests.
                  You may create temporary webhook URLs, view captured request details, and optionally
                  forward or replay those requests to destinations you control, including localhost via
                  the optional relay CLI.
                </p>
                <p>
                  The Service is provided for development, testing, and debugging purposes. It is not
                  intended as a long-term production message bus or permanent data store.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">3. Eligibility and accounts</h2>
                <p>
                  You may use the Service without creating an account. You are responsible for all
                  activity that occurs through webhook URLs you create, and for keeping those URLs
                  confidential when they receive sensitive data.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">4. Acceptable use</h2>
                <p>You agree not to use the Service to:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Violate any applicable law or regulation</li>
                  <li>Transmit malware, phishing content, or other harmful material</li>
                  <li>Probe, scan, or attack systems you do not own or have permission to test</li>
                  <li>Attempt to disrupt, overload, or reverse engineer the Service</li>
                  <li>Circumvent rate limits, access controls, or other protective measures</li>
                  <li>
                    Capture, store, or share personal data, payment credentials, secrets, or other
                    sensitive information except as necessary for legitimate debugging of systems you
                    control, and only in compliance with applicable privacy laws
                  </li>
                  <li>Resell, sublicense, or provide the Service to others as your own product without permission</li>
                </ul>
                <p>
                  We may suspend or terminate access, delete endpoints, or refuse service if we believe
                  these Terms have been violated or if use poses risk to the Service or others.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">5. Your content and data</h2>
                <p>
                  Webhook payloads, headers, query parameters, and related metadata you send to the
                  Service ("Content") remain yours. You grant us a limited license to host, process,
                  display, and forward Content solely to operate the Service as you configure it
                  (for example, capturing requests and replaying them to a URL you provide).
                </p>
                <p>
                  You represent that you have the rights and permissions needed to send Content to the
                  Service and to forward it to any destination you configure.
                </p>
                <p>
                  Captured requests may be limited in size and retention. Older requests may be pruned
                  automatically. Do not rely on Hooklens as a permanent archive.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">6. Forwarding and replay</h2>
                <p>
                  If you enable auto-forward or use replay, requests may be sent to destinations you
                  specify, including local machines via the relay CLI. You are solely responsible for
                  those destinations, for securing the relay connection, and for any effects of
                  replaying or forwarding traffic.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">7. Availability and changes</h2>
                <p>
                  We may modify, suspend, or discontinue the Service at any time, with or without
                  notice. Features, limits (including rate limits and retention), and availability may
                  change as the product evolves.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">8. Open source</h2>
                <p>
                  Portions of Hooklens may be available as open source software under separate license
                  terms. Those licenses govern the software itself. These Terms govern your use of any
                  hosted Service we operate.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">9. Disclaimers</h2>
                <p>
                  THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
                  WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF
                  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We do not
                  warrant that the Service will be uninterrupted, secure, or error-free, or that
                  Content will not be lost.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">10. Limitation of liability</h2>
                <p>
                  To the fullest extent permitted by law, Hooklens and its operators will not be liable
                  for any indirect, incidental, special, consequential, or punitive damages, or for any
                  loss of data, profits, or business, arising from your use of the Service. Our total
                  liability for any claim relating to the Service will not exceed one hundred U.S.
                  dollars (USD $100) or the amount you paid us for the Service in the twelve months
                  before the claim, whichever is greater.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">11. Indemnity</h2>
                <p>
                  You agree to defend, indemnify, and hold harmless Hooklens and its operators from
                  claims, damages, and expenses (including reasonable legal fees) arising from your
                  Content, your use of the Service, or your violation of these Terms or applicable law.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">12. Governing law</h2>
                <p>
                  These Terms are governed by the laws applicable in the jurisdiction where the Service
                  operator is established, without regard to conflict-of-law rules. Courts in that
                  jurisdiction will have exclusive venue for disputes, except where prohibited by law.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">13. Changes to these Terms</h2>
                <p>
                  We may update these Terms from time to time. The "Last updated" date at the top will
                  change when we do. Continued use of the Service after changes become effective
                  constitutes acceptance of the updated Terms.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">14. Contact</h2>
                <p>
                  Questions about these Terms can be raised via the project repository at{' '}
                  <a
                    href="https://github.com/onyxdoe/hooklens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-200 underline decoration-zinc-600 underline-offset-2 hover:decoration-zinc-400"
                  >
                    github.com/onyxdoe/hooklens
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>
        </article>
      </main>
    </MarketingShell>
  )
}
