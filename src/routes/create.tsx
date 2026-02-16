import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardCopy,
  ExternalLink,
  FileText,
  KeyRound,
  Loader2,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'
import { api } from '@convex/_generated/api'
import { MarkdownEditor } from '@/components/editor/markdown-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useDocumentCrypto } from '@/hooks/useDocumentCrypto'

export const Route = createFileRoute('/create')({ component: CreatePage })

const STEPS = [
  { label: 'Document', icon: FileText },
  { label: 'Encrypt', icon: ShieldCheck },
  { label: 'Keys', icon: KeyRound },
] as const

interface CreationResult {
  docId: string
  masterToken: string
  keyHolderTokens: Array<{ index: number; token: string }>
}

function CreatePage() {
  const navigate = useNavigate()
  const createDocument = useMutation(api.documents.createDocument)
  const {
    isUnlocked,
    masterKeyString,
    generateAndUnlock,
    encryptForCreate,
    generateReadShares,
  } = useDocumentCrypto()

  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [totalShares, setTotalShares] = useState(5)
  const [threshold, setThreshold] = useState(3)
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null)
  const [creationResult, setCreationResult] = useState<CreationResult | null>(
    null,
  )

  const canProceed = title.trim().length > 0
  const canCreate = useMemo(
    () => title.trim().length > 0 && threshold >= 2 && totalShares >= threshold,
    [title, threshold, totalShares],
  )

  // Auto-generate master key when entering step 2
  useEffect(() => {
    if (step === 1 && !isUnlocked) {
      void generateAndUnlock()
    }
  }, [step, isUnlocked, generateAndUnlock])

  // Warn before leaving when keys are visible (step 3)
  useEffect(() => {
    if (step !== 2 || !creationResult) return

    const warnBeforeLeave = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        window.location.reload()
      }
    }

    window.addEventListener('beforeunload', warnBeforeLeave)
    window.addEventListener('pageshow', handlePageShow)
    return () => {
      window.removeEventListener('beforeunload', warnBeforeLeave)
      window.removeEventListener('pageshow', handlePageShow)
    }
  }, [step, creationResult])

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(label)
    toast.success(`${label} copied`)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleCreate = async () => {
    if (!isUnlocked || !masterKeyString) return
    setIsCreating(true)

    try {
      const plaintext = JSON.stringify({
        title,
        content: content.trim().length > 0 ? content : null,
      })

      const { encryptedContent, iv } = await encryptForCreate(plaintext)
      const shares = generateReadShares(totalShares, threshold)
      const docId = await createDocument({
        title,
        encryptedContent,
        iv,
        totalShares,
        threshold,
      })

      const tokens = shares.map((token, i) => ({
        index: i + 1,
        token,
      }))

      setCreationResult({
        docId,
        masterToken: masterKeyString,
        keyHolderTokens: tokens,
      })
      setStep(2)
    } catch (err) {
      console.error('[Furlock] Document creation failed:', err)
      toast.error('Failed to create document', {
        description: 'Something went wrong while encrypting the document.',
      })
      setIsCreating(false)
    }
  }

  const goToStep = (target: number) => {
    if (target === 2) return
    if (target < step && step < 2) {
      setStep(target)
    } else if (target === 1 && canProceed && step === 0) {
      setStep(1)
    }
  }

  const docUrl = creationResult
    ? `${window.location.origin}/d/${creationResult.docId}`
    : null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {step === 2 ? 'Document created' : 'Create encrypted document'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === 2
              ? 'Save these keys carefully. They will not be shown again.'
              : 'Content is encrypted client-side before it leaves your browser.'}
          </p>
        </div>

        {/* Step indicator */}
        <nav aria-label="Progress" className="flex items-center gap-3">
          {STEPS.map(({ label, icon: Icon }, i) => {
            const isActive = i === step
            const isCompleted = i < step
            return (
              <button
                key={label}
                type="button"
                onClick={() => goToStep(i)}
                disabled={i === 2 || (step === 2 && i < 2)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isCompleted
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                } ${i === 2 || (step === 2 && i < 2) ? 'cursor-default' : ''}`}
              >
                <span className="flex items-center justify-center size-5 rounded-full bg-background/20 text-xs font-bold">
                  {isCompleted ? '✓' : i + 1}
                </span>
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
              </button>
            )
          })}
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground">
            Step {step + 1} of {STEPS.length}
          </span>
        </nav>

        {/* Step 1: Document */}
        {step === 0 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Document</CardTitle>
                <CardDescription>
                  Title is public metadata. Body stays encrypted.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Emergency Recovery Instructions"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Body</Label>
                  <div className="rounded-lg border border-border bg-card min-h-[300px] overflow-hidden">
                    <MarkdownEditor
                      value={content}
                      onChange={setContent}
                      className="p-4"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(1)}
                disabled={!canProceed}
                className="gap-2"
              >
                Next: Configure shares
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Configure & Encrypt */}
        {step === 1 && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" aria-hidden="true" />
                  <CardTitle className="text-base">
                    Key holder shares
                  </CardTitle>
                </div>
                <CardDescription>
                  Split into shares for read-only access. Require a minimum
                  threshold to decrypt.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="totalShares">Total shares</Label>
                    <span className="text-sm font-mono font-semibold tabular-nums text-primary">
                      {totalShares}
                    </span>
                  </div>
                  <Slider
                    value={[totalShares]}
                    onValueChange={([next]) => {
                      setTotalShares(next)
                      if (threshold > next) setThreshold(next)
                    }}
                    min={2}
                    max={20}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    How many key shares to generate (2–20)
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="threshold">Threshold to unlock</Label>
                    <span className="text-sm font-mono font-semibold tabular-nums text-primary">
                      {threshold}
                    </span>
                  </div>
                  <Slider
                    value={[threshold]}
                    onValueChange={([next]) => setThreshold(next)}
                    min={2}
                    max={totalShares}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum shares needed to decrypt (2–{totalShares})
                  </p>
                </div>

                <div className="rounded-md bg-muted/50 border border-border p-3 text-sm text-muted-foreground">
                  Any <strong className="text-foreground">{threshold}</strong>{' '}
                  of{' '}
                  <strong className="text-foreground">{totalShares}</strong>{' '}
                  key holders can decrypt the document for read access.
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(0)}
                className="gap-2"
              >
                <ArrowLeft className="size-4" aria-hidden="true" />
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!canCreate || !isUnlocked || isCreating}
                className="gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Encrypting…
                  </>
                ) : !isUnlocked ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Preparing…
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" aria-hidden="true" />
                    Encrypt & Create
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <FileText className="size-3.5" aria-hidden="true" />
              All cryptographic operations run in your browser using Web Crypto.
            </div>
          </>
        )}

        {/* Step 3: Keys & Results */}
        {step === 2 && creationResult && (
          <>
            <Alert
              variant="default"
              className="border-amber-500/30 bg-amber-500/5"
            >
              <AlertTriangle className="size-4 text-amber-500" aria-hidden="true" />
              <AlertDescription className="text-sm">
                <strong>
                  Save all keys now. They will not be stored or shown again.
                </strong>
              </AlertDescription>
            </Alert>

            {/* Document link */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                  <CardTitle className="text-base">Document</CardTitle>
                </div>
                <CardDescription>
                  Share this link so others can access the document.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Document ID
                  </Label>
                  <div className="rounded-md border bg-muted/50 p-3 flex items-center gap-2">
                    <code className="text-xs font-mono text-foreground truncate flex-1 select-all">
                      {creationResult.docId}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 shrink-0"
                      aria-label="Copy document ID"
                      onClick={() =>
                        handleCopy(creationResult.docId, 'Document ID')
                      }
                    >
                      {copiedIndex === 'Document ID' ? (
                        <Check className="size-3.5 text-green-500" aria-hidden="true" />
                      ) : (
                        <ClipboardCopy className="size-3.5" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>
                {docUrl && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">URL</Label>
                    <div className="rounded-md border bg-muted/50 p-3 flex items-center gap-2">
                      <code className="text-xs font-mono text-foreground truncate flex-1 select-all">
                        {docUrl}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 shrink-0"
                        aria-label="Copy document URL"
                        onClick={() => handleCopy(docUrl, 'URL')}
                      >
                        {copiedIndex === 'URL' ? (
                          <Check className="size-3.5 text-green-500" aria-hidden="true" />
                        ) : (
                          <ClipboardCopy className="size-3.5" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Master key */}
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <KeyRound className="size-4 text-primary" aria-hidden="true" />
                  <CardTitle className="text-base">Master key</CardTitle>
                </div>
                <CardDescription>
                  Full access — decrypt the document anytime. Back this up
                  securely.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-primary/20 bg-primary/5 p-3 flex items-center gap-2">
                  <code className="text-xs font-mono text-muted-foreground truncate flex-1 select-all">
                    {creationResult.masterToken}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 shrink-0"
                    onClick={() =>
                      handleCopy(creationResult.masterToken, 'Master key')
                    }
                  >
                    {copiedIndex === 'Master key' ? (
                      <Check className="size-3.5 text-green-500" aria-hidden="true" />
                    ) : (
                      <ClipboardCopy className="size-3.5" aria-hidden="true" />
                    )}
                    {copiedIndex === 'Master key' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Key holder shares */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" aria-hidden="true" />
                  <CardTitle className="text-base">
                    Key holder shares
                  </CardTitle>
                </div>
                <CardDescription>
                  Read-only access. Any <strong>{threshold}</strong> of{' '}
                  <strong>{totalShares}</strong> shares can decrypt. Distribute
                  each share to a different key holder.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {creationResult.keyHolderTokens.map(({ index, token }) => {
                  const label = `Share #${index}`
                  return (
                    <div
                      key={index}
                      className="rounded-md border bg-muted/50 p-3 flex items-center gap-2"
                    >
                      <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">
                        #{index}
                      </span>
                      <code className="text-xs font-mono text-muted-foreground truncate flex-1 select-all">
                        {token}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 shrink-0"
                        aria-label={`Copy ${label}`}
                        onClick={() => handleCopy(token, label)}
                      >
                        {copiedIndex === label ? (
                          <Check className="size-3.5 text-green-500" aria-hidden="true" />
                        ) : (
                          <ClipboardCopy className="size-3.5" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                className="gap-2"
                onClick={() =>
                  navigate({
                    to: '/d/$docId',
                    params: { docId: creationResult.docId },
                    state: { masterKey: creationResult.masterToken },
                    replace: true,
                  })
                }
              >
                Go to document
                <ExternalLink className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </>
        )}
    </div>
  )
}
