import { useState } from 'react'
import type { Loop } from '../types'
import { LIFE_AREA_META, LOOP_TYPE_META, STATE_META, todayStr } from '../types'
import { useStore } from '../store'
import LoopDetailModal from './LoopDetailModal'

interface Props {
  loop: Loop
  children?: React.ReactNode
  showState?: boolean
  /** Tắt mở trang chi tiết khi chạm (dùng trong wizard) */
  noDetail?: boolean
}

function fmtDate(d: string): string {
  const today = todayStr()
  if (d <= today) return 'hôm nay'
  const [, m, day] = d.split('-')
  return `${Number(day)}/${Number(m)}`
}

/**
 * Thẻ hiển thị một loop — tối giản có chủ đích:
 * tiêu đề + bước tiếp theo là trọng tâm; mọi thông tin phụ dồn vào một dòng chữ mờ.
 */
export default function LoopCard({ loop, children, showState, noDetail }: Props) {
  const { data } = useStore()
  const [detail, setDetail] = useState(false)
  const t = loop.type ? LOOP_TYPE_META[loop.type] : null
  const goal = loop.goalId ? data.goals.find((g) => g.id === loop.goalId) : undefined
  const parts: string[] = []
  if (showState) parts.push(STATE_META[loop.state].label)
  if (goal) parts.push(`🎯 ${goal.title}`)
  if (loop.lifeArea)
    parts.push(`${LIFE_AREA_META[loop.lifeArea].icon} ${LIFE_AREA_META[loop.lifeArea].label}`)
  if (loop.waitingFor) parts.push(`chờ: ${loop.waitingFor}`)
  if (loop.reviewDate) parts.push(`📅 ${fmtDate(loop.reviewDate)}`)
  if (loop.emotionalLoad) parts.push('🪨'.repeat(loop.emotionalLoad))
  return (
    <>
      <div
        className={`card${noDetail ? '' : ' clickable'}`}
        onClick={noDetail ? undefined : () => setDetail(true)}
      >
        <div className="title">
          {t ? `${t.icon} ` : ''}
          {loop.title}
        </div>
        {loop.nextAction && (
          <div className="next">
            <b>→</b> {loop.nextAction}
          </div>
        )}
        {loop.note && <div className="meta2">{loop.note}</div>}
        {loop.closeNote && <div className="meta2">🖋 {loop.closeNote}</div>}
        {parts.length > 0 && <div className="meta2">{parts.join('  ·  ')}</div>}
        {children && (
          <div className="actions" onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        )}
      </div>
      {detail && <LoopDetailModal loop={loop} onClose={() => setDetail(false)} />}
    </>
  )
}
