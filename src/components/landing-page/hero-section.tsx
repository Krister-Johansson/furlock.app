import { Link } from '@tanstack/react-router'
import { FileText, KeyRound, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { HyperText } from '@/components/ui/hyper-text'
import { TextAnimate } from '@/components/ui/text-animate'

export function HeroSection() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-6">
          <HyperText
            as="h1"
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] py-0"
            stagger={60}
            flips={8}
            flipDuration={50}
            startOnView
          >
            Split the secret.
          </HyperText>
          <HyperText
            as="h1"
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] text-primary py-0"
            delay={800}
            stagger={60}
            flips={8}
            flipDuration={50}
            startOnView
          >
            Share the trust.
          </HyperText>
        </div>
        <TextAnimate
          as="p"
          by="word"
          animation="blurInUp"
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4"
          duration={1.5}
          delay={1.0}
          once
        >
          Encrypt documents and split the key into multiple shares. No single
          person can unlock it alone — your pack holds the key.
        </TextAnimate>
        <p className="text-sm text-muted-foreground/70 mb-10 italic">
          Your pack holds the key.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/create">
            <Button size="lg" className="gap-2 text-base px-8">
              <FileText className="size-4" />
              Create a Secret Document
            </Button>
          </Link>
          <a href="#unlock">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 text-base px-8"
            >
              <KeyRound className="size-4" />I Have a Key
            </Button>
          </a>
        </div>
      </div>
    </section>
  )
}
