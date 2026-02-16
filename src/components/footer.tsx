import { Lock } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-border/30 py-10 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="size-3.5" />
          <span>Furlock — Built with Shamir's Secret Sharing</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a
            href="https://github.com/Krister-Johansson/furlock.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Learn about SSS
          </a>
        </div>
      </div>
    </footer>
  )
}
