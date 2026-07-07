import { useState } from 'react'
import { useStore } from '../store'
import ClarifyModal from './ClarifyModal'
import CloseModal from './CloseModal'
import type { Loop } from '../types'
import { LIFE_AREA_META, LOOP_TYPE_META, STATE_META, isClosed, isControlled } from '../types'

function fmt(ts?: number): string {
  return ts ? new Date(ts).toLocaleDateString('vi-VN') : ''
}

/** Trang chi tiết một mối bận tâm — mở khi chạm vào thẻ. */
export default function LoopDetailModal({ loop, onClose }: { loop: Loop; onClose: () => void }) {
  const { data, dispatch } = useStore()
  const [mode, setMode] = useState<'detail' | 'clarify' | 'close'>('detail')
  const [closeInitial, setCloseInitial] = useState<'resolved' | 'accepted' | 'notdoing'>('resolved')

  if (mode === 'clarify')
    return (
      <ClarifyModal
        loop={loop}
        onClose={onClose}
        onRequestCloseLoop={(s) => {
          setCloseInitial(s)
          setMode('close')
        }}
      />
    )
  if (mode === 'close') return <CloseModal loop={loop} initial={closeInitial} onClose={onClose} />

  const goal = loop.goalId ? data.goals.find((g) => g.id === loop.goalId) : undefined
  const lessons = data.lessons.filter((l) => l.loopId === loop.id)
  const closed = isClosed(loop)
  const s = STATE_META[loop.state]

  const rows: [string, string][] = []
  rows.push(['Loại', loop.type ? `${LOOP_TYPE_META[loop.type].icon} ${LOOP_TYPE_META[loop.type].label}` : 'Chưa phân loại'])
  if (loop.nextAction) rows.push(['Bước tiếp theo', loop.nextAction])
  if (loop.lifeArea) rows.push(['Khía cạnh', `${LIFE_AREA_META[loop.lifeArea].icon} ${LIFE_AREA_META[loop.lifeArea].label}`])
  if (goal) rows.push(['Mục tiêu', `🎯 ${goal.title}`])
  if (loop.waitingFor) rows.push(['Đang chờ', loop.waitingFor])
  if (loop.reviewDate) rows.push(['Lịch hẹn xem lại', loop.reviewDate.split('-').reverse().join('/')])
  if (loop.emotionalLoad) rows.push(['Mức nặng đầu', '🪨'.repeat(loop.emotionalLoad)])
  if (loop.note) rows.push(['Ghi chú', loop.note])
  if (loop.closeNote) rows.push(['Lời khép lại', loop.closeNote])
  rows.push(['Ghi nhận lúc', fmt(loop.createdAt)])
  if (loop.closedAt) rows.push(['Đóng lúc', fmt(loop.closedAt)])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{loop.title}</h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '8px 0 2px' }}>
          <span className={`badge ${s.color}`}>{s.label}</span>
          {isControlled(loop) && !closed && loop.state !== 'inbox' && (
            <span className="badge teal">🔒 đã kiểm soát</span>
          )}
        </div>
        <p className="subtitle" style={{ marginTop: 6 }}>
          {s.desc}
        </p>

        <div className="drows">
          {rows.map(([k, v]) => (
            <div className="drow" key={k}>
              <span>{k}</span>
              <b>{v}</b>
            </div>
          ))}
        </div>

        {lessons.length > 0 && (
          <>
            <label>📖 Bài học từ loop này</label>
            {lessons.map((les) => (
              <div className="next" key={les.id}>
                {[les.situation, les.insight, les.guideline].filter(Boolean).join(' → ')}
              </div>
            ))}
          </>
        )}

        <div className="modal-footer" style={{ flexWrap: 'wrap' }}>
          {!closed ? (
            <>
              <button className="btn info" onClick={() => setMode('clarify')}>
                ✎ Làm rõ / Chuyển
              </button>
              <button className="btn success" onClick={() => setMode('close')}>
                ✓ Đóng loop
              </button>
            </>
          ) : (
            loop.state !== 'archived' && (
              <button
                className="btn"
                onClick={() => {
                  dispatch({ type: 'setLoopState', id: loop.id, state: 'archived' })
                  onClose()
                }}
              >
                🗄 Lưu trữ
              </button>
            )
          )}
          <button
            className="btn ghost"
            onClick={() => {
              if (confirm('Xoá hẳn mối bận tâm này?')) {
                dispatch({ type: 'deleteLoop', id: loop.id })
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
