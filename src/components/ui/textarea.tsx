import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'field-sizing-content min-h-28 w-full resize-none rounded-md border border-transparent bg-transparent px-1 py-1 text-[17px] leading-[34px] font-semibold text-ink outline-none placeholder:text-slate-blue/75 focus-visible:border-ink/15 focus-visible:ring-3 focus-visible:ring-tan/35 disabled:cursor-not-allowed disabled:opacity-50 md:text-lg',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
