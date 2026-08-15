import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ImagePlus,
  Mail,
  MessageCircle,
  Paperclip,
  Sparkles,
  UserRoundCheck,
  X,
} from 'lucide-react'

import avatar from '@/assets/avatar.webp'
import paperRocket from '@/assets/paper-rocket.svg'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { prototypeIntakeService } from '@/services/intake'

const promptSamples = [
  "My printer won't connect to my laptop.",
  'What am I supposed to fill in this form?',
  'Am I eligible for this programme?',
  'I need to move my domain without breaking email.',
  'Can you make this spreadsheet usable?',
]

const processSteps = [
  {
    stamp: '01 / ASK',
    title: 'Show us the snag.',
    body: 'Write it badly. Send a screenshot. Drop the file. Start with whatever you know.',
    rotation: '-rotate-[0.5deg]',
  },
  {
    stamp: '02 / FOLLOW',
    title: 'Get a clear path.',
    body: 'We turn the problem into a practical sequence with checks, caveats and next steps.',
    rotation: 'rotate-[0.35deg]',
  },
  {
    stamp: '03 / DONE',
    title: 'Finish the job.',
    body: 'Follow it yourself, use a tool, or hand the awkward part to a real person.',
    rotation: '-rotate-[0.2deg]',
  },
]

const questions = [
  {
    text: '“My printer says it’s offline, but it’s right there.”',
    className: 'bg-note-amber -rotate-1 lg:col-span-4',
  },
  {
    text: '“What am I supposed to write in this field?”',
    className: 'bg-note-sky rotate-[0.8deg] lg:col-span-4',
  },
  {
    text: '“Am I actually eligible for this application?”',
    className: 'bg-note-clay -rotate-[0.35deg] lg:col-span-4',
  },
  {
    text: '“Can someone move this domain without breaking email?”',
    className: 'bg-paper rotate-[0.5deg] lg:col-span-4 lg:col-start-2',
  },
  {
    text: '“This spreadsheet is a mess. I just need the useful bits.”',
    className: 'bg-note-sage -rotate-[0.65deg] lg:col-span-4',
  },
  {
    text: '“I clicked something and now the Wi-Fi is gone.”',
    className: 'bg-note-lilac rotate-1 lg:col-span-3',
  },
]

const recipeSteps = [
  {
    title: 'Put the printer into network setup mode',
    detail:
      'Hold the wireless button until the indicator blinks. If it stays solid, stop—your model may use a different reset sequence.',
  },
  {
    title: 'Join the printer to your Wi-Fi',
    detail:
      'Use the printer app or control panel to select your network. Keep your Wi-Fi password nearby.',
  },
  {
    title: 'Print a test page from another device',
    detail:
      'You are done when another device on the same network can discover the printer and print successfully.',
  },
]

type Notice = { message: string; key: number } | null

function Logo() {
  return (
    <a
      href="#top"
      className="inline-flex items-center gap-2.5 rounded-md text-[23px] font-black tracking-[-0.055em] text-ink outline-none focus-visible:ring-3 focus-visible:ring-tan/60"
      aria-label="rckt.dev home"
    >
      <img
        src={paperRocket}
        alt=""
        aria-hidden="true"
        className="size-8 rotate-[18deg] drop-shadow-[1px_2px_2px_rgba(35,56,79,0.3)]"
      />
      <span>rckt.dev</span>
    </a>
  )
}

function Stamp({ children }: { children: string }) {
  return (
    <span className="inline-flex -rotate-[0.5deg] border border-ink/12 bg-paper px-3 py-2 font-mono text-[11px] leading-none font-black tracking-[0.14em] text-ink-soft uppercase shadow-[2px_3px_7px_rgba(35,56,79,0.1)]">
      {children}
    </span>
  )
}

interface IntakeDeskProps {
  announce: (message: string) => void
}

function IntakeDesk({ announce }: IntakeDeskProps) {
  const [objective, setObjective] = useState('')
  const [promptIndex, setPromptIndex] = useState(0)
  const [isFocused, setIsFocused] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const screenshotInput = useRef<HTMLInputElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (objective || isFocused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const timer = window.setInterval(() => {
      setPromptIndex((current) => (current + 1) % promptSamples.length)
    }, 3200)

    return () => window.clearInterval(timer)
  }, [isFocused, objective])

  function addFiles(selected: FileList | null) {
    if (!selected?.length) return

    const nextFiles = [...files, ...Array.from(selected)].slice(0, 3)
    setFiles(nextFiles)
    announce(
      `${selected.length} ${selected.length === 1 ? 'file' : 'files'} staged for this request.`,
    )
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanedObjective = objective.trim()

    if (cleanedObjective.length < 5) {
      setError('Tell us a little more about what you are trying to finish.')
      setReceipt('')
      return
    }

    setError('')
    setIsSubmitting(true)

    const result = await prototypeIntakeService.submit({
      objective: cleanedObjective,
      attachments: files.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
      })),
    })

    setReceipt(result.message)
    setIsSubmitting(false)
    announce('Request captured for this preview.')
  }

  function unavailableChannel(channel: string) {
    announce(`${channel} will be available when the live desk opens.`)
  }

  return (
    <form
      id="ask"
      className="paper-tape relative z-20 mx-auto mt-10 w-full max-w-[650px] -rotate-[0.25deg] rounded-[8px_16px_10px_14px] border border-ink/15 bg-paper p-4 shadow-[6px_9px_18px_rgba(35,56,79,0.1),0_22px_50px_rgba(35,56,79,0.17)] sm:p-6 lg:absolute lg:bottom-10 lg:left-10 lg:mx-0 lg:mt-0"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label htmlFor="objective" className="text-[15px] font-extrabold sm:text-base">
          What are you trying to get done?
        </label>
        <span className="hidden font-mono text-[10px] font-bold tracking-[0.1em] text-ink-soft sm:inline">
          NO JARGON REQUIRED
        </span>
      </div>

      <div className="ruled-field rounded-md">
        <Textarea
          id="objective"
          value={objective}
          placeholder={promptSamples[promptIndex]}
          onChange={(event) => {
            setObjective(event.target.value)
            if (error) setError('')
            if (receipt) setReceipt('')
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          aria-describedby={error ? 'objective-error' : receipt ? 'objective-receipt' : undefined}
          aria-invalid={Boolean(error)}
        />
      </div>

      {error ? (
        <p id="objective-error" className="mt-2 text-sm font-semibold text-error" role="alert">
          {error}
        </p>
      ) : null}

      {files.length ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Files ready to attach">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}`}
              className="flex max-w-full items-center gap-1.5 rounded-full border border-ink/12 bg-white/70 py-1 pr-1 pl-3 text-xs font-semibold text-ink-soft"
            >
              <span className="max-w-44 truncate">{file.name}</span>
              <button
                type="button"
                className="grid size-7 cursor-pointer place-content-center rounded-full outline-none hover:bg-ink/8 focus-visible:ring-2 focus-visible:ring-tan"
                onClick={() => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                aria-label={`Remove ${file.name}`}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <input
          ref={screenshotInput}
          className="sr-only"
          type="file"
          accept="image/*"
          onChange={(event) => addFiles(event.target.files)}
          tabIndex={-1}
        />
        <input
          ref={fileInput}
          className="sr-only"
          type="file"
          accept=".pdf,.csv,.xls,.xlsx,.doc,.docx,.txt,image/*"
          multiple
          onChange={(event) => addFiles(event.target.files)}
          tabIndex={-1}
        />
        <Button variant="chip" size="sm" onClick={() => screenshotInput.current?.click()}>
          <ImagePlus className="size-4" aria-hidden="true" />
          Screenshot
        </Button>
        <Button variant="chip" size="sm" onClick={() => fileInput.current?.click()}>
          <Paperclip className="size-4" aria-hidden="true" />
          File
        </Button>
        <Button
          type="submit"
          size="lg"
          className="mt-1 w-full sm:mt-0 sm:ml-auto sm:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Making a start…' : 'Get me unstuck'}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>

      {receipt ? (
        <div
          id="objective-receipt"
          className="mt-4 flex items-start gap-2.5 rounded-lg border border-navy/15 bg-sky-pale/70 p-3 text-sm leading-relaxed text-ink-soft"
          role="status"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-navy" aria-hidden="true" />
          <span>{receipt}</span>
        </div>
      ) : null}

      <div className="mt-3 hidden flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-soft/80 sm:flex">
        <span>Prefer another place?</span>
        {['WhatsApp', 'Telegram', 'Email'].map((channel) => (
          <button
            key={channel}
            type="button"
            className="cursor-pointer border-b border-dotted border-ink/30 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-tan"
            onClick={() => unavailableChannel(channel)}
          >
            {channel}
          </button>
        ))}
      </div>
    </form>
  )
}

function RecipePreview({ announce }: IntakeDeskProps) {
  const [completed, setCompleted] = useState<boolean[]>(recipeSteps.map(() => false))
  const count = completed.filter(Boolean).length
  const progress = (count / recipeSteps.length) * 100

  function updateStep(index: number, checked: boolean) {
    const next = completed.map((value, itemIndex) => (itemIndex === index ? checked : value))
    setCompleted(next)

    if (next.every(Boolean)) {
      announce('Done. That is the feeling rckt is built around.')
    }
  }

  return (
    <section id="sample" className="grid scroll-mt-24 gap-10 pt-20 lg:grid-cols-[0.82fr_1.18fr] lg:pt-28">
      <div className="self-start lg:sticky lg:top-28 lg:pt-7">
        <Stamp>Not just an answer</Stamp>
        <h2 className="mt-5 max-w-lg text-[clamp(2.4rem,5vw,4.15rem)] leading-[0.96] font-black tracking-[-0.06em] text-ink">
          A path you can actually finish.
        </h2>
        <p className="mt-5 max-w-xl text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
          A rckt recipe has an objective, useful checks, concrete steps and a fallback for when
          reality disagrees with the instructions.
        </p>
        <div className="mt-7 flex items-center gap-3 font-mono text-[11px] font-black tracking-[0.12em] text-ink-soft uppercase">
          <span className="grid size-8 place-content-center rounded-full border-2 border-navy text-navy">
            <Check className="size-4" aria-hidden="true" />
          </span>
          Done has a definition
        </div>
      </div>

      <div className="recipe-paper relative rotate-[0.2deg] overflow-hidden border border-ink/15 bg-paper p-5 shadow-[6px_9px_20px_rgba(35,56,79,0.09)] sm:p-9">
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] font-black tracking-[0.12em] text-ink-soft uppercase">
                Goal
              </p>
              <h3 className="mt-2 max-w-lg text-2xl leading-tight font-black tracking-[-0.04em] text-ink sm:text-[28px]">
                Reconnect a printer to home Wi-Fi
              </h3>
            </div>
            <span className="-rotate-3 border-2 border-navy/55 px-2.5 py-1 font-mono text-[10px] font-black tracking-widest text-navy uppercase">
              Guided
            </span>
          </div>

          <p className="mt-2 font-mono text-[11px] leading-5 font-bold text-ink-soft">
            EST. 8–12 MIN · 3 STEPS · HUMAN-REVIEWABLE
          </p>

          <div className="mt-6 space-y-5">
            {recipeSteps.map((step, index) => (
              <div key={step.title} className="grid grid-cols-[24px_1fr] items-start gap-3.5">
                <Checkbox
                  id={`recipe-step-${index}`}
                  checked={completed[index]}
                  onCheckedChange={(value) => updateStep(index, value === true)}
                  aria-label={`Complete step ${index + 1}: ${step.title}`}
                  className="mt-1"
                />
                <label htmlFor={`recipe-step-${index}`} className="cursor-pointer leading-6 text-ink-soft">
                  <strong
                    className={cn(
                      'mb-1 block text-[15px] font-extrabold text-ink transition-opacity',
                      completed[index] && 'text-ink-soft line-through opacity-70',
                    )}
                  >
                    {index + 1}. {step.title}
                  </strong>
                  <span className="text-sm sm:text-[15px]">{step.detail}</span>
                </label>
              </div>
            ))}
          </div>

          <div className="mt-7">
            <Progress value={progress} label="Recipe completion" />
            <div className="mt-2 flex items-center justify-between gap-4 text-xs font-bold text-ink-soft">
              <span>{count} of {recipeSteps.length} steps complete</span>
              <span>{count === recipeSteps.length ? 'Done ✓' : 'Done when a test page prints'}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function App() {
  const [notice, setNotice] = useState<Notice>(null)

  const announce = useMemo(
    () => (message: string) => setNotice({ message, key: Date.now() }),
    [],
  )

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 3200)
    return () => window.clearTimeout(timer)
  }, [notice])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-ink/8 bg-[#eef5fb]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] w-[min(1180px,calc(100%-24px))] items-center justify-between gap-6 sm:w-[min(1180px,calc(100%-32px))]">
          <Logo />
          <nav className="flex items-center gap-5 text-sm font-semibold text-ink-soft" aria-label="Primary navigation">
            <a className="hidden rounded-sm outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-tan md:inline" href="#how">
              How it works
            </a>
            <a className="hidden rounded-sm outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-tan md:inline" href="#questions">
              Things we solve
            </a>
            <a className="hidden rounded-sm outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-tan md:inline" href="#sample">
              A sample path
            </a>
            <a className={cn(buttonVariants({ size: 'sm' }), 'text-white')} href="#ask">
              Ask rckt
            </a>
          </nav>
        </div>
      </header>

      <main id="top" className="pb-8 sm:pb-12">
        <section className="hero-panel relative isolate overflow-hidden" aria-labelledby="hero-title">
          <div className="hero-grid absolute inset-0" aria-hidden="true" />
          <div className="absolute -top-28 -left-20 size-80 rounded-full bg-white/30 blur-3xl" aria-hidden="true" />
          <div className="absolute top-1/4 -right-16 size-[28rem] rounded-full bg-navy/10 blur-3xl" aria-hidden="true" />
          <span className="hero-tick top-6 right-6 hidden lg:block" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#eef4fa] sm:h-40" aria-hidden="true" />

          <div className="relative z-10 mx-auto w-[min(1300px,calc(100%-24px))] px-4 pt-14 pb-10 sm:w-[min(1300px,calc(100%-48px))] sm:px-8 sm:pt-20 sm:pb-14 lg:min-h-[820px] lg:px-0 lg:pb-28">
            <span className="absolute top-7 left-5 -rotate-3 font-mono text-[11px] font-black tracking-[0.15em] text-ink-soft/75 sm:left-10 lg:top-14 lg:left-12 lg:text-xs">
              ASK HERE →
            </span>

            <div className="relative z-10 max-w-[570px] lg:absolute lg:top-24 lg:left-12">
              <Stamp>The little question desk on the internet</Stamp>
              <h1 id="hero-title" className="mt-5 text-[clamp(3.4rem,8.6vw,6.2rem)] leading-[0.91] font-black tracking-[-0.075em] text-ink">
                Got stuck?
                <br />
                <span className="scribble">Bring it here.</span>
              </h1>
              <p className="mt-5 max-w-[510px] text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
                Tell us what you’re trying to get done. We’ll turn the confusing bit into a clear,
                practical path you can actually follow.
              </p>
            </div>

            <IntakeDesk announce={announce} />

            <figure className="relative z-0 mx-auto mt-7 h-[255px] w-[270px] overflow-hidden drop-shadow-[0_20px_18px_rgba(35,56,79,0.18)] sm:h-[330px] sm:w-[360px] lg:absolute lg:right-[-10px] lg:bottom-[-70px] lg:h-auto lg:w-[470px] lg:overflow-visible">
              <span
                className="absolute top-3 left-1/2 z-10 h-8 w-32 -translate-x-1/2 -rotate-[3deg] bg-tape/70 shadow-[0_2px_3px_rgba(35,56,79,0.1)] sm:w-40 lg:-top-2"
                aria-hidden="true"
              />
              <img
                className="avatar-mask block w-full rotate-[0.5deg] rounded-[24px] object-cover object-top"
                src={avatar}
                alt="A friendly desk helper holding a certificate"
                width="760"
                height="1139"
                fetchPriority="high"
              />
            </figure>
          </div>
        </section>

        <div className="mx-auto w-[min(1180px,calc(100%-20px))] sm:w-[min(1180px,calc(100%-32px))]">
          <section id="how" className="scroll-mt-24 pt-20 lg:pt-28">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="max-w-2xl text-[clamp(2.3rem,5vw,4rem)] leading-[0.96] font-black tracking-[-0.06em] text-ink">
                A desk for the
                <br />
                awkward little things.
              </h2>
              <p className="max-w-[500px] text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
                Questions, setup, forms, eligibility, tech chores—whatever the shape, the goal is
                the same: turn “I’m stuck” into “done”.
              </p>
            </div>

            <div className="mt-9 grid gap-6 md:grid-cols-3">
              {processSteps.map((step) => (
                <article
                  key={step.stamp}
                  className={cn(
                    'paper-tape relative min-h-60 border border-ink/12 bg-paper px-6 pt-9 pb-7 shadow-[4px_6px_16px_rgba(35,56,79,0.09)]',
                    step.rotation,
                  )}
                >
                  <span className="font-mono text-[11px] font-black tracking-[0.14em] text-ink-soft">
                    {step.stamp}
                  </span>
                  <h3 className="mt-5 text-[27px] leading-tight font-black tracking-[-0.04em] text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-7 text-ink-soft">{step.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="questions" className="scroll-mt-24 pt-20 lg:pt-28">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="max-w-2xl text-[clamp(2.3rem,5vw,4rem)] leading-[0.96] font-black tracking-[-0.06em] text-ink">
                People don’t arrive
                <br />
                with neat categories.
              </h2>
              <p className="max-w-[490px] text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
                Good. Neither does this desk. Start with the real-world version of the problem;
                we’ll work out what kind of help it needs.
              </p>
            </div>

            <div className="notice-board mt-9 grid grid-cols-1 gap-5 rounded-2xl border-[6px] border-[#6b5645] p-5 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.12),0_16px_40px_rgba(35,56,79,0.14)] sm:grid-cols-2 sm:border-[9px] sm:p-8 lg:grid-cols-12 lg:p-10">
              {questions.map((question) => (
                <article
                  key={question.text}
                  className={cn(
                    'pin relative flex min-h-32 items-center rounded-md border border-ink/8 px-5 pt-7 pb-5 text-[17px] leading-snug font-extrabold tracking-[-0.025em] text-ink shadow-[4px_6px_14px_rgba(51,37,28,0.14)] sm:min-h-40 sm:text-lg',
                    question.className,
                  )}
                >
                  {question.text}
                </article>
              ))}
            </div>
          </section>

          <RecipePreview announce={announce} />

          <section className="relative mt-20 overflow-hidden rounded-[24px] bg-ink px-6 py-9 text-white sm:px-10 sm:py-11 lg:mt-28 lg:rounded-[28px] lg:px-12">
            <div className="absolute -top-32 -right-20 size-80 rounded-full bg-white/5" aria-hidden="true" />
            <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <span className="inline-flex -rotate-[0.5deg] bg-tape px-3 py-2 font-mono text-[10px] font-black tracking-[0.13em] text-ink uppercase">
                  When the path stops matching reality
                </span>
                <h2 className="mt-5 text-[clamp(2.25rem,5vw,3.8rem)] leading-[0.96] font-black tracking-[-0.06em]">
                  Still stuck? Hand it over.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
                  A real person can pick up the context you already shared and help close the loop.
                  No starting over. No retelling the whole story.
                </p>
              </div>
              <a className={cn(buttonVariants({ variant: 'paper', size: 'lg' }), 'w-full lg:w-auto')} href="#ask">
                <UserRoundCheck className="size-5" aria-hidden="true" />
                Ask for a human
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </section>

          <footer className="pt-11 pb-4 text-sm text-ink-soft">
            <div className="flex flex-col gap-7 border-t border-ink/12 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Logo />
                <p className="mt-2 text-xs">Tiny problems, properly finished.</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-semibold">
                <button type="button" className="cursor-pointer hover:text-ink" onClick={() => announce('Email will be available when the live desk opens.')}>
                  <Mail className="mr-1.5 inline size-3.5" aria-hidden="true" /> Email
                </button>
                <button type="button" className="cursor-pointer hover:text-ink" onClick={() => announce('WhatsApp will be available when the live desk opens.')}>
                  <MessageCircle className="mr-1.5 inline size-3.5" aria-hidden="true" /> WhatsApp
                </button>
                <span>© 2026 rckt.dev</span>
              </div>
            </div>
          </footer>
        </div>
      </main>

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
    </>
  )
}

export default App
