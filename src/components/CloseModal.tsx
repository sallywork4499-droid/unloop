import { useState } from 'react'
import { useStore } from '../store'
import type { Loop } from '../types'

type CloseState = 'resolved' | 'accepted' | 'notdoing'

interface Props {
  loop: Loop
  initial?: CloseState
  onClose: () => void
}

const CLOSE_META: Record<CloseState, { icon: string; label: string; prompt: string }> = {
  resolved: { icon: '✅', label: 'Đã giải quyết', prompt: 'Điều gì khiến bạn thấy việc này đã xong?' },
  accepted: {
    icon: '🕊️',
    label: 'Chấp nhận & buông',
    prompt: 'Viết một câu chấp nhận — VD: “Chuyện này ngoài tầm kiểm soát của mình, mình chọn không mang nó theo nữa.”',
  },
  notdoing: { icon: '🚫', label: 'Quyết định không làm', prompt: 'Vì sao không làm là lựa chọn đúng? (VD: không phù hợp ưu tiên năm nay)' },
}

/**
 * Nghi thức đóng loop: chọn cách đóng + micro-reflection 3 câu (tuỳ chọn) → tạo Lesson.
 * Đóng loop có nghi thức giúp não thực sự "buông", giảm attention residue.
 */
export default function CloseModal({ loop, initial = 'resolved', onClose }: Props) {
  const { dispatch } = useStore()
  const [state, setState] = useState<CloseState>(initial)
  const [closeNote, setCloseNote] = useState('')
  const [showReflect, setShowReflect] = useState(false)
  const [situation, setSituation] = useState('')
  const [insight, setInsight] = useState('')
  const [guideline, setGuideline] = useState('')

  function submit() {
    dispatch({
      type: 'closeLoop',
      id: loop.id,
      state,
      closeNote: closeNote.trim() || undefined,
      lesson: showReflect
        ? {
            situation: situation.trim() || undefined,
            insight: insight.trim() || undefined,
            guideline: guideline.trim() || undefined,
          }
        : undefined,
    })
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Đóng loop: {loop.title}</h2>
        <p className="subtitle">Một loop có thể đóng bằng hành động, bằng chấp nhận, hoặc bằng lời từ chối rõ ràng. Cả ba đều đáng được ghi nhận.</p>

        <div className="chips">
          {(Object.keys(CLOSE_META) as CloseState[]).map((s) => (
            <button key={s} className={`chip${state === s ? ' on' : ''}`} onClick={() => setState(s)}>
              {CLOSE_META[s].icon} {CLOSE_META[s].label}
            </button>
          ))}
        </div>

        <label>{CLOSE_META[state].prompt}</label>
        <textarea value={closeNote} onChange={(e) => setCloseNote(e.target.value)} placeholder="Tuỳ chọn — nhưng một câu thôi cũng giúp não khép lại hẳn." />

        {!showReflect ? (
          <button className="btn ghost" style={{ marginTop: 12 }} onClick={() => setShowReflect(true)}>
            ✍️ Rút một bài học từ chuyện này (30 giây)
          </button>
        ) : (
          <>
            <label>1. Chuyện gì đã xảy ra?</label>
            <input type="text" value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="Tình huống, ngắn gọn" />
            <label>2. Bạn nhận ra điều gì?</label>
            <input type="text" value={insight} onChange={(e) => setInsight(e.target.value)} placeholder="Insight của bạn" />
            <label>3. Lần sau gặp chuyện tương tự, bạn sẽ…?</label>
            <input type="text" value={guideline} onChange={(e) => setGuideline(e.target.value)} placeholder="Nguyên tắc cho lần sau" />
          </>
        )}

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            Huỷ
          </button>
          <button className="btn primary" onClick={submit}>
            {CLOSE_META[state].icon} Đóng loop
          </button>
        </div>
      </div>
    </div>
  )
}
