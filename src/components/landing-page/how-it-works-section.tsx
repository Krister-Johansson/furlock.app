import { FileText, KeyRound, Share2 } from 'lucide-react'

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 px-4 sm:px-6 border-t border-border/30"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            How it works
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Three simple steps to secure your documents with threshold
            encryption.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 sm:gap-12">
          <StepCard
            step={1}
            icon={<FileText className="size-5" />}
            title="Write your document"
            description="Create your secret document with our rich text editor. The content is encrypted client-side before it ever leaves your browser."
          />
          <StepCard
            step={2}
            icon={<KeyRound className="size-5" />}
            title="Split the key"
            description="Choose how many keys to create and how many are needed to unlock. The encryption key is split using Shamir's Secret Sharing."
          />
          <StepCard
            step={3}
            icon={<Share2 className="size-5" />}
            title="Share with your pack"
            description="Distribute keys to your trusted key holders. When they gather enough shares, they decrypt the document together in the browser."
          />
        </div>
      </div>
    </section>
  )
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: number
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 relative">
        {icon}
        <span className="absolute -top-2 -right-2 size-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
          {step}
        </span>
      </div>
      <h3 className="font-semibold text-base mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}
