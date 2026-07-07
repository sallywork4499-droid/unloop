import { useMemo, useState } from 'react'
import { useStore } from '../store'
import type { LifeArea, Loop, LoopState } from '../types'
import { LIFE_AREA_META, addDays, todayStr } from '../types'
import { suggestArea, suggestState, suggestType } from '../lib/suggest'

interface Props {
  loop: Loop
  onClose: () => void
  onRequestCloseLoop?: (state: 'accepted' | 'notdoing') => void
}

const STATE_OPTS: { id: LoopState; icon: string; label: string }[] = [
  { id: 'active', icon: '🔥', label: 'Xử lý ngay' },
  { id: 'waiting', icon: '⏳', label: 'Đang chờ ai đó' },
  { id: 'parked', icon: '🅿️', label: 'Tạm gác' },
  { id: 'accepted', icon: '🕊️', label: 'Chấp nhận & buông' },
  { id: 'notdoing', icon: '🚫', label: 'Không làm' },
]

/**
 * "Làm rõ" bản rút gọn — MỘT màn hình, app điền sẵn mọi thứ bằng gợi ý tự động,
 * người dùng chỉ liếc qua, sửa chỗ chưa đúng, rồi buông. Mục tiêu: ~5 giây.
 */
export default function ClarifyModal({ loop, onClose, onRequestCloseLoop }: Props) {
  const { data, dispatch, activeSlotsLeft, activeGoals } = useStore()

  const sugArea = useMemo(() => loop.lifeArea ?? suggestArea(loop.title), [loop])
  const sugState = useMemo<LoopState>(
    () => (loop.state !== 'inbox' ? loop.state : suggestState(loop.title, loop.deadline, activeSlotsLeft)),
    [loop, activeSlotsLeft],
  )

  const [nextAction, setNextAction] = useState(loop.nextAction ?? '')
  const [deadline, setDeadline] = useState(loop.deadline ?? '')
  const [goalId, setGoalId] = useState<string | undefined>(loop.goalId)
  const [showOther, setShowOther] = useState(Boolean(loop.customGoal))
  const [otherGoal, setOtherGoal] = useState(loop.customGoal ?? '')
  const [lifeArea, setLifeArea] = useState<LifeArea | undefined>(sugArea)
  const [target, setTarget] = useState<LoopState>(sugState)
  const [waitingFor, setWaitingFor] = useState(loop.waitingFor ?? '')
  const [reviewDate, setReviewDate] = useState(loop.reviewDate ?? '')

  // Bài học cũ quay lại đúng lúc: cùng khía cạnh với vấn đề đang làm rõ
  const pastLesson = useMemo(() => {
    if (!lifeArea) return undefined
    return data.lessons.find((les) => {
      const src = data.loops.find((l) => l.id === les.loopId)
      return src?.lifeArea === lifeArea && src.id !== loop.id && (les.guideline || les.insight)
    })
  }, [lifeArea, data, loop.id])

  const activeFull = activeSlotsLeft === 0 && loop.state !== 'active'

  function save() {
    const patch: Partial<Loop> = {
      type: loop.type ?? suggestType(loop.title),
      nextAction: nextAction.trim() || undefined,
      deadline: deadline || undefined,
      goalId: showOther ? undefined : goalId,
      customGoal: showOther ? otherGoal.trim() || undefined : undefined,
      lifeArea,
      waitingFor: target === 'waiting' ? waitingFor.trim() || undefined : undefined,
      reviewDate:
        target === 'waiting'
          ? reviewDate || addDays(3)
          : target === 'parked'
            ? reviewDate || addDays(7)
            : undefined,
    }
    if (target === 'accepted' || target === 'notdoing') {
      dispatch({ type: 'updateLoop', id: loop.id, patch })
      if (onRequestCloseLoop) onRequestCloseLoop(target)
      else {
        dispatch({ type: 'closeLoop', id: loop.id, state: target })
        onClose()
      }
      return
    }
    dispatch({ type: 'setLoopState', id: loop.id, state: target, patch })
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{loop.title}</h2>
        <p className="subtitle">App đã điền sẵn — liếc qua, sửa chỗ chưa đúng, rồi buông. ✨ = gợi ý.</p>

        <label>→ Bước nhỏ nhất tiếp theo (tuỳ chọn)</label>
        <input
          type="text"
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
          placeholder="VD: gửi email hỏi anh Nam"
        />

        <label>⏰ Deadline (tuỳ chọn)</label>
        <div className="chips">
          {[
            ['Hôm nay', todayStr()],
            ['Ngày mai', addDays(1)],
            ['Tuần này', addDays(7)],
          ].map(([lb, d]) => (
            <button
              key={lb}
              className={`chip sm${deadline === d ? ' on' : ''}`}
              onClick={() => setDeadline(deadline === d ? '' : d)}
            >
              {lb}
            </button>
          ))}
          <input
            type="date"
            min={todayStr()}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={{ width: 'auto', flex: 1, minWidth: 130 }}
          />
        </div>

        <label>🎯 Phục vụ mục tiêu nào? (tuỳ chọn)</label>
        <div className="chips">
          {activeGoals.map((g) => (
            <button
              key={g.id}
              className={`chip sm${!showOther && goalId === g.id ? ' on' : ''}`}
              onClick={() => {
                setShowOther(false)
                setGoalId(goalId === g.id ? undefined : g.id)
              }}
            >
              🎯 {g.title}
            </button>
          ))}
          <button
            className={`chip sm${showOther ? ' on' : ''}`}
            onClick={() => {
              setShowOther(!showOther)
              setGoalId(undefined)
            }}
          >
            ✍️ Khác
          </button>
        </div>
        {showOther && (
          <input
            type="text"
            value={otherGoal}
            onChange={(e) => setOtherGoal(e.target.value)}
            placeholder="Mục tiêu khác — tự điền"
            style={{ marginTop: 8 }}
            autoFocus
          />
        )}

        <label>
          🏷 Khía cạnh cuộc sống{sugArea && lifeArea === sugArea ? ' · ✨ gợi ý' : ''}
        </label>
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

        <label>📍 Đặt vào đâu?{target === sugState ? ' · ✨ gợi ý' : ''}</label>
        <div className="chips">
          {STATE_OPTS.map((s) => (
            <button
              key={s.id}
              className={`chip sm${target === s.id ? ' on' : ''}`}
              style={s.id === 'active' && activeFull ? { opacity: 0.45 } : undefined}
              onClick={() => {
                if (s.id === 'active' && activeFull) return
                setTarget(s.id)
              }}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
        {activeFull && (
          <div className="meta2">
            Danh sách "Xử lý ngay" đã đủ {data.settings.activeLimit} việc — não chỉ chứa được chừng đó.
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
            <label>Ngày hỏi lại</label>
            <input type="date" min={todayStr()} value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
          </>
        )}
        {target === 'parked' && (
          <>
            <label>Ngày xem lại</label>
            <input type="date" min={todayStr()} value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} />
          </>
        )}

        {pastLesson && (
          <div className="notice calm" style={{ marginTop: 12 }}>
            💡 Bạn từng rút ra: “{pastLesson.guideline || pastLesson.insight}”
          </div>
        )}

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            Để sau
          </button>
          <button className="btn primary" onClick={save}>
            Xong — buông được rồi ✓
          </button>
        </div>
      </div>
    </div>
  )
}
