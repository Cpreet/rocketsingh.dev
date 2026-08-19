import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

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
  const [isClosing, setIsClosing] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  // Derived during render so the panel stays mounted on the same commit that closes it.
  if (wasOpen !== open) {
    setWasOpen(open)
    setIsClosing(!open)
  }

  useEffect(() => {
    if (open) {
      const frame = window.requestAnimationFrame(() => setIsVisible(true))
      return () => window.cancelAnimationFrame(frame)
    }

    if (!isClosing) return

    setIsVisible(false)
    const timer = window.setTimeout(() => setIsClosing(false), 200)
    return () => window.clearTimeout(timer)
  }, [isClosing, open])

  useEffect(() => {
    if (!open) return

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }

    document.body.style.overflow = 'hidden'
    dialog.current?.focus()
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [onOpenChange, open])

  if (!open && !isClosing) return null

  // Portalled: the intake card is rotated, which would otherwise trap this fixed layer inside it.
  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-navy/55 p-4 transition-opacity duration-200 ease-out',
        isVisible ? 'opacity-100' : 'opacity-0',
      )}
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
          'w-full max-w-[30rem] rounded-[16px_24px_18px_22px] border border-ink/15 bg-paper p-0 text-ink shadow-[0_24px_70px_rgba(35,56,79,0.36)] outline-none transition-[opacity,translate,scale] duration-200 ease-out motion-reduce:transition-none',
          isVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.98] opacity-0',
          className,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}

export { Dialog }
