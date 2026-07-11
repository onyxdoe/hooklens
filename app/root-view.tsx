import { renderToString } from 'react-dom/server'
import { Link, ReactRefresh, Script, ViteClient } from 'vite-ssr-components/react'
import { serializePage, type PageObject, type RootView } from '@hono/inertia'
import { absoluteUrl, seoForPage } from './lib/seo.js'
import { loadViteManifest } from './lib/vite-manifest.js'

const isProd = process.env.NODE_ENV === 'production'
const manifest = isProd ? (loadViteManifest() ?? undefined) : undefined

const Document = ({ page }: { page: PageObject }) => {
  const seo = seoForPage(page.component)
  const canonical = absoluteUrl(page.url)
  const ogImage = absoluteUrl('/logo.svg')

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta
          name="keywords"
          content="webhooks, webhook debugger, webhook testing, webhook replay, stripe webhooks, github webhooks, localhost webhooks"
        />
        <meta name="robots" content={seo.robots} />
        <link rel="canonical" href={canonical} />
        <meta name="theme-color" content="#09090b" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Hooklens" />
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        <meta name="twitter:image" content={ogImage} />
        <link href="/logo.svg" rel="icon" type="image/svg+xml" />
        {!isProd ? <ReactRefresh /> : null}
        {!isProd ? <ViteClient /> : null}
        <Script src="/src/client.tsx" prod={isProd} manifest={manifest} />
        <Link href="/src/style.css" rel="stylesheet" prod={isProd} manifest={manifest} />
      </head>
      <body className="bg-zinc-950 text-zinc-100 antialiased">
        <script
          data-page="app"
          type="application/json"
          dangerouslySetInnerHTML={{ __html: serializePage(page) }}
        />
        <div id="app" />
      </body>
    </html>
  )
}

export const rootView: RootView = (page) => '<!DOCTYPE html>' + renderToString(<Document page={page} />)
