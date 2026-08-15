import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  Download,
  Inbox,
  Lock,
  Mail,
  MessageCircle,
  PenLine,
  Send,
  Sparkles,
  Trash2,
  type LucideIcon,
} from 'lucide-react'

import paperRocket from '@/assets/paper-rocket.svg'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { localTaskTracker, type TrackedTask } from '@/services/taskTracker'

type Notice = { message: string; key: number } | null

const flowSteps: { icon: LucideIcon; label: string; tone: string }[] = [
  { icon: PenLine, label: 'Type', tone: 'bg-sky-deep text-white' },
  { icon: BookmarkCheck, label: 'Save', tone: 'bg-tan text-ink' },
  { icon: Inbox, label: 'Track', tone: 'bg-navy text-white' },
]

function FlowStep({ icon: Icon, label, tone }: { icon: LucideIcon; label: string; tone: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className={cn(
          'grid size-10 place-content-center rounded-full shadow-[0_3px_8px_rgba(35,56,79,0.22)] ring-2 ring-white/70',
          tone,
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span className="font-mono text-[9px] font-bold tracking-[0.1em] text-ink-soft uppercase">
        {label}
      </span>
    </div>
  )
}

const VCARD = [
  'BEGIN:VCARD',
  'VERSION:3.0',
  'FN:rckt.dev',
  'ORG:rckt.dev',
  'TITLE:The little question desk on the internet',
  'URL:https://rckt.dev',
  "NOTE:Tell rckt what you're trying to get done — it turns it into a clear, practical path.",
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

function formatSubmittedAt(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function BusinessCard() {
  const [objective, setObjective] = useState('')
  const [tasks, setTasks] = useState<TrackedTask[]>([])
  const [notice, setNotice] = useState<Notice>(null)

  useEffect(() => {
    setTasks(localTaskTracker.list())
  }, [])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), 3200)
    return () => window.clearTimeout(timer)
  }, [notice])

  function announce(message: string) {
    setNotice({ message, key: Date.now() })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleaned = objective.trim()

    if (cleaned.length < 5) {
      announce('Add a little more detail first.')
      return
    }

    const task = localTaskTracker.add(cleaned)
    setTasks((current) => [task, ...current])
    setObjective('')
    announce('Saved on this device. Nothing was sent anywhere yet.')
  }

  function handleRemove(task: TrackedTask) {
    localTaskTracker.remove(task.id)
    setTasks((current) => current.filter((item) => item.id !== task.id))
  }

  function unavailableChannel(channel: string) {
    announce(`${channel} will be available when the live desk opens.`)
  }

  return (
    <div className="hero-panel relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-14">
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

      <div className="relative z-10 w-full max-w-[400px]">
        <div
          className="absolute inset-0 -z-10 rotate-[2.4deg] rounded-[16px_24px_18px_22px] border border-ink/10 bg-tan/50 shadow-[0_18px_40px_rgba(35,56,79,0.14)]"
          aria-hidden="true"
        />

        <div className="paper-tape relative -rotate-[1.1deg] rounded-[14px_22px_16px_20px] border border-ink/15 bg-paper p-7 shadow-[6px_9px_18px_rgba(35,56,79,0.12),0_26px_54px_rgba(35,56,79,0.2)]">
        <div className="flex items-center gap-3">
          <img
            src={paperRocket}
            alt=""
            aria-hidden="true"
            className="size-9 shrink-0 rotate-[18deg] drop-shadow-[1px_2px_2px_rgba(35,56,79,0.3)]"
          />
          <div className="min-w-0">
            <p className="text-lg font-black tracking-[-0.045em] text-ink">rckt.dev</p>
            <p className="truncate font-mono text-[10px] font-bold tracking-[0.12em] text-ink-soft uppercase">
              The little question desk
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between px-1">
          {flowSteps.map((step, index) => (
            <div key={step.label} className="flex items-center gap-2">
              <FlowStep {...step} />
              {index < flowSteps.length - 1 ? (
                <ArrowRight className="size-3.5 shrink-0 text-ink-soft/30" aria-hidden="true" />
              ) : null}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5" noValidate>
          <label htmlFor="card-objective" className="sr-only">
            What are you trying to get done?
          </label>
          <div className="flex items-center gap-2">
            <input
              id="card-objective"
              type="text"
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              placeholder="Type what you’re stuck on…"
              className="h-11 min-w-0 flex-1 rounded-full border border-ink/15 bg-white/70 px-4 text-sm font-semibold text-ink outline-none placeholder:text-slate-blue/75 focus-visible:border-ink/30 focus-visible:ring-3 focus-visible:ring-tan/35"
            />
            <Button type="submit" size="icon" aria-label="Save task to tracker">
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </form>

        <div className="mt-6 border-t border-ink/10 pt-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-extrabold text-ink">Tracked</h2>
            <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-ink-soft uppercase">
              {tasks.length}
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="mt-3 flex items-center gap-2.5 rounded-lg border border-dashed border-ink/15 bg-white/40 px-3 py-3 text-ink-soft">
              <Inbox className="size-4 shrink-0" aria-hidden="true" />
              <span className="text-xs font-semibold">Nothing yet</span>
            </div>
          ) : (
            <ul className="mt-3 max-h-52 space-y-1.5 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-ink/10 bg-white/55 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-xs font-semibold text-ink">{task.objective}</p>
                    <p className="mt-0.5 font-mono text-[9px] font-bold tracking-[0.06em] text-ink-soft uppercase">
                      {formatSubmittedAt(task.submittedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="grid size-6 shrink-0 cursor-pointer place-content-center rounded-full outline-none hover:bg-ink/8 focus-visible:ring-2 focus-visible:ring-tan"
                    onClick={() => handleRemove(task)}
                    aria-label={`Remove "${task.objective}" from your tracker`}
                  >
                    <Trash2 className="size-3 text-ink-soft" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-ink-soft/75">
            <Lock className="size-3 shrink-0" aria-hidden="true" />
            On this device only
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-1 border-t border-ink/10 pt-4">
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold text-ink-soft outline-none hover:bg-ink/6 hover:text-ink focus-visible:ring-2 focus-visible:ring-tan"
              onClick={() => unavailableChannel('Email')}
            >
              <Mail className="size-3.5" aria-hidden="true" />
              Email
            </button>
            <button
              type="button"
              className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold text-ink-soft outline-none hover:bg-ink/6 hover:text-ink focus-visible:ring-2 focus-visible:ring-tan"
              onClick={() => unavailableChannel('WhatsApp')}
            >
              <MessageCircle className="size-3.5" aria-hidden="true" />
              WhatsApp
            </button>
          </div>
          <button
            type="button"
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-ink/6 px-2 py-1.5 text-xs font-semibold text-ink-soft outline-none hover:bg-ink/10 hover:text-ink focus-visible:ring-2 focus-visible:ring-tan"
            onClick={() => {
              saveContact()
              announce('Contact card downloaded.')
            }}
          >
            <Download className="size-3.5" aria-hidden="true" />
            Save contact
          </button>
        </div>
        </div>
      </div>

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
    </div>
  )
}

export default BusinessCard
