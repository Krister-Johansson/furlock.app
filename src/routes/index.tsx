import { createFileRoute } from '@tanstack/react-router'
import { HeroSection } from '@/components/landing-page/hero-section'
import { AccessSection } from '@/components/landing-page/access-section'
import { HowItWorksSection } from '@/components/landing-page/how-it-works-section'
import { FeaturesSection } from '@/components/landing-page/features-section'
import { CtaSection } from '@/components/landing-page/cta-section'

export const Route = createFileRoute('/')({ component: LandingPage })

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
