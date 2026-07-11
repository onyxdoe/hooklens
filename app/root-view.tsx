import { renderToString } from 'react-dom/server'
import { Link, ReactRefresh, Script, ViteClient } from 'vite-ssr-components/react'
import { serializePage, type PageObject, type RootView } from '@hono/inertia'

const Document = ({ page }: { page: PageObject }) => (
  <html lang="en" className="dark">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Hooklens</title>
      <link href="/logo.svg" rel="icon" type="image/svg+xml" />
      <ReactRefresh />
      <ViteClient />
      <Script src="/src/client.tsx" />
      <Link href="/src/style.css" rel="stylesheet" />
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

export const rootView: RootView = (page) => '<!DOCTYPE html>' + renderToString(<Document page={page} />)
