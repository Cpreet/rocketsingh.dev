import { Fragment, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Camera,
  Mail,
  MessageCircle,
  Route,
  Send,
  Target,
  type LucideIcon,
} from 'lucide-react'

import paperRocket from '@/assets/paper-rocket.svg'
import { buttonVariants } from '@/components/ui/button-variants'
import { cn } from '@/lib/utils'
import { isValidReplyEmail, kanbnIntakeService } from '@/services/intake'

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

function getContactStarters(objective: string) {
  const starterMessage = encodeURIComponent(
    `Hi rocketsingh — I'm trying to get this done: ${objective.trim()}`,
  )

  return [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${starterMessage}`,
      icon: MessageCircle,
    },
    {
      label: 'Telegram',
      href: `https://t.me/share/url?url=https%3A%2F%2Frocketsingh.dev&text=${starterMessage}`,
      icon: Send,
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/direct/new/',
      icon: Camera,
    },
    {
      label: 'Email',
      href: `mailto:?subject=${encodeURIComponent('Help me get this done')}&body=${starterMessage}`,
      icon: Mail,
    },
  ]
}

function BusinessCard() {
  const [objective, setObjective] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const contactStarters = getContactStarters(objective)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanedObjective = objective.trim()
    const cleanedEmail = email.trim()

    if (cleanedObjective.length < 5) {
      setError('Tell us a little more about what you are trying to finish.')
      setReceipt('')
      return
    }

    if (!isValidReplyEmail(cleanedEmail)) {
      setError('Enter a valid email address so we can reply.')
      setReceipt('')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const result = await kanbnIntakeService.submit({
        objective: cleanedObjective,
        source: 'card',
        email: cleanedEmail,
      })
      setReceipt(result.message)
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'We could not add that request to the desk. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
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
        rocketsingh.dev
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
              <p className="text-lg font-black tracking-[-0.045em] text-ink">rocketsingh.dev</p>
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
              Tell rocketsingh the outcome you need—even if the problem is messy. We’ll turn it into the
              shortest useful path forward.
            </p>
          </div>

          <ol className="mt-6 flex items-start justify-between gap-1" aria-label="How rocketsingh helps">
            {resolutionSteps.map((step, index) => (
              <Fragment key={step.stamp}>
                <ResolutionStep {...step} />
                {index < resolutionSteps.length - 1 ? (
                  <ArrowRight className="mt-3 size-3.5 shrink-0 text-ink-soft/30" aria-hidden="true" />
                ) : null}
              </Fragment>
            ))}
          </ol>

          <form className="mt-6" onSubmit={handleSubmit} noValidate>
            <label
              htmlFor="card-objective"
              className="font-mono text-[9px] font-black tracking-[0.14em] text-ink-soft uppercase"
            >
              What do you need to finish?
            </label>
            <div className="relative mt-2 overflow-hidden rounded-[10px_14px_9px_12px] border border-ink/10 bg-sky-pale/75 px-4 py-3.5">
              <span className="absolute top-0 bottom-0 left-0 w-1 bg-tan/80" aria-hidden="true" />
              <input
                id="card-objective"
                name="objective"
                type="text"
                required
                minLength={5}
                maxLength={500}
                autoComplete="off"
                value={objective}
                onChange={(event) => {
                  setObjective(event.target.value)
                  if (error) setError('')
                  if (receipt) setReceipt('')
                }}
                placeholder="What are you stuck on?"
                className="h-9 w-full border-0 border-b border-ink/15 bg-transparent px-0 text-[12px] font-semibold text-ink outline-none placeholder:text-slate-blue/80 focus-visible:border-ink/40"
                aria-describedby={error ? 'card-objective-error' : receipt ? 'card-objective-receipt' : undefined}
                aria-invalid={Boolean(error)}
              />
              <p className="mt-2 text-[9px] leading-relaxed font-medium text-ink-soft">
                Start messy. Add screenshots and files at the desk.
              </p>
            </div>

            <div className="mt-3">
              <label
                htmlFor="card-email"
                className="font-mono text-[9px] font-black tracking-[0.14em] text-ink-soft uppercase"
              >
                Email for a reply
              </label>
              <input
                id="card-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (error) setError('')
                  if (receipt) setReceipt('')
                }}
                placeholder="you@example.com"
                className="mt-1.5 h-9 w-full rounded-lg border border-ink/15 bg-white/65 px-3 text-[12px] font-semibold text-ink outline-none placeholder:text-slate-blue/70 focus-visible:border-ink/40 focus-visible:ring-2 focus-visible:ring-tan/60"
                aria-describedby={error ? 'card-objective-error' : undefined}
                aria-invalid={Boolean(error)}
              />
              <p className="mt-1 text-[9px] font-medium text-ink-soft">Only used to follow up on this request.</p>
            </div>

            {error ? (
              <p id="card-objective-error" className="mt-2 text-xs font-semibold text-error" role="alert">
                {error}
              </p>
            ) : null}

            {receipt ? (
              <p id="card-objective-receipt" className="mt-2 text-xs leading-relaxed font-semibold text-slate-blue" role="status">
                {receipt}
              </p>
            ) : null}

            <button
              type="submit"
              className={cn(buttonVariants({ size: 'lg' }), 'mt-5 w-full rounded-xl')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding it to the desk…' : 'Bring me a problem'}
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </form>

          <nav className="mt-4 border-t border-ink/10 pt-4" aria-label="Start in another app">
            <p className="font-mono text-[9px] font-black tracking-[0.14em] text-ink-soft uppercase">
              Or start where you already are
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {contactStarters.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={href.startsWith('mailto:') ? undefined : 'noreferrer'}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-ink/10 bg-white/55 px-3 py-2 text-[11px] font-bold text-ink-soft outline-none hover:border-ink/20 hover:bg-white hover:text-ink focus-visible:ring-2 focus-visible:ring-tan"
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </article>
    </main>
  )
}

export default BusinessCard
