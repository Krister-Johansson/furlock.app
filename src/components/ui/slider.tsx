import { cn } from '@/lib/utils'

interface SliderProps {
  value?: Array<number>
  defaultValue?: Array<number>
  onValueChange?: (value: Array<number>) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
}

function Slider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  className,
}: SliderProps) {
  const currentValue = value?.[0] ?? defaultValue?.[0] ?? min
  const percentage = ((currentValue - min) / (max - min)) * 100

  return (
    <div data-slot="slider" className={cn('relative w-full', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        disabled={disabled}
        onChange={(e) => {
          const v = Number(e.target.value)
          onValueChange?.([v])
        }}
        className="slider-input absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing z-10 disabled:cursor-not-allowed"
        style={{ margin: 0 }}
      />
      <div className="flex items-center py-2">
        <div className="relative w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-[width] duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-5 rounded-full border-2 border-primary bg-background shadow-sm pointer-events-none transition-[left] duration-75"
        style={{ left: `${percentage}%` }}
      />
    </div>
  )
}

export { Slider }
