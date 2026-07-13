import { router } from '@inertiajs/react'
import { useEffect, useRef } from 'react'

const happrScriptSrc = 'https://myhappr.com/widget.js'

const HAPPR_SELECTORS = [
  '#myhappr-floating-btn',
  '#myhappr-modal-overlay',
  '#myhappr-widget-styles',
  '#myhappr-widget-font',
  '#myhappr-modal-box',
  '#myhappr-modal-close',
  '#myhappr-modal-iframe',
  '#myhappr-payment-prompt',
  'script[src*="myhappr.com/widget.js"]',
  'iframe[src*="myhappr.com"]',
]

export function removeHapprArtifacts(host?: HTMLElement | null) {
  host?.replaceChildren()

  for (const selector of HAPPR_SELECTORS) {
    document.querySelectorAll(selector).forEach((node) => node.remove())
  }

  document.body.style.overflow = ''
}

export function HapprSupport() {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    removeHapprArtifacts(host)

    const script = document.createElement('script')
    script.src = happrScriptSrc
    script.async = true
    script.dataset.username = 'doe'
    script.dataset.color = '#FF5E5E'
    script.dataset.textColor = '#FFFFFF'
    script.dataset.radius = '9999px'
    script.dataset.text = 'Buy me a coffee'
    script.dataset.title = 'Buy me a coffee'
    script.dataset.inline = 'true'
    host.appendChild(script)

    const unsubStart = router.on('start', () => {
      removeHapprArtifacts(host)
    })

    return () => {
      unsubStart()
      removeHapprArtifacts(host)
    }
  }, [])

  return <div ref={hostRef} className="inline-flex items-center" />
}
