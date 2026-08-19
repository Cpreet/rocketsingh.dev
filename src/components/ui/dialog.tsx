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
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const element = dialog.current
    if (!element) return

    if (open && !element.open) {
      element.showModal()
    } else if (!open && element.open) {
      element.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialog}
      aria-labelledby={labelledBy}
      className={cn(
        'm-auto w-[min(100%-2rem,30rem)] rounded-[16px_24px_18px_22px] border border-ink/15 bg-paper p-0 text-ink shadow-[0_24px_70px_rgba(35,56,79,0.36)] backdrop:bg-navy/55',
        className,
      )}
      onCancel={(event) => {
        event.preventDefault()
        onOpenChange(false)
      }}
      onClose={() => onOpenChange(false)}
    >
      {children}
    </dialog>
  )
}

export { Dialog }
