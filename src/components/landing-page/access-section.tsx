import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ArrowRight, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function AccessSection() {
  return (
    <section
      id="unlock"
      className="py-20 px-4 sm:px-6 border-t border-border/30"
    >
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 mb-4">
            <KeyRound className="size-5 text-primary" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Access a document
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Enter the document ID you received. You&apos;ll be asked for your
            key on the next page.
          </p>
        </div>
        <DocumentIdForm />
      </div>
    </section>
  )
}

function DocumentIdForm() {
  const navigate = useNavigate()
  const [docId, setDocId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = docId.trim()
    if (!trimmed) return
    navigate({ to: '/d/$docId', params: { docId: trimmed } })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter document ID (e.g. doc_abc123)"
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
          className="font-mono text-sm"
          autoComplete="off"
          spellCheck={false}
        />
        <Button
          type="submit"
          disabled={!docId.trim()}
          className="gap-1.5 shrink-0"
        >
          <ArrowRight className="size-4" />
          Go
        </Button>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        You&apos;ll be asked for your master key or key shares on the document
        page.
      </p>
    </form>
  )
}
