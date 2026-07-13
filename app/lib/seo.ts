import { appUrl } from './app-url.js'

const siteName = 'Hooklens'

const defaultTitle = `${siteName} - Inspect, debug, and replay webhooks`
const defaultDescription =
  'Inspect, debug, replay, and test webhooks locally and in production. Capture events instantly and forward to localhost without ngrok.'

export function siteUrl() {
  return appUrl()
}

export function seoForPage(component: string) {
  if (component === 'endpoint/show') {
    return {
      title: `Dashboard · ${siteName}`,
      description: 'Webhook capture dashboard for inspecting and replaying events.',
      robots: 'noindex, nofollow',
    }
  }

  if (component === 'endpoints/index') {
    return {
      title: `Webhook URLs · ${siteName}`,
      description: 'Your Hooklens webhook URLs.',
      robots: 'noindex, nofollow',
    }
  }

  if (component === 'terms') {
    return {
      title: `Terms of Service · ${siteName}`,
      description: 'Terms of Service for Hooklens webhook inspection and debugging.',
      robots: 'index, follow',
    }
  }

  if (component === 'privacy') {
    return {
      title: `Privacy Policy · ${siteName}`,
      description: 'Privacy Policy describing how Hooklens collects and uses information.',
      robots: 'index, follow',
    }
  }

  return {
    title: defaultTitle,
    description: defaultDescription,
    robots: 'index, follow',
  }
}

export function absoluteUrl(path: string) {
  const base = siteUrl()
  if (path.startsWith('http')) return path
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}
