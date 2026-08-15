import { useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Clock, Mail, MessageCircle, Send, Sparkles, Trash2 } from 'lucide-react'

import { Logo, Stamp } from '@/App'
import paperRocket from '@/assets/paper-rocket.svg'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { localTaskTracker, type TrackedTask } from '@/services/taskTracker'

type Notice = { message: string; key: number } | null

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
      announce('Add a little more detail before you save it.')
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
    announce('Removed from your tracker.')
  }

  function unavailableChannel(channel: string) {
    announce(`${channel} will be available when the live desk opens.`)
  }

  return (
    <>
      <header className="border-b border-ink/8 bg-[#eef5fb]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] w-[min(1180px,calc(100%-24px))] items-center justify-between gap-6 sm:w-[min(1180px,calc(100%-32px))]">
          <Logo />
          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-sm text-sm font-semibold text-ink-soft outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-tan"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to rckt.dev
          </a>
        </div>
      </header>

      <main className="mx-auto w-[min(980px,calc(100%-24px))] pt-12 pb-20 sm:w-[min(980px,calc(100%-32px))] sm:pt-16">
        <Stamp>A shareable little desk</Stamp>
        <h1 className="mt-5 max-w-xl text-[clamp(2.4rem,5.5vw,3.6rem)] leading-[0.98] font-black tracking-[-0.05em] text-ink">
          The rckt.dev business card.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
          Pass this along, drop a task on it, and keep an eye on what you’ve sent — all from one
          page.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="paper-tape relative -rotate-[0.6deg] self-start rounded-[10px_18px_12px_16px] border border-ink/15 bg-paper p-7 shadow-[6px_9px_18px_rgba(35,56,79,0.1),0_22px_50px_rgba(35,56,79,0.13)]">
            <div className="flex items-center gap-3">
              <img
                src={paperRocket}
                alt=""
                aria-hidden="true"
                className="size-10 rotate-[18deg] drop-shadow-[1px_2px_2px_rgba(35,56,79,0.3)]"
              />
              <div>
                <p className="text-xl font-black tracking-[-0.045em] text-ink">rckt.dev</p>
                <p className="font-mono text-[10px] font-bold tracking-[0.14em] text-ink-soft uppercase">
                  The little question desk
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm leading-6 text-ink-soft">
              Tell us what you’re trying to get done. We turn the confusing bit into a clear,
              practical path — and hand the awkward part to a person when it needs one.
            </p>

            <div className="mt-6 flex items-center justify-between gap-3 border-t border-ink/10 pt-5 font-mono text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">
              <span>Web</span>
              <span className="text-ink normal-case tracking-normal">rckt.dev</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="chip" size="sm" onClick={() => unavailableChannel('Email')}>
                <Mail className="size-4" aria-hidden="true" />
                Email
              </Button>
              <Button variant="chip" size="sm" onClick={() => unavailableChannel('WhatsApp')}>
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <form
              onSubmit={handleSubmit}
              className="rounded-[8px_16px_10px_14px] border border-ink/15 bg-paper p-6 shadow-[4px_6px_16px_rgba(35,56,79,0.09)]"
              noValidate
            >
              <label htmlFor="card-objective" className="text-base font-extrabold text-ink">
                Submit a task
              </label>
              <div className="ruled-field mt-2 rounded-md">
                <Textarea
                  id="card-objective"
                  value={objective}
                  placeholder="What are you trying to get done?"
                  onChange={(event) => setObjective(event.target.value)}
                />
              </div>
              <Button type="submit" className="mt-4">
                <Send className="size-4" aria-hidden="true" />
                Save to my tracker
              </Button>
            </form>

            <div className="rounded-[8px_16px_10px_14px] border border-ink/15 bg-paper p-6 shadow-[4px_6px_16px_rgba(35,56,79,0.09)]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-extrabold text-ink">Your tracked tasks</h2>
                <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-ink-soft uppercase">
                  {tasks.length} saved
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-ink-soft">
                Saved only in this browser, on this device. Nothing here is sent anywhere yet —
                Case creation connects here in a future product slice.
              </p>

              {tasks.length === 0 ? (
                <p className="mt-6 text-sm text-ink-soft">
                  Nothing saved yet. Submit a task above to see it here.
                </p>
              ) : (
                <ul className="mt-5 space-y-3">
                  {tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-start gap-3 rounded-lg border border-ink/10 bg-white/60 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-ink">{task.objective}</p>
                        <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.08em] text-ink-soft uppercase">
                          <Clock className="size-3" aria-hidden="true" />
                          {formatSubmittedAt(task.submittedAt)} · saved on this device
                        </p>
                      </div>
                      <button
                        type="button"
                        className="grid size-7 shrink-0 cursor-pointer place-content-center rounded-full outline-none hover:bg-ink/8 focus-visible:ring-2 focus-visible:ring-tan"
                        onClick={() => handleRemove(task)}
                        aria-label={`Remove "${task.objective}" from your tracker`}
                      >
                        <Trash2 className="size-3.5 text-ink-soft" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
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

export default BusinessCard
