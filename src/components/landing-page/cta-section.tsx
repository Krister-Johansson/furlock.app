import { Link } from '@tanstack/react-router'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section className="py-20 px-4 sm:px-6 border-t border-border/30">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
          Ready to secure your secrets?
        </h2>
        <p className="text-muted-foreground mb-8">
          No account needed. No tracking. Just encryption.
        </p>
        <Link to="/create">
          <Button size="lg" className="gap-2 text-base px-8">
            <Lock className="size-4" aria-hidden="true" />
            Create Your First Document
          </Button>
        </Link>
      </div>
    </section>
  )
}
