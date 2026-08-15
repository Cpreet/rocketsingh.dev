import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  className?: string
  label?: string
}

function Progress({ value, className, label }: ProgressProps) {
  const safeValue = Math.min(100, Math.max(0, value))

  return (
    <div
      data-slot="progress"
      className={cn('h-2.5 w-full overflow-hidden rounded-full bg-ink/10', className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(safeValue)}
    >
      <div
        className="h-full rounded-full bg-navy transition-[width] duration-300 motion-reduce:transition-none"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  )
}

export { Progress }
