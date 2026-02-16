import { Code, Link2, Shield, Users } from 'lucide-react'

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 border-t border-border/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Built for trust
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Every design decision puts your security first.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <FeatureCard
            icon={<Shield className="size-5" />}
            title="End-to-end encrypted"
            description="Your document is encrypted in the browser. The server never sees the unencrypted content or the full encryption key."
          />
          <FeatureCard
            icon={<Users className="size-5" />}
            title="Threshold unlocking"
            description="No single person can unlock the document. You choose how many key holders must cooperate — 3 of 5, 2 of 7, whatever you need."
          />
          <FeatureCard
            icon={<Link2 className="size-5" />}
            title="Simple key sharing"
            description="Key holders receive a link — no sign-up, no app to install. When enough holders cooperate, the document unlocks instantly in the browser."
          />
          <FeatureCard
            icon={<Code className="size-5" />}
            title="Open source"
            description="Furlock is fully open source under AGPL-3.0. Inspect the code, verify the crypto, trust but verify. No funny business."
          />
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-6 hover:border-border transition-colors">
      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}
