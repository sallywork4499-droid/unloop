export type LoopType = 'action' | 'decision' | 'unclear' | 'emotion' | 'idea'

export type LoopState =
  | 'inbox'
  | 'active'
  | 'waiting'
  | 'parked'
  | 'resolved'
  | 'accepted'
  | 'notdoing'
  | 'archived'

export const CLOSED_STATES: LoopState[] = ['resolved', 'accepted', 'notdoing', 'archived']

export type LifeArea =
  | 'work'
  | 'money'
  | 'health'
  | 'family'
  | 'relations'
  | 'growth'
  | 'admin'
  | 'other'

export const LIFE_AREA_META: Record<LifeArea, { icon: string; label: string }> = {
  work: { icon: '💼', label: 'Công việc' },
  money: { icon: '💰', label: 'Tài chính' },
  health: { icon: '❤️', label: 'Sức khoẻ' },
  family: { icon: '🏠', label: 'Gia đình' },
  relations: { icon: '🤝', label: 'Quan hệ' },
  growth: { icon: '🌱', label: 'Phát triển' },
  admin: { icon: '📋', label: 'Việc vặt' },
  other: { icon: '✨', label: 'Khác' },
}

export interface Loop {
  id: string
  title: string
  createdAt: number
  stateChangedAt: number
  state: LoopState
  type?: LoopType
  /** Bước nhỏ nhất tiếp theo (implementation intention) */
  nextAction?: string
  /** Điều kiện để coi là xong ("khi gửi email X là xong phần của tôi") */
  closureCondition?: string
  /** Ngày xem lại / check-in (yyyy-mm-dd) */
  reviewDate?: string
  /** Đang chờ ai / cái gì (state = waiting) */
  waitingFor?: string
  /** Mức nặng đầu 1–5 */
  emotionalLoad?: number
  /** Khía cạnh cuộc sống */
  lifeArea?: LifeArea
  /** Gắn với mục tiêu nào (nếu có) */
  goalId?: string
  /** Ghi chú tự do ngắn */
  note?: string
  /** Lý do đóng / acceptance statement */
  closeNote?: string
  closedAt?: number
}

/** Mục tiêu cuộc sống — kim chỉ nam. Tối đa 3 tại một thời điểm (giới hạn working memory). */
export interface Goal {
  id: string
  title: string
  /** Vì sao điều này quan trọng với bạn lúc này? */
  why?: string
  /** Chân trời thời gian: Tháng này / Quý này / Năm nay */
  horizon?: string
  lifeArea?: LifeArea
  createdAt: number
  doneAt?: number
}

export const GOAL_LIMIT = 3

export interface Lesson {
  id: string
  loopId: string
  loopTitle: string
  situation?: string
  insight?: string
  guideline?: string
  createdAt: number
}

export interface Settings {
  activeLimit: number
  onboarded: boolean
  /** Đã đi qua màn hình đăng nhập (đăng nhập hoặc chọn dùng offline) */
  authSeen?: boolean
  lastDailyReview?: string // yyyy-mm-dd
  lastWeeklyReview?: string // yyyy-mm-dd
}

export interface AppData {
  version: 1
  loops: Loop[]
  lessons: Lesson[]
  goals: Goal[]
  settings: Settings
}

export const LOOP_TYPE_META: Record<LoopType, { icon: string; label: string; hint: string }> = {
  action: { icon: '⚡', label: 'Việc có thể làm', hint: 'Có hành động cụ thể để xử lý' },
  decision: { icon: '⚖️', label: 'Cần quyết định', hint: 'Phải chọn giữa các lựa chọn' },
  unclear: { icon: '🌫️', label: 'Chưa rõ ràng', hint: 'Chưa biết vấn đề thực sự là gì' },
  emotion: { icon: '🫧', label: 'Lo lắng / Cảm xúc', hint: 'Chủ yếu là lo, buồn, giận…' },
  idea: { icon: '💡', label: 'Ý tưởng', hint: 'Có thể làm, nhưng không bắt buộc' },
}

export const STATE_META: Record<LoopState, { label: string; color: string; desc: string }> = {
  inbox: { label: 'Inbox', color: 'gray', desc: 'Mới ghi nhận, chưa phân loại' },
  active: { label: 'Đang xử lý', color: 'teal', desc: 'Trong tầm ngắm hôm nay / tuần này' },
  waiting: { label: 'Đang chờ', color: 'blue', desc: 'Đã chuyển cho người khác, chờ phản hồi' },
  parked: { label: 'Tạm gác', color: 'amber', desc: 'Chưa xử lý bây giờ, sẽ xem lại đúng hẹn' },
  resolved: { label: 'Đã giải quyết', color: 'green', desc: 'Đã xong bằng hành động' },
  accepted: { label: 'Đã chấp nhận', color: 'purple', desc: 'Ngoài tầm kiểm soát — buông có chủ đích' },
  notdoing: { label: 'Quyết định không làm', color: 'rose', desc: 'Nói không cũng là một cách đóng loop' },
  archived: { label: 'Lưu trữ', color: 'gray', desc: 'Lịch sử các loop đã xử lý' },
}

export function todayStr(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function addDays(days: number, from = new Date()): string {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return todayStr(d)
}

export function isClosed(loop: Loop): boolean {
  return CLOSED_STATES.includes(loop.state)
}

/** Một loop được coi là "được kiểm soát" khi đã có state rõ + kế hoạch tối thiểu hoặc lịch xem lại */
export function isControlled(loop: Loop): boolean {
  if (isClosed(loop)) return true
  if (loop.state === 'inbox') return false
  return Boolean(loop.nextAction || loop.closureCondition || loop.reviewDate)
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
