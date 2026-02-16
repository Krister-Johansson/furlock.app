import { createFileRoute } from '@tanstack/react-router'
import { HeroSection } from '@/components/landing-page/hero-section'
import { AccessSection } from '@/components/landing-page/access-section'
import { HowItWorksSection } from '@/components/landing-page/how-it-works-section'
import { FeaturesSection } from '@/components/landing-page/features-section'
import { CtaSection } from '@/components/landing-page/cta-section'
import {
  SITE_URL,
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  OG_IMAGE,
} from '@/lib/seo'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: DEFAULT_TITLE },
      { name: 'description', content: DEFAULT_DESCRIPTION },
      { property: 'og:title', content: DEFAULT_TITLE },
      { property: 'og:description', content: DEFAULT_DESCRIPTION },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:image', content: OG_IMAGE },
      { name: 'twitter:title', content: DEFAULT_TITLE },
      { name: 'twitter:description', content: DEFAULT_DESCRIPTION },
      { name: 'twitter:image', content: OG_IMAGE },
    ],
    links: [{ rel: 'canonical', href: SITE_URL }],
  }),
  component: LandingPage,
})

function LandingPage() {
  return (
    <>
      <HeroSection />
      <AccessSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CtaSection />
    </>
  )
}
