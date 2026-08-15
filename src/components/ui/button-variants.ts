import { cva } from 'class-variance-authority'

const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-sm font-extrabold transition-[transform,box-shadow,background-color,color] outline-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-3 focus-visible:ring-tan/55 focus-visible:ring-offset-2 focus-visible:ring-offset-paper motion-reduce:transition-none',
  {
    variants: {
      variant: {
        default:
          'bg-ink text-white shadow-[0_2px_4px_rgba(35,56,79,0.18),3px_5px_10px_rgba(35,56,79,0.14)] hover:-translate-y-0.5 hover:bg-navy hover:shadow-[0_3px_6px_rgba(35,56,79,0.2),4px_7px_14px_rgba(35,56,79,0.16)]',
        paper:
          'border border-ink/10 bg-paper text-ink shadow-[3px_4px_10px_rgba(255,255,255,0.14)] hover:-translate-y-0.5 hover:bg-white',
        outline:
          'border border-ink/20 bg-white/50 text-ink hover:-translate-y-0.5 hover:bg-white',
        chip:
          'border border-dashed border-ink/25 bg-white/55 text-ink-soft hover:border-ink/45 hover:bg-white',
        ghost: 'text-ink-soft hover:bg-white/55 hover:text-ink',
      },
      size: {
        default: 'h-11 rounded-xl px-5',
        sm: 'h-9 rounded-full px-4 text-xs',
        lg: 'h-13 rounded-xl px-6 text-[15px]',
        icon: 'size-11 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export { buttonVariants }
