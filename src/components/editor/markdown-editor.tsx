import { Suspense, lazy } from 'react'

const MDEditor = lazy(() => import('@uiw/react-md-editor'))
const MDPreview = lazy(() =>
  import('@uiw/react-md-editor').then((mod) => ({
    default: mod.default.Markdown,
  })),
)

interface MarkdownEditorProps {
  value: string
  onChange?: (value: string) => void
  className?: string
  editable?: boolean
}

export function MarkdownEditor({
  value,
  onChange,
  className,
  editable = true,
}: MarkdownEditorProps) {
  const containerClassName = className ? `font-mono ${className}` : 'font-mono'

  if (!editable) {
    return (
      <div data-color-mode="dark" className={containerClassName}>
        <Suspense
          fallback={<div className="animate-pulse h-24 bg-muted/30 rounded" />}
        >
          <MDPreview
            source={value}
            style={{ backgroundColor: 'transparent', color: 'inherit' }}
            className="prose prose-sm dark:prose-invert max-w-none"
          />
        </Suspense>
      </div>
    )
  }

  return (
    <div data-color-mode="dark" className={containerClassName}>
      <Suspense
        fallback={
          <div className="animate-pulse h-[300px] bg-muted/30 rounded" />
        }
      >
        <MDEditor
          value={value}
          onChange={(nextValue) => onChange?.(nextValue ?? '')}
          preview="edit"
          visibleDragbar={false}
          height={300}
          textareaProps={{
            placeholder: 'Write your document in Markdown...',
          }}
        />
      </Suspense>
    </div>
  )
}
