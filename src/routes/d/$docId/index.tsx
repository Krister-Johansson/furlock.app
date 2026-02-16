import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { KeyRound, Lock, Unlock, Users, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'
import type { Doc, Id } from '@convex/_generated/dataModel'
import { formatDateTime } from '@/lib/utils'
import { decryptWithShares, isValidMasterKey, isValidShare } from '@/lib/crypto'
import { useDocumentCrypto } from '@/hooks/useDocumentCrypto'
import { MarkdownEditor } from '@/components/editor/markdown-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type EncryptedDocument = Doc<'documents'> & {
  encryptedContent: string
  iv: string
  totalShares: number
  threshold: number
  createdAt: number
}

export const Route = createFileRoute('/d/$docId/')({
  component: DocumentPage,
})

function DocumentPage() {
  const { docId } = Route.useParams()
  const router = useRouter()
  const documentId = docId as Id<'documents'>
  const doc = useQuery(api.documents.get, { id: documentId })
  const { isUnlocked, unlockWithMasterKey, lock, decryptDocument } =
    useDocumentCrypto()

  const [masterKeyInput, setMasterKeyInput] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null)
  const [unlockMode, setUnlockMode] = useState<'master' | 'shares'>('master')
  const hasAutoUnlocked = useRef(false)

  // Auto-unlock if master key was passed via router state (e.g. from create flow)
  useEffect(() => {
    if (
      hasAutoUnlocked.current ||
      isUnlocked ||
      !doc ||
      !isEncryptedDocument(doc)
    )
      return
    const state = router.state.location.state as
      | { masterKey?: string }
      | undefined
    const key = state?.masterKey
    if (key && isValidMasterKey(key)) {
      hasAutoUnlocked.current = true
      window.history.replaceState(
        { ...window.history.state, masterKey: undefined },
        '',
      )
      void unlockWithMasterKey(key).then(async () => {
        try {
          const plaintext = await decryptDocument(doc.encryptedContent, doc.iv)
          const parsed = JSON.parse(plaintext) as { content?: string | null }
          setDecryptedContent(parsed.content ?? null)
        } catch {
          // Will show unlock form as fallback
        }
      })
    }
  }, [
    router.state.location.state,
    isUnlocked,
    unlockWithMasterKey,
    doc,
    decryptDocument,
  ])

  const handleMasterUnlock = async () => {
    if (!doc || !isEncryptedDocument(doc)) return
    const normalized = masterKeyInput.trim()
    if (!isValidMasterKey(normalized)) {
      toast.error('Invalid master key format')
      return
    }

    setIsUnlocking(true)
    try {
      await unlockWithMasterKey(normalized)
      const plaintext = await decryptDocument(doc.encryptedContent, doc.iv)
      const parsed = JSON.parse(plaintext) as { content?: string | null }
      setDecryptedContent(parsed.content ?? null)
      toast.success('Document decrypted')
    } catch {
      toast.error('Failed to decrypt — wrong key?')
    } finally {
      setIsUnlocking(false)
    }
  }

  const handleLock = () => {
    lock()
    setDecryptedContent(null)
    setMasterKeyInput('')
  }

  if (doc === undefined) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (doc === null || !isEncryptedDocument(doc)) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-muted mb-4">
          <XCircle className="size-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          Document not found
        </h1>
        <p className="text-muted-foreground text-sm">
          This document doesn't exist or has been deleted.
        </p>
      </div>
    )
  }

  // Locked state — unified unlock for both master key and shares
  if (decryptedContent === null && !isUnlocked) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-6">
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-muted mb-4">
            <Lock className="size-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            {doc.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            Decrypt with your master key or combine key shares for read-only
            access.
          </p>
        </div>

        {/* Toggle between master key and shares */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setUnlockMode('master')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              unlockMode === 'master'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <KeyRound className="size-3.5 inline mr-1.5 -mt-0.5" />
            Master Key
          </button>
          <button
            type="button"
            onClick={() => setUnlockMode('shares')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              unlockMode === 'shares'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="size-3.5 inline mr-1.5 -mt-0.5" />
            Key Shares
          </button>
        </div>

        {unlockMode === 'master' ? (
          <MasterKeyUnlock
            value={masterKeyInput}
            setValue={setMasterKeyInput}
            onUnlock={handleMasterUnlock}
            isUnlocking={isUnlocking}
          />
        ) : (
          <SharesUnlock
            doc={doc}
            onDecrypted={(content) => {
              setDecryptedContent(content)
              toast.success('Document decrypted (read-only)')
            }}
          />
        )}
      </div>
    )
  }

  // Decrypted state — read-only document view
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
            {doc.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Created {formatDateTime(new Date(doc.createdAt).toISOString())}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLock}
          className="gap-1.5 shrink-0"
        >
          <Lock className="size-3.5" />
          Lock
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {decryptedContent ? (
            <MarkdownEditor
              value={decryptedContent}
              editable={false}
              className="p-2"
            />
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">
              No document content.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Document Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Key shares</span>
            <span>
              {doc.threshold} of {doc.totalShares} required
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span>{formatDateTime(new Date(doc.createdAt).toISOString())}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MasterKeyUnlock({
  value,
  setValue,
  onUnlock,
  isUnlocking,
}: {
  value: string
  setValue: (value: string) => void
  onUnlock: () => void
  isUnlocking: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <KeyRound className="size-4" />
          Unlock with Master Key
        </CardTitle>
        <CardDescription>
          The master key stays in memory and is never stored or sent to the
          server.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onUnlock()
          }}
          placeholder="mk_..."
          className="font-mono text-xs"
          autoComplete="off"
          spellCheck={false}
        />
        <Button
          onClick={onUnlock}
          disabled={isUnlocking || !value.trim()}
          className="w-full gap-2"
        >
          {isUnlocking ? 'Decrypting...' : 'Decrypt Document'}
          {!isUnlocking && <Unlock className="size-4" />}
        </Button>
      </CardContent>
    </Card>
  )
}

function SharesUnlock({
  doc,
  onDecrypted,
}: {
  doc: EncryptedDocument
  onDecrypted: (content: string | null) => void
}) {
  const [shareInputs, setShareInputs] = useState<Array<string>>(
    Array.from({ length: doc.threshold }, () => ''),
  )
  const [isDecrypting, setIsDecrypting] = useState(false)

  const filledCount = shareInputs.filter((s) => s.trim().length > 0).length

  const handleDecrypt = async () => {
    const filledShares = shareInputs.map((s) => s.trim()).filter(Boolean)
    if (filledShares.length < doc.threshold) {
      toast.error(`Need at least ${doc.threshold} valid shares`)
      return
    }
    if (filledShares.some((s) => !isValidShare(s))) {
      toast.error('One or more share tokens are invalid')
      return
    }

    setIsDecrypting(true)
    try {
      const plaintext = await decryptWithShares(
        doc.encryptedContent,
        doc.iv,
        filledShares,
      )
      const parsed = JSON.parse(plaintext) as { content?: string | null }
      onDecrypted(parsed.content ?? null)
    } catch {
      toast.error('Failed to decrypt — check your shares')
    } finally {
      setIsDecrypting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="size-4" />
          Unlock with Key Shares
        </CardTitle>
        <CardDescription>
          Enter at least {doc.threshold} of {doc.totalShares} shares to decrypt.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {shareInputs.map((value, i) => (
          <Input
            key={i}
            placeholder={`Share #${i + 1} (sk_...)`}
            className="font-mono text-xs"
            value={value}
            onChange={(e) => {
              const next = [...shareInputs]
              next[i] = e.target.value
              setShareInputs(next)
            }}
            autoComplete="off"
            spellCheck={false}
          />
        ))}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareInputs([...shareInputs, ''])}
            disabled={shareInputs.length >= doc.totalShares}
          >
            Add Field
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShareInputs(shareInputs.slice(0, -1))}
            disabled={shareInputs.length <= doc.threshold}
          >
            Remove
          </Button>
        </div>
        <Button
          onClick={handleDecrypt}
          disabled={isDecrypting || filledCount < doc.threshold}
          className="w-full gap-2"
        >
          {isDecrypting ? 'Decrypting...' : 'Decrypt Document'}
          {!isDecrypting && <Unlock className="size-4" />}
        </Button>
      </CardContent>
    </Card>
  )
}

function isEncryptedDocument(doc: Doc<'documents'>): doc is EncryptedDocument {
  return (
    typeof doc.encryptedContent === 'string' &&
    typeof doc.iv === 'string' &&
    typeof doc.totalShares === 'number' &&
    typeof doc.threshold === 'number' &&
    typeof doc.createdAt === 'number'
  )
}
