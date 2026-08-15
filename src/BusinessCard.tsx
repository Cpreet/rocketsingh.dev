import { Fragment, useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Download,
  LockKeyhole,
  Route,
  Sparkles,
  Target,
  UserRoundCheck,
  type LucideIcon,
} from 'lucide-react'

import paperRocket from '@/assets/paper-rocket.svg'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'

type Notice = { message: string; key: number } | null

const resolutionSteps: {
  icon: LucideIcon
  stamp: string
  title: string
  detail: string
  tone: string
}[] = [
  {
    icon: Target,
    stamp: 'ASK',
    title: 'Name the finish',
    detail: 'Tell us what you need done.',
    tone: 'bg-sky-deep text-white',
  },
  {
    icon: Route,
    stamp: 'MOVE',
    title: 'Take the next step',
    detail: 'Get one clear action at a time.',
    tone: 'bg-tan text-ink',
  },
  {
    icon: BadgeCheck,
    stamp: 'DONE',
    title: 'Check it worked',
    detail: 'Finish with a result you can see.',
    tone: 'bg-navy text-white',
  },
]

function ResolutionStep({
  icon: Icon,
  stamp,
  title,
  detail,
  tone,
}: (typeof resolutionSteps)[number]) {
  return (
    <li className="flex min-w-0 flex-1 flex-col items-center text-center">
      <span
        className={cn(
          'grid size-10 place-content-center rounded-full shadow-[0_3px_8px_rgba(35,56,79,0.2)] ring-2 ring-white/70',
          tone,
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="mt-2 font-mono text-[9px] font-black tracking-[0.15em] text-ink-soft uppercase">
        {stamp}
      </span>
      <span className="mt-1 text-[11px] leading-tight font-extrabold text-ink">{title}</span>
      <span className="mt-0.5 max-w-[92px] text-[9px] leading-[1.35] font-medium text-ink-soft">
        {detail}
      </span>
    </li>
  )
}

const VCARD = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'FN:rckt.dev',
  'ORG:rckt.dev',
  'TITLE:The little resolution desk on the internet',
  'URL:https://rckt.dev',
  "NOTE:Bring the thing you're stuck on. rckt turns it into a clear path to done.",
  'END:VCARD',
  '',
].join('\n')

function saveContact() {
  const blob = new Blob([VCARD], { type: 'text/vcard' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'rckt.dev.vcf'
  link.click()
  URL.revokeObjectURL(url)
}

function BusinessCard() {
  const [notice, setNotice] = useState<Notice>(null)

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 3200)
    return () => window.clearTimeout(timer)
  }, [notice])

  function announce(message: string) {
    setNotice({ message, key: Date.now() })
  }

  return (
    <main className="hero-panel relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">
      <div className="hero-grid absolute inset-0" aria-hidden="true" />
      <div className="absolute -top-24 -left-24 size-72 rounded-full bg-white/40 blur-3xl" aria-hidden="true" />
      <div className="absolute right-[-4rem] bottom-[-4rem] size-96 rounded-full bg-navy/15 blur-3xl" aria-hidden="true" />
      <span className="hero-tick top-10 left-10 hidden sm:block" aria-hidden="true" />
      <span className="hero-tick right-12 bottom-16 hidden sm:block" aria-hidden="true" />

      <a
        href="/"
        className="fixed top-5 left-5 z-20 inline-flex items-center gap-1.5 rounded-full border border-ink/12 bg-paper/80 px-3 py-1.5 text-xs font-semibold text-ink-soft backdrop-blur outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-tan"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        rckt.dev
      </a>

      <article className="relative z-10 w-full max-w-[410px]" aria-labelledby="card-title">
        <div
          className="absolute inset-0 -z-10 rotate-[2.4deg] rounded-[16px_24px_18px_22px] border border-ink/10 bg-tan/50 shadow-[0_18px_40px_rgba(35,56,79,0.14)]"
          aria-hidden="true"
        />

        <div className="paper-tape relative -rotate-[1.1deg] rounded-[14px_22px_16px_20px] border border-ink/15 bg-paper px-7 pt-7 pb-6 shadow-[6px_9px_18px_rgba(35,56,79,0.12),0_26px_54px_rgba(35,56,79,0.2)] sm:px-8">
          <header className="flex items-center gap-3">
            <img
              src={paperRocket}
              alt=""
              aria-hidden="true"
              className="size-9 shrink-0 rotate-[18deg] drop-shadow-[1px_2px_2px_rgba(35,56,79,0.3)]"
            />
            <div className="min-w-0">
              <p className="text-lg font-black tracking-[-0.045em] text-ink">rckt.dev</p>
              <p className="font-mono text-[9px] font-bold tracking-[0.13em] text-ink-soft uppercase">
                The little resolution desk
              </p>
            </div>
          </header>

          <div className="mt-6">
            <p className="font-mono text-[10px] font-black tracking-[0.16em] text-slate-blue uppercase">
              Small thing. Stuck?
            </p>
            <h1
              id="card-title"
              className="mt-2 text-[2rem] leading-[0.98] font-black tracking-[-0.065em] text-ink"
            >
              Bring it here.
              <br />
              Leave with it <span className="scribble">done.</span>
            </h1>
            <p className="mt-3 max-w-[35ch] text-[13px] leading-[1.55] font-medium text-ink-soft">
              Tell rckt the outcome you need—even if the problem is messy. We’ll turn it into the
              shortest useful path forward.
            </p>
          </div>

          <ol className="mt-6 flex items-start justify-between gap-1" aria-label="How rckt helps">
            {resolutionSteps.map((step, index) => (
              <Fragment key={step.stamp}>
                <ResolutionStep {...step} />
                {index < resolutionSteps.length - 1 ? (
                  <ArrowRight className="mt-3 size-3.5 shrink-0 text-ink-soft/30" aria-hidden="true" />
                ) : null}
              </Fragment>
            ))}
          </ol>

          <aside className="relative mt-6 overflow-hidden rounded-[10px_14px_9px_12px] border border-ink/10 bg-sky-pale/75 px-4 py-3.5">
            <span className="absolute top-0 bottom-0 left-0 w-1 bg-tan/80" aria-hidden="true" />
            <p className="font-mono text-[9px] font-black tracking-[0.14em] text-ink-soft uppercase">
              Bring the real thing
            </p>
            <p className="mt-1.5 text-[11px] leading-[1.5] font-semibold text-ink">
              A confusing form, a broken device, a stubborn file—or just “this thing isn’t
              working.”
            </p>
          </aside>

          <a
            href="/#ask"
            className={cn(buttonVariants({ size: 'lg' }), 'mt-5 w-full rounded-xl')}
          >
            Bring me a problem
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink/10 pt-4">
            <div className="space-y-1.5">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold text-ink-soft">
                <LockKeyhole className="size-3 shrink-0" aria-hidden="true" />
                Private by default
              </p>
              <p className="flex items-center gap-1.5 text-[10px] font-semibold text-ink-soft">
                <UserRoundCheck className="size-3 shrink-0" aria-hidden="true" />
                A person can step in
              </p>
            </div>
            <button
              type="button"
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-ink/6 px-3 py-2 text-[11px] font-bold text-ink-soft outline-none hover:bg-ink/10 hover:text-ink focus-visible:ring-2 focus-visible:ring-tan"
              onClick={() => {
                saveContact()
                announce('rckt.dev saved to your contacts.')
              }}
            >
              <Download className="size-3.5" aria-hidden="true" />
              Save card
            </button>
          </div>
        </div>
      </article>

      <div
        key={notice?.key}
        className={cn(
          'pointer-events-none fixed bottom-5 left-1/2 z-[70] flex w-[min(440px,calc(100%-28px))] -translate-x-1/2 translate-y-3 items-center gap-2.5 rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-white opacity-0 shadow-[0_18px_50px_rgba(35,56,79,0.25)] transition-all duration-200',
          notice && 'translate-y-0 opacity-100',
        )}
        role="status"
        aria-live="polite"
      >
        <Sparkles className="size-4 shrink-0 text-tape" aria-hidden="true" />
        {notice?.message}
      </div>
    </main>
  )
}

export default BusinessCard
