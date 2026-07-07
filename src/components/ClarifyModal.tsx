import { useState } from 'react'
import { useStore } from '../store'
import type { LifeArea, Loop, LoopState, LoopType } from '../types'
import { LIFE_AREA_META, LOOP_TYPE_META, addDays, todayStr } from '../types'

interface Props {
  loop: Loop
  onClose: () => void
  onRequestCloseLoop?: (state: 'accepted' | 'notdoing') => void
}

/**
 * "Clarify just enough" — 3 bước ngắn:
 * 1. Đây là loại gì?  2. Một câu hỏi đúng loại.  3. Đặt nó vào đâu?
 * Mục tiêu: sau bước này, não có thể buông vấn đề mà không sợ quên.
 */
export default function ClarifyModal({ loop, onClose, onRequestCloseLoop }: Props) {
  const { dispatch, activeSlotsLeft, data, activeGoals } = useStore()
  const [step, setStep] = useState(0)
  const [type, setType] = useState<LoopType | undefined>(loop.type)
  const [nextAction, setNextAction] = useState(loop.nextAction ?? '')
  const [note, setNote] = useState(loop.note ?? '')
  const [canAct, setCanAct] = useState<boolean | null>(null)
  const [target, setTarget] = useState<LoopState | null>(null)
  const [reviewDate, setReviewDate] = useState(loop.reviewDate ?? '')
  const [waitingFor, setWaitingFor] = useState(loop.waitingFor ?? '')
  const [load, setLoad] = useState(loop.emotionalLoad ?? 0)
  const [lifeArea, setLifeArea] = useState<LifeArea | undefined>(loop.lifeArea)
  const [goalId, setGoalId] = useState<string | undefined>(loop.goalId)

  const typeQuestion: Record<LoopType, string> = {
    action: 'Bước nhỏ nhất bạn có thể làm là gì?',
    decision: 'Bạn đang phân vân giữa những lựa chọn nào?',
    unclear: 'Bạn muốn hiểu rõ hơn điều gì?',
    emotion: 'Bạn có thể làm gì được với chuyện này không?',
    idea: 'Ghi chú nhanh về ý tưởng (tuỳ chọn)',
  }

  function save() {
    if (!target) return
    const patch: Partial<Loop> = {
      type,
      nextAction: nextAction.trim() || undefined,
      note: note.trim() || undefined,
      emotionalLoad: load || undefined,
      lifeArea,
      goalId,
      reviewDate: reviewDate || undefined,
      waitingFor: target === 'waiting' ? waitingFor.trim() || undefined : undefined,
    }
    dispatch({ type: 'setLoopState', id: loop.id, state: target, patch })
    onClose()
  }

  const steps = ['Loại', 'Làm rõ', 'Đặt vào đâu']

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="wizard-progress">
          {steps.map((_, i) => (
            <span key={i} className={i <= step ? 'done' : ''} />
          ))}
        </div>
        <h2>{loop.title}</h2>

        {step === 0 && (
          <>
            <p className="subtitle">Đây là chuyện gì? Chỉ cần chọn đúng “ngăn” — não sẽ nhẹ hơn ngay.</p>
            <div className="chips">
              {(Object.keys(LOOP_TYPE_META) as LoopType[]).map((t) => (
                <button
                  key={t}
                  className={`chip block${type === t ? ' on' : ''}`}
                  onClick={() => {
                    setType(t)
                    setStep(1)
                  }}
                >
                  {LOOP_TYPE_META[t].icon} {LOOP_TYPE_META[t].label}
                  <span className="hint">{LOOP_TYPE_META[t].hint}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && type && (
          <>
            <p className="subtitle">{typeQuestion[type]}</p>

            {type === 'emotion' && canAct === null ? (
              <div className="chips">
                <button
                  className="chip block"
                  onClick={() => {
                    setCanAct(true)
                    setType('action')
                  }}
                >
                  ✅ Có — có việc mình làm được
                  <span className="hint">Chuyển thành việc có thể làm, xác định bước nhỏ nhất</span>
                </button>
                <button className="chip block" onClick={() => setCanAct(false)}>
                  🙏 Không — ngoài tầm kiểm soát
                  <span className="hint">Không sao. Chấp nhận cũng là một cách đóng loop hợp lệ</span>
                </button>
              </div>
            ) : (
              <>
                {(type === 'action' || type === 'decision') && (
                  <input
                    type="text"
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    placeholder={type === 'action' ? 'VD: gửi email hỏi anh Nam' : 'VD: chọn giữa A / B — hỏi ý kiến vợ trước'}
                    autoFocus
                  />
                )}
                {(type === 'unclear' || type === 'idea' || (type === 'emotion' && canAct === false)) && (
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={
                      type === 'emotion'
                        ? 'Viết ra 1–2 câu về điều đang đè nặng (tuỳ chọn)'
                        : 'Ghi ngắn gọn (tuỳ chọn)'
                    }
                  />
                )}
                <label>Thuộc khía cạnh nào của cuộc sống? (tuỳ chọn)</label>
                <div className="chips">
                  {(Object.keys(LIFE_AREA_META) as LifeArea[]).map((a) => (
                    <button
                      key={a}
                      className={`chip sm${lifeArea === a ? ' on' : ''}`}
                      onClick={() => setLifeArea(lifeArea === a ? undefined : a)}
                    >
                      {LIFE_AREA_META[a].icon} {LIFE_AREA_META[a].label}
                    </button>
                  ))}
                </div>
                {activeGoals.length > 0 && (
                  <>
                    <label>Phục vụ mục tiêu nào? (tuỳ chọn)</label>
                    <div className="chips">
                      {activeGoals.map((g) => (
                        <button
                          key={g.id}
                          className={`chip sm${goalId === g.id ? ' on' : ''}`}
                          onClick={() => setGoalId(goalId === g.id ? undefined : g.id)}
                        >
                          🎯 {g.title}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <label>Mức “nặng đầu” (tuỳ chọn)</label>
                <div className="slider-row">
                  <input
                    type="range"
                    min={0}
                    max={5}
                    value={load}
                    onChange={(e) => setLoad(Number(e.target.value))}
                  />
                  <span>{load === 0 ? '—' : '🪨'.repeat(load)}</span>
                </div>
                <div className="modal-footer">
                  <button className="btn" onClick={() => setStep(0)}>
                    ← Lại
                  </button>
                  <button className="btn primary" onClick={() => setStep(2)}>
                    Tiếp →
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <p className="subtitle">
              Đặt nó vào đâu để bạn có thể <b>ngừng nghĩ về nó</b> mà không sợ quên?
            </p>
            <div className="chips">
              <button
                className={`chip block${target === 'active' ? ' on' : ''}`}
                disabled={activeSlotsLeft === 0 && loop.state !== 'active'}
                onClick={() => setTarget('active')}
              >
                🔥 Xử lý ngay (Active)
                <span className="hint">
                  {activeSlotsLeft === 0 && loop.state !== 'active'
                    ? `Đã đủ ${data.settings.activeLimit} việc active — não chỉ chứa được chừng đó. Hãy gác bớt trước.`
                    : `Còn ${activeSlotsLeft} chỗ trống. Chỉ giữ vài việc trước mặt.`}
                </span>
              </button>
              <button
                className={`chip block${target === 'waiting' ? ' on' : ''}`}
                onClick={() => {
                  setTarget('waiting')
                  if (!reviewDate) setReviewDate(addDays(3))
                }}
              >
                ⏳ Đang chờ người khác (Waiting)
                <span className="hint">Đã gửi đi rồi — app sẽ nhắc bạn hỏi lại đúng hẹn</span>
              </button>
              <button
                className={`chip block${target === 'parked' ? ' on' : ''}`}
                onClick={() => {
                  setTarget('parked')
                  if (!reviewDate) setReviewDate(addDays(7))
                }}
              >
                🅿️ Tạm gác có chủ đích (Parked)
                <span className="hint">Chưa phải bây giờ — sẽ tự quay lại với bạn đúng ngày hẹn</span>
              </button>
              {onRequestCloseLoop && (
                <>
                  <button className="chip block" onClick={() => onRequestCloseLoop('accepted')}>
                    🕊️ Chấp nhận & buông (Accepted)
                    <span className="hint">Ngoài tầm kiểm soát — đóng loop bằng sự chấp nhận</span>
                  </button>
                  <button className="chip block" onClick={() => onRequestCloseLoop('notdoing')}>
                    🚫 Quyết định không làm (Not doing)
                    <span className="hint">Nói không cũng là một cách đóng loop dứt khoát</span>
                  </button>
                </>
              )}
            </div>

            {target === 'active' && activeGoals.length > 0 && !goalId && (
              <div className="notice" style={{ marginTop: 10 }}>
                💡 Việc này chưa gắn với mục tiêu nào. Vẫn có thể quan trọng — nhưng đáng tự hỏi
                trước khi trao cho nó 1 trong {data.settings.activeLimit} chỗ quý giá.
              </div>
            )}
            {target === 'waiting' && (
              <>
                <label>Đang chờ ai / cái gì?</label>
                <input
                  type="text"
                  value={waitingFor}
                  onChange={(e) => setWaitingFor(e.target.value)}
                  placeholder="VD: phản hồi của chị Lan"
                />
              </>
            )}
            {(target === 'waiting' || target === 'parked') && (
              <>
                <label>{target === 'waiting' ? 'Ngày hỏi lại' : 'Ngày xem lại'}</label>
                <input
                  type="date"
                  min={todayStr()}
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                />
              </>
            )}

            <div className="modal-footer">
              <button className="btn" onClick={() => setStep(1)}>
                ← Lại
              </button>
              <button className="btn primary" disabled={!target} onClick={save}>
                Xong — buông được rồi
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
