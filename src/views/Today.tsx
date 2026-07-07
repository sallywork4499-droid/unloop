import { useState } from 'react'
import { useStore } from '../store'
import LoopCard from '../components/LoopCard'
import ClarifyModal from '../components/ClarifyModal'
import CloseModal from '../components/CloseModal'
import GoalDetailModal, { GOAL_GRADIENTS } from '../components/GoalDetailModal'
import LoopListModal from '../components/LoopListModal'
import type { Loop } from '../types'
import { CLOSED_STATES, addDays, isControlled } from '../types'
import { getCoachPrompt } from '../lib/coach'
import { quoteOfTheDay } from '../lib/quotes'

/** Màn hình "Hôm nay": chỉ vài loop Active + những gì đến hẹn. Phần còn lại app đang giữ hộ. */
export default function Today() {
  const { active, waiting, parked, inbox, closed, dueToday, dispatch, data, activeGoals } = useStore()
  const [clarifying, setClarifying] = useState<Loop | null>(null)
  const [closing, setClosing] = useState<{ loop: Loop; initial?: 'resolved' | 'accepted' | 'notdoing' } | null>(null)
  const [dismissed, setDismissed] = useState<string[]>([])
  const [goalDetail, setGoalDetail] = useState<number | null>(null)
  const [statList, setStatList] = useState<'active' | 'held' | 'closed' | null>(null)
  const coach = getCoachPrompt(data, dismissed)
  const coachLoop = coach?.loopId ? data.loops.find((l) => l.id === coach.loopId) : undefined

  const controlledList = data.loops.filter(
    (l) => isControlled(l) && !['resolved', 'accepted', 'notdoing', 'archived'].includes(l.state),
  )
  const controlled = controlledList.length
  const closedList = closed.filter((l) => l.state !== 'archived')
  const closedCount = closedList.length

  function park(loop: Loop) {
    dispatch({ type: 'setLoopState', id: loop.id, state: 'parked', patch: { reviewDate: loop.reviewDate ?? addDays(7) } })
  }

  return (
    <>
      {activeGoals.length > 0 && (
        <div className="goal-carousel">
          {activeGoals.map((g, i) => {
            const linked = data.loops.filter((l) => l.goalId === g.id)
            const done = linked.filter((l) => CLOSED_STATES.includes(l.state)).length
            const pct = linked.length ? Math.round((done / linked.length) * 100) : 0
            return (
              <div
                className="goal-hero mini"
                key={g.id}
                style={{
                  background: GOAL_GRADIENTS[i % GOAL_GRADIENTS.length],
                  minWidth: activeGoals.length === 1 ? '100%' : undefined,
                }}
                onClick={() => setGoalDetail(i)}
              >
                <div className="gh-top">🎯 {g.horizon ?? 'Mục tiêu'}</div>
                <div className="gh-title">{g.title}</div>
                <div className="gh-progress">
                  <div style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
      {coach && (
        <div className="coach">
          <div className="coach-head">
            <span className="coach-label">🤔 Câu hỏi nhỏ</span>
            <button className="coach-x" onClick={() => setDismissed([...dismissed, coach.id])}>
              ✕
            </button>
          </div>
          {coach.loopTitle && <div className="coach-title">{coach.loopTitle}</div>}
          <div className="coach-q">{coach.question}</div>
          {coach.suggest !== 'none' && coachLoop && (
            <div className="actions">
              {coach.suggest === 'clarify' && (
                <button className="btn info" onClick={() => setClarifying(coachLoop)}>
                  {coach.actionLabel}
                </button>
              )}
              {coach.suggest === 'letgo' && (
                <button className="btn warn" onClick={() => setClosing({ loop: coachLoop, initial: 'notdoing' })}>
                  {coach.actionLabel}
                </button>
              )}
              <button
                className="btn ghost"
                onClick={() =>
                  dispatch({
                    type: 'setLoopState',
                    id: coachLoop.id,
                    state: 'parked',
                    patch: { reviewDate: coachLoop.reviewDate ?? addDays(7) },
                  })
                }
              >
                Gác lại
              </button>
            </div>
          )}
        </div>
      )}

      <div className="stats">
        <div className="stat clickable" onClick={() => setStatList('active')}>
          <div className="num">{active.length}</div>
          <div className="lbl">đang xử lý</div>
        </div>
        <div className="stat clickable" onClick={() => setStatList('held')}>
          <div className="num">{controlled}</div>
          <div className="lbl">đã kiểm soát</div>
        </div>
        <div className="stat clickable" onClick={() => setStatList('closed')}>
          <div className="num">{closedCount}</div>
          <div className="lbl">đã đóng</div>
        </div>
      </div>

      {dueToday.length > 0 && (
        <>
          <div className="section-title">
            <span>📅 Đến hẹn hôm nay</span>
            <span className="count">{dueToday.length}</span>
          </div>
          {dueToday.map((l) => (
            <LoopCard key={l.id} loop={l} showState>
              <button className="btn info" onClick={() => setClarifying(l)}>
                Xử lý bây giờ
              </button>
              <button
                className="btn ghost"
                onClick={() => dispatch({ type: 'updateLoop', id: l.id, patch: { reviewDate: addDays(3) } })}
              >
                Dời hẹn +3 ngày
              </button>
              <button className="btn success" onClick={() => setClosing({ loop: l })}>
                ✓ Đóng
              </button>
            </LoopCard>
          ))}
        </>
      )}

      <div className="section-title">
        <span>🔥 Trước mặt bạn hôm nay</span>
        <span className="count">
          {active.length}/{data.settings.activeLimit}
        </span>
      </div>
      {active.length === 0 ? (
        <div className="empty">
          <span className="big-emoji">🍃</span>
          Không có gì cần xử lý ngay.
          {inbox.length > 0
            ? ` Có ${inbox.length} điều trong Inbox chờ bạn làm rõ khi sẵn sàng.`
            : ' Đầu óc bạn đang trống chỗ — tận hưởng đi.'}
        </div>
      ) : (
        active.map((l) => (
          <LoopCard key={l.id} loop={l}>
            <button className="btn success" onClick={() => setClosing({ loop: l, initial: 'resolved' })}>
              ✓ Xong
            </button>
            <button className="btn ghost" onClick={() => setClarifying(l)}>
              Sửa
            </button>
            <button className="btn ghost" onClick={() => park(l)}>
              Gác lại
            </button>
          </LoopCard>
        ))
      )}

      {(waiting.length > 0 || parked.length > 0) && (
        <div className="notice calm" style={{ marginTop: 14 }}>
          🔒 App đang giữ hộ bạn {waiting.length > 0 ? `${waiting.length} việc đang chờ người khác` : ''}
          {waiting.length > 0 && parked.length > 0 ? ' và ' : ''}
          {parked.length > 0 ? `${parked.length} việc tạm gác` : ''} — sẽ tự nhắc đúng hẹn, bạn không cần nhớ.
        </div>
      )}

      <div className="quote">
        “{quoteOfTheDay().text}”<span>— {quoteOfTheDay().source}</span>
      </div>

      {clarifying && (
        <ClarifyModal
          loop={clarifying}
          onClose={() => setClarifying(null)}
          onRequestCloseLoop={(s) => {
            const l = clarifying
            setClarifying(null)
            setClosing({ loop: l, initial: s })
          }}
        />
      )}
      {closing && <CloseModal loop={closing.loop} initial={closing.initial} onClose={() => setClosing(null)} />}
      {statList && (
        <LoopListModal
          title={
            statList === 'active'
              ? '🔥 Đang xử lý'
              : statList === 'held'
                ? '🔒 Đã kiểm soát — app giữ hộ'
                : '✅ Đã đóng'
          }
          subtitle={
            statList === 'held'
              ? 'Những việc có trạng thái rõ và lịch hẹn — bạn không cần nhớ chúng.'
              : undefined
          }
          loops={statList === 'active' ? active : statList === 'held' ? controlledList : closedList}
          showState={statList !== 'active'}
          onClose={() => setStatList(null)}
        />
      )}
      {goalDetail !== null && activeGoals[goalDetail] && (
        <GoalDetailModal
          goal={activeGoals[goalDetail]}
          index={goalDetail}
          onClose={() => setGoalDetail(null)}
        />
      )}
    </>
  )
}
