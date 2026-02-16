import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import appCss from '../styles.css?url'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  OG_IMAGE,
} from '@/lib/seo'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: DEFAULT_TITLE },
      { name: 'description', content: DEFAULT_DESCRIPTION },
      { name: 'theme-color', content: '#000000' },
      // Open Graph
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: DEFAULT_TITLE },
      { property: 'og:description', content: DEFAULT_DESCRIPTION },
      { property: 'og:image', content: OG_IMAGE },
      { property: 'og:url', content: SITE_URL },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: DEFAULT_TITLE },
      { name: 'twitter:description', content: DEFAULT_DESCRIPTION },
      { name: 'twitter:image', content: OG_IMAGE },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
      { rel: 'apple-touch-icon', href: '/logo.svg' },
      { rel: 'canonical', href: SITE_URL },
      { rel: 'stylesheet', href: appCss },
    ],
  }),

  component: RootComponent,
  shellComponent: RootDocument,
})

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Any',
  image: OG_IMAGE,
  logo: `${SITE_URL}/logo.svg`,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  return (
    <ConvexProvider client={convex}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
        <Toaster />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      </TooltipProvider>
    </ConvexProvider>
  )
}
