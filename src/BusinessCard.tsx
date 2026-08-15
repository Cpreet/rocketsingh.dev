import { useEffect, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ChevronDown,
  Download,
  Mail,
  MessageCircle,
  Send,
  Sparkles,
  Trash2,
} from 'lucide-react'
import QRCode from 'qrcode'

import paperRocket from '@/assets/paper-rocket.svg'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { localTaskTracker, type TrackedTask } from '@/services/taskTracker'

type Notice = { message: string; key: number } | null

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

function BusinessCard() {
  const [qrMarkup, setQrMarkup] = useState('')
  const [objective, setObjective] = useState('')
  const [tasks, setTasks] = useState<TrackedTask[]>([])
  const [showTasks, setShowTasks] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)

  useEffect(() => {
    setTasks(localTaskTracker.list())
  }, [])

  useEffect(() => {
    let cancelled = false
    QRCode.toString(`${window.location.origin}/card`, {
      type: 'svg',
      margin: 0,
      color: { dark: '#23384f', light: '#00000000' },
    })
      .then((svg) => {
        if (!cancelled) setQrMarkup(svg)
      })
      .catch(() => {
        /* QR is a nice-to-have; the card still works without it. */
      })
    return () => {
      cancelled = true
    }
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
    setShowTasks(true)
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
    <div className="flex min-h-screen items-center justify-center px-4 py-14">
      <a
        href="/"
        className="fixed top-5 left-5 z-20 inline-flex items-center gap-1.5 rounded-full border border-ink/12 bg-paper/80 px-3 py-1.5 text-xs font-semibold text-ink-soft backdrop-blur outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-tan"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        rckt.dev
      </a>

      <div className="paper-tape relative w-full max-w-[380px] -rotate-[0.6deg] rounded-[14px_22px_16px_20px] border border-ink/15 bg-paper p-6 shadow-[6px_9px_18px_rgba(35,56,79,0.1),0_22px_50px_rgba(35,56,79,0.14)]">
        <div className="flex items-center gap-3">
          <img
            src={paperRocket}
            alt=""
            aria-hidden="true"
            className="size-10 shrink-0 rotate-[18deg] drop-shadow-[1px_2px_2px_rgba(35,56,79,0.3)]"
          />
          <div className="min-w-0">
            <p className="text-xl font-black tracking-[-0.045em] text-ink">rckt.dev</p>
            <p className="truncate font-mono text-[10px] font-bold tracking-[0.12em] text-ink-soft uppercase">
              The little question desk
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-2 rounded-xl border border-dashed border-ink/20 bg-white/55 py-4">
          {qrMarkup ? (
            <div
              className="size-28 [&_svg]:block [&_svg]:size-full"
              dangerouslySetInnerHTML={{ __html: qrMarkup }}
              aria-hidden="true"
            />
          ) : (
            <div className="size-28 animate-pulse rounded-md bg-ink/5" aria-hidden="true" />
          )}
          <p className="font-mono text-[10px] font-bold tracking-[0.1em] text-ink-soft uppercase">
            Scan to open rckt.dev/card
          </p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <Button
            variant="chip"
            size="icon"
            aria-label="Email (prototype)"
            onClick={() => unavailableChannel('Email')}
          >
            <Mail className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="chip"
            size="icon"
            aria-label="WhatsApp (prototype)"
            onClick={() => unavailableChannel('WhatsApp')}
          >
            <MessageCircle className="size-4" aria-hidden="true" />
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              saveContact()
              announce('Contact card downloaded.')
            }}
          >
            <Download className="size-4" aria-hidden="true" />
            Save contact
          </Button>
        </div>

        <div className="mt-5 border-t border-ink/10 pt-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2" noValidate>
            <input
              type="text"
              value={objective}
              onChange={(event) => setObjective(event.target.value)}
              placeholder="Drop a task here…"
              aria-label="What are you trying to get done?"
              className="h-10 min-w-0 flex-1 rounded-full border border-ink/15 bg-white/70 px-4 text-sm font-semibold text-ink outline-none placeholder:text-slate-blue/75 focus-visible:border-ink/30 focus-visible:ring-3 focus-visible:ring-tan/35"
            />
            <Button type="submit" size="icon" aria-label="Save task to tracker">
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </form>

          <button
            type="button"
            className="mt-3 flex w-full cursor-pointer items-center justify-between gap-2 text-xs font-semibold text-ink-soft outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-tan"
            onClick={() => setShowTasks((current) => !current)}
            aria-expanded={showTasks}
          >
            <span>
              {tasks.length
                ? `${tasks.length} task${tasks.length === 1 ? '' : 's'} tracked on this device`
                : 'No tasks tracked yet'}
            </span>
            <ChevronDown
              className={cn('size-3.5 shrink-0 transition-transform', showTasks && 'rotate-180')}
              aria-hidden="true"
            />
          </button>

          {showTasks && tasks.length > 0 ? (
            <ul className="mt-3 max-h-40 space-y-1.5 overflow-y-auto pr-1">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-ink/10 bg-white/55 px-2.5 py-1.5"
                >
                  <span className="truncate text-xs font-semibold text-ink">{task.objective}</span>
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
          ) : null}

          <p className="mt-3 text-[11px] leading-4 text-ink-soft/80">
            Saved only in this browser. Nothing here is sent anywhere yet.
          </p>
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
