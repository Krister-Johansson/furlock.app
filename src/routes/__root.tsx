import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { FileText, Home, Search } from 'lucide-react'
import appCss from '../styles.css?url'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
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
  notFoundComponent: NotFound,
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

function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-20 sm:py-32 text-center">
      {/* Magnifying glass icon with subtle pulse ring */}
      <div className="relative inline-flex items-center justify-center mb-8">
        <span className="absolute size-24 rounded-full bg-primary/5 animate-ping animation-duration-[3s]" />
        <span className="absolute size-20 rounded-full bg-primary/10" />
        <span className="relative inline-flex items-center justify-center size-16 rounded-full bg-muted border border-border">
          <Search className="size-7 text-muted-foreground" aria-hidden="true" />
        </span>
      </div>

      <p className="text-sm font-mono text-primary mb-3">404</p>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
        Page not found
      </h1>
      <p className="text-muted-foreground max-w-sm mx-auto mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/">
          <Button size="lg" className="gap-2 px-6">
            <Home className="size-4" aria-hidden="true" />
            Back to Home
          </Button>
        </Link>
        <Link to="/create">
          <Button variant="outline" size="lg" className="gap-2 px-6">
            <FileText className="size-4" aria-hidden="true" />
            Create a Document
          </Button>
        </Link>
      </div>
    </div>
  )
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
