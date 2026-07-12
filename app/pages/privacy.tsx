import { MarketingShell } from '@/components/MarketingShell'

export default function Privacy() {
  return (
    <MarketingShell>
      <main className="relative border-b border-zinc-800">
        <article className="mx-auto max-w-6xl px-8 py-16 lg:px-12 lg:py-20">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-zinc-500">Last updated: July 12, 2026</p>

            <div className="mt-10 space-y-8 text-base leading-relaxed text-zinc-400">
              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">1. Introduction</h2>
                <p>
                  This Privacy Policy explains how Hooklens ("we", "us", or "our") collects, uses, and
                  shares information when you use our website and webhook debugging tools (the
                  "Service"). By using the Service, you acknowledge this Policy.
                </p>
                <p>
                  Hooklens is built for developers. Much of what you send us is technical request data
                  for debugging, not a social profile. Still, that data can include personal information
                  if you or a third-party webhook provider include it in a payload.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">2. Information we collect</h2>
                <p className="font-medium text-zinc-300">a. Information you send to webhook URLs</p>
                <p>
                  When HTTP requests are sent to a Hooklens endpoint you create, we may store:
                </p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>HTTP method, path, and query parameters</li>
                  <li>Request headers</li>
                  <li>Request body (subject to size limits)</li>
                  <li>Approximate size, timing, and related metadata</li>
                  <li>Client IP address and user agent, when available</li>
                  <li>
                    Forwarding or replay results you trigger (status, errors, timing), when applicable
                  </li>
                </ul>
                <p>
                  The content of those requests depends on what you or upstream providers send. Do not
                  send secrets, passwords, payment card data, government IDs, or other sensitive personal
                  data unless you accept the risk and have a lawful basis to do so.
                </p>

                <p className="font-medium text-zinc-300">b. Usage and technical data</p>
                <p>
                  We may collect technical information needed to operate and protect the Service, such
                  as IP address, browser type, pages visited, referring URLs, timestamps, and rate-limit
                  related signals when you create endpoints or interact with the dashboard.
                </p>

                <p className="font-medium text-zinc-300">c. Local storage</p>
                <p>
                  The dashboard may store preferences in your browser (for example, whether the setup
                  panel is open) using local storage. This stays on your device.
                </p>

                <p className="font-medium text-zinc-300">d. Accounts</p>
                <p>
                  The hosted Service may not require an account. If account features are added later,
                  we will update this Policy to describe what account data we collect.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">3. How we use information</h2>
                <p>We use information to:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Provide, display, and operate webhook capture, inspection, replay, and forwarding</li>
                  <li>Enforce rate limits and prevent abuse, fraud, and security incidents</li>
                  <li>Maintain, debug, and improve the Service</li>
                  <li>Comply with legal obligations and enforce our Terms of Service</li>
                </ul>
                <p>We do not sell your personal information.</p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">4. Sharing</h2>
                <p>We may share information in these situations:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <span className="text-zinc-300">Destinations you choose:</span> when you enable
                    auto-forward or replay, request data is sent to the URL or local relay you configure
                  </li>
                  <li>
                    <span className="text-zinc-300">Service providers:</span> hosting, database, CDN, or
                    infrastructure providers that process data on our behalf to run the Service
                  </li>
                  <li>
                    <span className="text-zinc-300">Legal and safety:</span> when required by law, or to
                    protect the rights, security, or integrity of the Service, users, or others
                  </li>
                  <li>
                    <span className="text-zinc-300">Business transfers:</span> in connection with a
                    merger, acquisition, or asset sale, subject to appropriate safeguards
                  </li>
                </ul>
                <p>
                  Anyone with your webhook URL can send requests to it. Treat URLs as secrets when they
                  may receive sensitive traffic.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">5. Retention</h2>
                <p>
                  Captured requests are retained only as long as needed for the Service, subject to
                  per-endpoint limits and automatic pruning of older entries. Endpoint records and
                  operational logs may be kept for longer as needed for security, abuse prevention, and
                  reliability.
                </p>
                <p>
                  You can delete individual captured requests or clear all requests for an endpoint from
                  the dashboard. Deleting an endpoint's visible history does not guarantee immediate
                  erasure from backups or logs.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">6. Security</h2>
                <p>
                  We take reasonable technical and organizational measures to protect information.
                  No method of transmission or storage is completely secure. You are responsible for
                  protecting access to your webhook URLs, dashboard sessions, and any relay CLI running
                  on your machines.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">7. International processing</h2>
                <p>
                  The Service may be hosted or processed in countries other than where you live.
                  If you use the Service from another region, you understand that information may be
                  transferred to and processed in those locations.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">8. Children's privacy</h2>
                <p>
                  The Service is not directed to children under 13 (or the equivalent minimum age in
                  your jurisdiction). We do not knowingly collect personal information from children.
                  If you believe a child has provided personal information, contact us and we will take
                  appropriate steps to delete it.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">9. Your choices and rights</h2>
                <p>
                  Depending on where you live, you may have rights to access, correct, delete, or
                  restrict processing of personal information, or to object to certain processing. To
                  exercise those rights for data we hold about you, contact us using the details below.
                  We may need to verify your request.
                </p>
                <p>
                  You can limit what we store by not sending sensitive payloads, by clearing captured
                  requests in the dashboard, and by stopping use of the Service.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">10. Cookies and similar technologies</h2>
                <p>
                  We may use essential cookies or similar technologies required for the Service to
                  function (for example, session or security related cookies if authentication is
                  introduced). Browser local storage may be used for UI preferences as described above.
                  We do not currently use third-party advertising cookies.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">11. Changes to this Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. The "Last updated" date at the
                  top will change when we do. Continued use of the Service after an update means you
                  accept the revised Policy.
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-medium text-zinc-100">12. Contact</h2>
                <p>
                  For privacy questions or requests, open an issue or otherwise contact the maintainers
                  via the project repository at{' '}
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
