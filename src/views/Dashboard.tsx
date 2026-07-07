import { useState } from 'react'
import { useStore } from '../store'
import GoalModal from '../components/GoalModal'
import GoalDetailModal, { GOAL_GRADIENTS } from '../components/GoalDetailModal'
import LoopListModal from '../components/LoopListModal'
import type { Goal, LifeArea, LoopState } from '../types'
import { CLOSED_STATES, GOAL_LIMIT, LIFE_AREA_META } from '../types'
import type { QuoteTheme } from '../lib/quotes'
import { QUOTES, QUOTE_THEME_META } from '../lib/quotes'

const OPEN_STATES: LoopState[] = ['inbox', 'active', 'waiting', 'parked']

/**
 * Tổng quan: mục tiêu (hero) → băng thông não (biểu đồ vòng) → phân bố khía cạnh
 * → bài học & kho trích dẫn.
 */
export default function Dashboard() {
  const { data, dispatch, activeGoals } = useStore()
  const [goalModal, setGoalModal] = useState<{ goal?: Goal } | null>(null)
  const [goalDetail, setGoalDetail] = useState<string | null>(null)
  const [statList, setStatList] = useState<LoopState | 'closed' | null>(null)
  const [showLessons, setShowLessons] = useState(false)
  const [showQuotes, setShowQuotes] = useState(false)
  const [theme, setTheme] = useState<QuoteTheme | 'all'>('all')

  const open = data.loops.filter((l) => OPEN_STATES.includes(l.state))
  const closed = data.loops.filter((l) => !OPEN_STATES.includes(l.state))
  const closedMonthList = closed.filter(
    (l) => l.closedAt && l.closedAt > Date.now() - 30 * 24 * 3600 * 1000,
  )

  // --- Donut: băng thông não ---
  const segsAll: { key: LoopState; label: string; color: string }[] = [
    { key: 'active', label: '🔥 Đang xử lý', color: 'var(--teal)' },
    { key: 'waiting', label: '⏳ Đang chờ', color: 'var(--blue)' },
    { key: 'parked', label: '🅿️ Tạm gác', color: '#e2a33c' },
    { key: 'inbox', label: '📥 Chưa làm rõ', color: 'var(--ink-faint)' },
  ]
  const segs = segsAll
    .map((s) => ({ ...s, count: open.filter((l) => l.state === s.key).length }))
    .filter((s) => s.count > 0)
  const C = 2 * Math.PI * 45
  let acc = 0

  // --- Phân bố khía cạnh ---
  const groups = (Object.keys(LIFE_AREA_META) as LifeArea[])
    .map((area) => ({ area, count: open.filter((l) => l.lifeArea === area).length }))
    .filter((g) => g.count > 0)
    .sort((a, b) => b.count - a.count)
  const unassigned = open.filter((l) => !l.lifeArea).length
  const max = Math.max(1, ...groups.map((g) => g.count), unassigned)
  const top = groups[0]

  const goalsSection = (
    <>
      <div className="section-title" style={{ marginTop: 4 }}>
        <span>🎯 Mục tiêu hiện tại</span>
        <span className="count">
          {activeGoals.length}/{GOAL_LIMIT}
        </span>
      </div>
      {activeGoals.length === 0 ? (
        <>
          <div className="empty">
            <span className="big-emoji">🎯</span>
            Điều gì là quan trọng nhất với bạn lúc này?
            <br />
            Đặt tối đa {GOAL_LIMIT} mục tiêu — chúng sẽ luôn hiện trên màn hình Hôm nay để nhắc
            bạn.
          </div>
          <button className="btn big" style={{ width: '100%' }} onClick={() => setGoalModal({})}>
            + Thêm mục tiêu đầu tiên
          </button>
        </>
      ) : (
        <div className="goal-carousel">
          {activeGoals.map((g, i) => {
            const linked = data.loops.filter((l) => l.goalId === g.id)
            const closedLinked = linked.filter((l) => CLOSED_STATES.includes(l.state)).length
            const pct = linked.length ? Math.round((closedLinked / linked.length) * 100) : 0
            return (
              <div
                className="goal-hero"
                key={g.id}
                style={{ background: GOAL_GRADIENTS[i % GOAL_GRADIENTS.length] }}
                onClick={() => setGoalDetail(g.id)}
              >
                <div className="gh-top">🎯 {g.horizon ?? 'Mục tiêu'}</div>
                <div className="gh-title">{g.title}</div>
                {g.why && <div className="gh-why">“{g.why}”</div>}
                <div className="gh-progress">
                  <div style={{ width: `${pct}%` }} />
                </div>
                <div className="gh-meta">
                  {linked.length
                    ? `${closedLinked}/${linked.length} việc đã xong · ${pct}%`
                    : 'Chạm để xem & gắn việc vào mục tiêu này'}
                </div>
              </div>
            )
          })}
          {activeGoals.length < GOAL_LIMIT && (
            <button className="goal-add" onClick={() => setGoalModal({})}>
              ＋<br />
              Thêm
              <br />
              mục tiêu
            </button>
          )}
        </div>
      )}
    </>
  )

  const detailIdx = activeGoals.findIndex((g) => g.id === goalDetail)
  const detailGoal = detailIdx >= 0 ? activeGoals[detailIdx] : undefined
  const listLoops =
    statList === 'closed' ? closedMonthList : open.filter((l) => l.state === statList)

  return (
    <>
      {goalsSection}

      <div className="section-title">
        <span>🧠 Tình trạng băng thông não</span>
      </div>
      <div className="card donut-card">
        <svg viewBox="0 0 120 120" className="donut">
          <circle cx="60" cy="60" r="45" fill="none" stroke="var(--gray-soft)" strokeWidth="14" />
          {segs.map((s) => {
            const dash = (s.count / open.length) * C
            const el = (
              <circle
                key={s.key}
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${C - dash}`}
                strokeDashoffset={-acc}
                transform="rotate(-90 60 60)"
              />
            )
            acc += dash
            return el
          })}
          <text x="60" y="58" className="dn">
            {open.length}
          </text>
          <text x="60" y="74" className="ds">
            loop đang mở
          </text>
        </svg>
        <div className="dlegend">
          {segs.map((s) => (
            <button key={s.key} className="dleg" onClick={() => setStatList(s.key)}>
              <span className="dot2" style={{ background: s.color }} />
              {s.label}
              <b>{s.count}</b>
            </button>
          ))}
          {segs.length === 0 && <div className="meta2">Não đang trống chỗ — tuyệt! 🍃</div>}
          <button className="dleg" onClick={() => setStatList('closed')}>
            <span className="dot2" style={{ background: 'var(--green)' }} />✅ Đóng 30 ngày
            <b>{closedMonthList.length}</b>
          </button>
        </div>
      </div>

      {top && top.count >= 2 && (
        <div className="review-hero" style={{ marginTop: 12 }}>
          <h3>
            {LIFE_AREA_META[top.area].icon} Phần lớn mối bận tâm của bạn đang nằm ở{' '}
            {LIFE_AREA_META[top.area].label} ({top.count}/{open.length})
          </h3>
          <p>
            Thử dồn review tuần này vào khía cạnh đó: đóng bớt, gác bớt, hoặc chấp nhận — não sẽ
            nhẹ đi rõ rệt.
          </p>
        </div>
      )}

      <div className="section-title">
        <span>📊 Phân bố theo khía cạnh cuộc sống</span>
      </div>
      <div className="card">
        {groups.length === 0 && unassigned === 0 ? (
          <div className="empty" style={{ border: 'none', padding: 14 }}>
            Chưa có loop nào đang mở.
          </div>
        ) : (
          <>
            {groups.map((g) => (
              <div className="area-row" key={g.area}>
                <span className="al">
                  {LIFE_AREA_META[g.area].icon} {LIFE_AREA_META[g.area].label}
                </span>
                <div className="track">
                  <div className="fill" style={{ width: `${(g.count / max) * 100}%` }} />
                </div>
                <span className="cnt">{g.count}</span>
              </div>
            ))}
            {unassigned > 0 && (
              <div className="area-row">
                <span className="al">🏷 Chưa gắn</span>
                <div className="track">
                  <div className="fill dim" style={{ width: `${(unassigned / max) * 100}%` }} />
                </div>
                <span className="cnt">{unassigned}</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="section-title">
        <span>📖 Bài học của bạn</span>
        <button className="btn ghost" onClick={() => setShowLessons(!showLessons)}>
          {showLessons ? 'Ẩn' : `Xem (${data.lessons.length})`}
        </button>
      </div>
      {showLessons &&
        (data.lessons.length === 0 ? (
          <div className="empty">
            <span className="big-emoji">🌱</span>
            Khi đóng một loop, bạn có thể rút một bài học 30 giây.
            <br />
            Chúng sẽ tự quay lại nhắc bạn đúng lúc — và gom về đây.
          </div>
        ) : (
          data.lessons.map((les) => (
            <div key={les.id} className="card lesson-card">
              {les.situation && (
                <div className="part">
                  <b>Tình huống</b>
                  <br />
                  {les.situation}
                </div>
              )}
              {les.insight && (
                <div className="part">
                  <b>Nhận ra</b>
                  <br />
                  {les.insight}
                </div>
              )}
              {les.guideline && (
                <div className="part">
                  <b>Lần sau</b>
                  <br />
                  {les.guideline}
                </div>
              )}
              <div className="src">
                từ loop: “{les.loopTitle}” ·{' '}
                <button
                  className="btn ghost"
                  style={{ padding: 0, fontSize: 12 }}
                  onClick={() => dispatch({ type: 'deleteLesson', id: les.id })}
                >
                  xoá
                </button>
              </div>
            </div>
          ))
        ))}

      <div className="section-title">
        <span>📚 Kho trích dẫn — Vị thần Thái độ</span>
        <button className="btn ghost" onClick={() => setShowQuotes(!showQuotes)}>
          {showQuotes ? 'Ẩn' : `Xem (${QUOTES.length})`}
        </button>
      </div>
      {showQuotes && (
        <>
          <div className="chips" style={{ marginBottom: 10 }}>
            <button className={`chip sm${theme === 'all' ? ' on' : ''}`} onClick={() => setTheme('all')}>
              Tất cả
            </button>
            {(Object.keys(QUOTE_THEME_META) as QuoteTheme[]).map((t) => (
              <button key={t} className={`chip sm${theme === t ? ' on' : ''}`} onClick={() => setTheme(t)}>
                {QUOTE_THEME_META[t].icon} {QUOTE_THEME_META[t].label}
              </button>
            ))}
          </div>
          {(theme === 'all' ? QUOTES : QUOTES.filter((q) => q.theme === theme)).map((q, i) => (
            <div key={i} className="card">
              <div style={{ fontSize: 13.5, fontStyle: 'italic', lineHeight: 1.6 }}>“{q.text}”</div>
              <div className="meta2">
                {QUOTE_THEME_META[q.theme].icon} {QUOTE_THEME_META[q.theme].label}
              </div>
            </div>
          ))}
        </>
      )}

      {goalModal && <GoalModal goal={goalModal.goal} onClose={() => setGoalModal(null)} />}
      {detailGoal && (
        <GoalDetailModal goal={detailGoal} index={detailIdx} onClose={() => setGoalDetail(null)} />
      )}
      {statList && (
        <LoopListModal
          title={
            statList === 'closed'
              ? '✅ Đóng trong 30 ngày'
              : segsAll.find((s) => s.key === statList)?.label ?? ''
          }
          loops={listLoops}
          showState
          onClose={() => setStatList(null)}
        />
      )}
    </>
  )
}
