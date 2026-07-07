import type { AppData, Loop } from '../types'

export interface CoachPrompt {
  id: string
  /** Tên loop liên quan (hiện 1 dòng, bold) */
  loopTitle?: string
  /** MỘT câu hỏi ngắn — không giảng giải */
  question: string
  loopId?: string
  suggest: 'clarify' | 'letgo' | 'none'
  actionLabel?: string
}

const DAY = 24 * 3600 * 1000
const OPEN_STATES = ['inbox', 'active', 'waiting', 'parked']

function daysStill(l: Loop, now: number): number {
  return Math.floor((now - l.stateChangedAt) / DAY)
}

/**
 * Coach dạng luật — mỗi lần chỉ MỘT câu hỏi ngắn, tối đa 1 dòng tên việc + 1 câu.
 * Câu hỏi mở theo tinh thần CBT, luôn kèm lối thoát hành động.
 */
export function getCoachPrompt(data: AppData, dismissed: string[]): CoachPrompt | null {
  const now = Date.now()
  const open = data.loops.filter((l) => OPEN_STATES.includes(l.state))
  const active = open.filter((l) => l.state === 'active')
  const activeGoals = data.goals.filter((g) => !g.doneAt)
  const prompts: CoachPrompt[] = []

  // 1. Việc trước mặt nhưng không có bước tiếp theo
  const noNext = active
    .filter((l) => !l.nextAction && daysStill(l, now) >= 2)
    .sort((a, b) => a.stateChangedAt - b.stateChangedAt)[0]
  if (noNext) {
    prompts.push({
      id: `nonext-${noNext.id}`,
      loopTitle: noNext.title,
      question: 'Chưa có bước tiếp theo — việc này có thật sự quan trọng không?',
      loopId: noNext.id,
      suggest: 'clarify',
      actionLabel: 'Làm rõ',
    })
  }

  // 2. Mục tiêu đang bị "bỏ đói"
  if (
    activeGoals.length > 0 &&
    active.length >= 2 &&
    !active.some((l) => l.goalId && activeGoals.some((g) => g.id === l.goalId))
  ) {
    prompts.push({
      id: 'goal-starved',
      question: `${active.length} việc trước mặt — chưa việc nào phục vụ mục tiêu của bạn.`,
      suggest: 'none',
    })
  }

  // 3. Loop đứng yên quá lâu
  const stale = open
    .filter((l) => l.state !== 'inbox' && daysStill(l, now) >= 14)
    .sort((a, b) => a.stateChangedAt - b.stateChangedAt)[0]
  if (stale) {
    prompts.push({
      id: `stale-${stale.id}`,
      loopTitle: stale.title,
      question: `Đứng yên ${daysStill(stale, now)} ngày — chưa rõ bước nhỏ, hay không quan trọng?`,
      loopId: stale.id,
      suggest: 'clarify',
      actionLabel: 'Làm rõ',
    })
  }

  // 4. Việc gác lâu, không gắn mục tiêu → gợi ý buông
  const dropCandidate = open
    .filter(
      (l) =>
        (l.state === 'parked' || l.type === 'idea') &&
        !l.goalId &&
        (l.emotionalLoad ?? 0) <= 2 &&
        (now - l.createdAt) / DAY >= 30,
    )
    .sort((a, b) => a.createdAt - b.createdAt)[0]
  if (dropCandidate) {
    prompts.push({
      id: `drop-${dropCandidate.id}`,
      loopTitle: dropCandidate.title,
      question: 'Nằm im hơn 1 tháng, không phục vụ mục tiêu nào — buông nhé?',
      loopId: dropCandidate.id,
      suggest: 'letgo',
      actionLabel: 'Buông',
    })
  }

  return prompts.find((p) => !dismissed.includes(p.id)) ?? null
}
