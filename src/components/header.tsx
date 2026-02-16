import { Link } from '@tanstack/react-router'
import { Github, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/logo.svg"
            alt="Furlock"
            className="size-8 group-hover:opacity-80 transition-opacity"
          />
          <span className="font-semibold text-lg tracking-tight">
            Furlock
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/Krister-Johansson/furlock.app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="size-5" aria-hidden="true" />
          </a>
          <Link to="/create">
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Create Document</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
