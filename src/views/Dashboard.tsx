import { useState } from 'react'
import { useStore } from '../store'
import GoalModal from '../components/GoalModal'
import GoalDetailModal, { GOAL_GRADIENTS } from '../components/GoalDetailModal'
import LoopListModal from '../components/LoopListModal'
import type { Goal, LifeArea } from '../types'
import { CLOSED_STATES, GOAL_LIMIT, LIFE_AREA_META, isControlled } from '../types'

const OPEN_STATES = ['inbox', 'active', 'waiting', 'parked']

/**
 * Tổng quan: các mối bận tâm đang dồn vào khía cạnh nào của cuộc sống?
 * Nhìn thấy bức tranh toàn cảnh → biết nên dồn sức giải quyết ở đâu.
 */
export default function Dashboard() {
  const { data, dispatch, activeGoals } = useStore()
  const [goalModal, setGoalModal] = useState<{ goal?: Goal } | null>(null)
  const [goalDetail, setGoalDetail] = useState<string | null>(null)
  const [statList, setStatList] = useState<'open' | 'controlled' | 'closed' | null>(null)
  const open = data.loops.filter((l) => OPEN_STATES.includes(l.state))
  const aligned = open.filter((l) => l.goalId && activeGoals.some((g) => g.id === l.goalId)).length
  const closed = data.loops.filter((l) => !OPEN_STATES.includes(l.state))

  const groups = (Object.keys(LIFE_AREA_META) as LifeArea[])
    .map((area) => {
      const items = open.filter((l) => l.lifeArea === area)
      return {
        area,
        count: items.length,
        load: items.reduce((s, l) => s + (l.emotionalLoad ?? 0), 0),
      }
    })
    .filter((g) => g.count > 0)
    .sort((a, b) => b.count - a.count)

  const unassigned = open.filter((l) => !l.lifeArea).length
  const max = Math.max(1, ...groups.map((g) => g.count), unassigned)
  const top = groups[0]
  const heavy = [...groups].sort((a, b) => b.load - a.load)[0]
  const controlledList = open.filter(isControlled)
  const controlled = controlledList.length
  const stale = open.filter((l) => Date.now() - l.stateChangedAt > 14 * 24 * 3600 * 1000).length
  const closedMonthList = closed.filter(
    (l) => l.closedAt && l.closedAt > Date.now() - 30 * 24 * 3600 * 1000,
  )
  const closedMonth = closedMonthList.length

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

  if (open.length === 0 && closed.length === 0) {
    return (
      <>
        {goalsSection}
        <div className="empty" style={{ marginTop: 16 }}>
          <span className="big-emoji">📊</span>
          Chưa có dữ liệu vấn đề. Hãy ghi lại vài mối bận tâm — bức tranh tổng quan sẽ hiện ra ở
          đây.
        </div>
        {goalModal && <GoalModal goal={goalModal.goal} onClose={() => setGoalModal(null)} />}
        {detailGoal && (
          <GoalDetailModal goal={detailGoal} index={detailIdx} onClose={() => setGoalDetail(null)} />
        )}
      </>
    )
  }

  return (
    <>
      {goalsSection}

      <div className="section-title">
        <span>🧠 Tình trạng băng thông não</span>
      </div>
      <div className="stats">
        <div className="stat clickable" onClick={() => setStatList('open')}>
          <div className="num">{open.length}</div>
          <div className="lbl">Loop đang mở</div>
        </div>
        <div className="stat clickable" onClick={() => setStatList('controlled')}>
          <div className="num">{controlled}</div>
          <div className="lbl">Đã kiểm soát</div>
        </div>
        <div className="stat clickable" onClick={() => setStatList('closed')}>
          <div className="num">{closedMonth}</div>
          <div className="lbl">Đóng trong 30 ngày</div>
        </div>
      </div>

      {top && top.count >= 2 && (
        <div className="review-hero" style={{ marginTop: 12 }}>
          <h3>
            {LIFE_AREA_META[top.area].icon} Phần lớn mối bận tâm của bạn đang nằm ở{' '}
            {LIFE_AREA_META[top.area].label} ({top.count}/{open.length})
          </h3>
          <p>
            {heavy && heavy.area !== top.area && heavy.load > 0
              ? `Nhưng khía cạnh "nặng đầu" nhất về cảm xúc lại là ${LIFE_AREA_META[heavy.area].label} — đáng để ưu tiên xử lý hoặc buông trước.`
              : 'Thử dồn review tuần này vào khía cạnh đó: đóng bớt, gác bớt, hoặc chấp nhận — não sẽ nhẹ đi rõ rệt.'}
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
                <span className="ld">{g.load > 0 ? '🪨'.repeat(Math.min(3, Math.ceil(g.load / g.count))) : ''}</span>
              </div>
            ))}
            {unassigned > 0 && (
              <div className="area-row">
                <span className="al">🏷 Chưa gắn</span>
                <div className="track">
                  <div className="fill dim" style={{ width: `${(unassigned / max) * 100}%` }} />
                </div>
                <span className="cnt">{unassigned}</span>
                <span className="ld" />
              </div>
            )}
          </>
        )}
      </div>

      {unassigned > 0 && (
        <div className="notice">
          🏷 Có {unassigned} loop chưa gắn khía cạnh — gắn thêm khi "Làm rõ" để bức tranh chính xác
          hơn.
        </div>
      )}
      {stale > 0 && (
        <div className="notice">
          ⏰ {stale} loop đã đứng yên hơn 2 tuần. Trong weekly review tới, hãy quyết định: làm, gác
          có hẹn, hay buông?
        </div>
      )}
      {open.length > 0 && controlled === open.length && (
        <div className="notice calm">
          🔒 Tất cả {open.length} loop đang mở đều đã được kiểm soát — có trạng thái rõ và lịch xem
          lại. Não bạn được phép nghỉ.
        </div>
      )}
      {activeGoals.length > 0 && open.length > 0 && (
        <div className={aligned === 0 ? 'notice' : 'notice calm'}>
          🎯 {aligned}/{open.length} mối bận tâm đang mở phục vụ trực tiếp mục tiêu của bạn.
          {aligned === 0
            ? ' Đáng suy nghĩ: bạn đang bận vì điều quan trọng, hay vì việc vặt?'
            : ''}
        </div>
      )}
      {goalModal && <GoalModal goal={goalModal.goal} onClose={() => setGoalModal(null)} />}
      {detailGoal && (
        <GoalDetailModal goal={detailGoal} index={detailIdx} onClose={() => setGoalDetail(null)} />
      )}
      {statList && (
        <LoopListModal
          title={
            statList === 'open'
              ? '🔄 Loop đang mở'
              : statList === 'controlled'
                ? '🔒 Đã kiểm soát'
                : '✅ Đóng trong 30 ngày'
          }
          loops={statList === 'open' ? open : statList === 'controlled' ? controlledList : closedMonthList}
          showState
          onClose={() => setStatList(null)}
        />
      )}
    </>
  )
}
