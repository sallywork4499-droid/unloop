import { useState } from 'react'
import { useStore } from '../store'
import GoalModal from './GoalModal'
import LoopCard from './LoopCard'
import type { Goal } from '../types'
import { CLOSED_STATES, LIFE_AREA_META } from '../types'

export const GOAL_GRADIENTS = [
  'linear-gradient(135deg, #0f766e, #0c4f49)',
  'linear-gradient(135deg, #7c3aed, #5b21b6)',
  'linear-gradient(135deg, #b45309, #92400e)',
]

/** Trang riêng của một mục tiêu: tiến độ + mọi việc nhỏ đang phục vụ nó. */
export default function GoalDetailModal({
  goal,
  index,
  onClose,
}: {
  goal: Goal
  index: number
  onClose: () => void
}) {
  const { data, dispatch } = useStore()
  const [editing, setEditing] = useState(false)
  if (editing) return <GoalModal goal={goal} onClose={onClose} />

  const linked = data.loops.filter((l) => l.goalId === goal.id)
  const openLinked = linked.filter((l) => !CLOSED_STATES.includes(l.state))
  const closedLinked = linked.filter((l) => CLOSED_STATES.includes(l.state))
  const pct = linked.length ? Math.round((closedLinked.length / linked.length) * 100) : 0

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div
          className="goal-hero"
          style={{ minWidth: '100%', cursor: 'default', background: GOAL_GRADIENTS[index % GOAL_GRADIENTS.length] }}
        >
          <div className="gh-top">
            🎯 {goal.horizon ?? 'Mục tiêu'}
            {goal.lifeArea ? ` · ${LIFE_AREA_META[goal.lifeArea].icon} ${LIFE_AREA_META[goal.lifeArea].label}` : ''}
          </div>
          <div className="gh-title">{goal.title}</div>
          {goal.why && <div className="gh-why">“{goal.why}”</div>}
          <div className="gh-progress">
            <div style={{ width: `${pct}%` }} />
          </div>
          <div className="gh-meta">
            {linked.length
              ? `${closedLinked.length}/${linked.length} việc đã xong · ${pct}%`
              : 'Chưa có việc nào gắn với mục tiêu này'}
          </div>
        </div>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', margin: '16px 0 6px' }}>
          🔥 Việc đang phục vụ mục tiêu ({openLinked.length})
        </label>
        {openLinked.length === 0 ? (
          <div className="empty">
            Chưa có việc nào. Khi “Làm rõ” một mối bận tâm, chọn chip 🎯 để gắn nó vào mục tiêu này.
          </div>
        ) : (
          openLinked.map((l) => <LoopCard key={l.id} loop={l} showState />)
        )}

        {closedLinked.length > 0 && (
          <>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-soft)', margin: '16px 0 6px' }}>
              ✅ Đã hoàn thành ({closedLinked.length})
            </label>
            {closedLinked.map((l) => (
              <LoopCard key={l.id} loop={l} showState />
            ))}
          </>
        )}

        <div className="modal-footer" style={{ flexWrap: 'wrap' }}>
          <button
            className="btn success"
            onClick={() => {
              dispatch({ type: 'updateGoal', id: goal.id, patch: { doneAt: Date.now() } })
              onClose()
            }}
          >
            🏆 Đã đạt được
          </button>
          <button className="btn" onClick={() => setEditing(true)}>
            ✎ Sửa
          </button>
          <button
            className="btn ghost"
            onClick={() => {
              if (confirm('Xoá mục tiêu này? Các việc đã gắn sẽ được gỡ liên kết.')) {
                dispatch({ type: 'deleteGoal', id: goal.id })
                onClose()
              }
            }}
          >
            Xoá
          </button>
          <button className="btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
