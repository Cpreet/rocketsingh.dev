const STORAGE_KEY = 'rckt.dev:tracked-tasks'
const MAX_TASKS = 20

export interface TrackedTask {
  id: string
  objective: string
  submittedAt: string
}

export interface TaskTrackerService {
  list(): TrackedTask[]
  add(objective: string): TrackedTask
  remove(id: string): void
}

function readStore(): TrackedTask[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Private-mode/blocked storage, corrupted JSON, or no window (SSR): fail closed to an empty list.
    return []
  }
}

function writeStore(tasks: TrackedTask[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch {
    // Storage full or unavailable: the task still rendered for this session, it just won't persist.
  }
}

/**
 * Client-only, browser-local task tracker for the business card prototype.
 * Nothing here is sent anywhere — it exists so a visitor can see their own
 * submissions again on this device. It is not a Case, not a backend, and it
 * is explicitly not the IntakeService contract described in docs/architecture.md.
 */
export const localTaskTracker: TaskTrackerService = {
  list() {
    return readStore().sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
  },

  add(objective) {
    const task: TrackedTask = {
      id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      objective,
      submittedAt: new Date().toISOString(),
    }

    const next = [task, ...readStore()].slice(0, MAX_TASKS)
    writeStore(next)
    return task
  },

  remove(id) {
    writeStore(readStore().filter((task) => task.id !== id))
  },
}
