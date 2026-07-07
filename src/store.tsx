import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import type { AppData, Goal, Lesson, Loop, LoopState, Settings } from './types'
import { todayStr, uid } from './types'

const STORAGE_KEY = 'unloop.v1'

const defaultSettings: Settings = {
  activeLimit: 5,
  onboarded: false,
}

const emptyData: AppData = {
  version: 1,
  loops: [],
  lessons: [],
  goals: [],
  settings: defaultSettings,
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData
    const parsed = JSON.parse(raw) as AppData
    return {
      ...emptyData,
      ...parsed,
      settings: { ...defaultSettings, ...parsed.settings },
    }
  } catch {
    return emptyData
  }
}

type Action =
  | { type: 'capture'; titles: string[] }
  | { type: 'updateLoop'; id: string; patch: Partial<Loop> }
  | { type: 'setLoopState'; id: string; state: LoopState; patch?: Partial<Loop> }
  | { type: 'closeLoop'; id: string; state: 'resolved' | 'accepted' | 'notdoing'; closeNote?: string; lesson?: Omit<Lesson, 'id' | 'loopId' | 'loopTitle' | 'createdAt'> }
  | { type: 'deleteLoop'; id: string }
  | { type: 'deleteLesson'; id: string }
  | { type: 'addGoal'; goal: Omit<Goal, 'id' | 'createdAt'> }
  | { type: 'updateGoal'; id: string; patch: Partial<Goal> }
  | { type: 'deleteGoal'; id: string }
  | { type: 'setSettings'; patch: Partial<Settings> }
  | { type: 'import'; data: AppData }
  | { type: 'reset' }

function reducer(data: AppData, action: Action): AppData {
  const now = Date.now()
  switch (action.type) {
    case 'capture': {
      const loops: Loop[] = action.titles
        .map((t) => t.trim())
        .filter(Boolean)
        .map((title) => ({
          id: uid(),
          title,
          createdAt: now,
          stateChangedAt: now,
          state: 'inbox' as LoopState,
        }))
      return { ...data, loops: [...loops, ...data.loops] }
    }
    case 'updateLoop':
      return {
        ...data,
        loops: data.loops.map((l) => (l.id === action.id ? { ...l, ...action.patch } : l)),
      }
    case 'setLoopState':
      return {
        ...data,
        loops: data.loops.map((l) =>
          l.id === action.id
            ? { ...l, ...action.patch, state: action.state, stateChangedAt: now }
            : l,
        ),
      }
    case 'closeLoop': {
      const loop = data.loops.find((l) => l.id === action.id)
      if (!loop) return data
      const lessons = [...data.lessons]
      if (action.lesson && (action.lesson.situation || action.lesson.insight || action.lesson.guideline)) {
        lessons.unshift({
          id: uid(),
          loopId: loop.id,
          loopTitle: loop.title,
          createdAt: now,
          ...action.lesson,
        })
      }
      return {
        ...data,
        lessons,
        loops: data.loops.map((l) =>
          l.id === action.id
            ? { ...l, state: action.state, closeNote: action.closeNote, closedAt: now, stateChangedAt: now }
            : l,
        ),
      }
    }
    case 'deleteLoop':
      return {
        ...data,
        loops: data.loops.filter((l) => l.id !== action.id),
        lessons: data.lessons.filter((les) => les.loopId !== action.id),
      }
    case 'deleteLesson':
      return { ...data, lessons: data.lessons.filter((l) => l.id !== action.id) }
    case 'addGoal':
      return { ...data, goals: [...data.goals, { id: uid(), createdAt: now, ...action.goal }] }
    case 'updateGoal':
      return {
        ...data,
        goals: data.goals.map((g) => (g.id === action.id ? { ...g, ...action.patch } : g)),
      }
    case 'deleteGoal':
      return {
        ...data,
        goals: data.goals.filter((g) => g.id !== action.id),
        loops: data.loops.map((l) => (l.goalId === action.id ? { ...l, goalId: undefined } : l)),
      }
    case 'setSettings':
      return { ...data, settings: { ...data.settings, ...action.patch } }
    case 'import':
      return action.data
    case 'reset':
      return emptyData
    default:
      return data
  }
}

interface StoreValue {
  data: AppData
  dispatch: React.Dispatch<Action>
  // selectors tiện dụng
  inbox: Loop[]
  active: Loop[]
  waiting: Loop[]
  parked: Loop[]
  closed: Loop[]
  dueToday: Loop[]
  activeSlotsLeft: number
  activeGoals: Goal[]
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // storage đầy hoặc bị chặn — bỏ qua
    }
  }, [data])

  const value = useMemo<StoreValue>(() => {
    const today = todayStr()
    const byState = (s: LoopState) => data.loops.filter((l) => l.state === s)
    const active = byState('active')
    const waiting = byState('waiting')
    const parked = byState('parked')
    return {
      data,
      dispatch,
      inbox: byState('inbox'),
      active,
      waiting,
      parked,
      closed: data.loops.filter((l) => ['resolved', 'accepted', 'notdoing', 'archived'].includes(l.state)),
      dueToday: [...waiting, ...parked].filter((l) => l.reviewDate && l.reviewDate <= today),
      activeSlotsLeft: Math.max(0, data.settings.activeLimit - active.length),
      activeGoals: data.goals.filter((g) => !g.doneAt),
    }
  }, [data])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

export function exportJSON(data: AppData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `unloop-backup-${todayStr()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
