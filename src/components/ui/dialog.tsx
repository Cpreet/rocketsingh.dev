import { useEffect, useRef, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface DialogProps {
  children: ReactNode
  className?: string
  labelledBy: string
  onOpenChange: (open: boolean) => void
  open: boolean
}

function Dialog({ children, className, labelledBy, onOpenChange, open }: DialogProps) {
  const dialog = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }

    dialog.current?.focus()
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [onOpenChange, open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-navy/55 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false)
      }}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={cn(
          'w-full max-w-[30rem] rounded-[16px_24px_18px_22px] border border-ink/15 bg-paper p-0 text-ink shadow-[0_24px_70px_rgba(35,56,79,0.36)] outline-none',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { Dialog }
