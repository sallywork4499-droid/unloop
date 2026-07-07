import { useState } from 'react'
import { useStore } from '../store'
import type { Goal, LifeArea } from '../types'
import { LIFE_AREA_META } from '../types'

interface Props {
  goal?: Goal
  onClose: () => void
}

const HORIZONS = ['Tháng này', 'Quý này', 'Năm nay']

/** Thêm / sửa một mục tiêu — kim chỉ nam của thời điểm hiện tại. */
export default function GoalModal({ goal, onClose }: Props) {
  const { dispatch } = useStore()
  const [title, setTitle] = useState(goal?.title ?? '')
  const [why, setWhy] = useState(goal?.why ?? '')
  const [horizon, setHorizon] = useState(goal?.horizon ?? 'Quý này')
  const [lifeArea, setLifeArea] = useState<LifeArea | undefined>(goal?.lifeArea)

  function save() {
    const t = title.trim()
    if (!t) return
    const payload = { title: t, why: why.trim() || undefined, horizon, lifeArea }
    if (goal) dispatch({ type: 'updateGoal', id: goal.id, patch: payload })
    else dispatch({ type: 'addGoal', goal: payload })
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{goal ? 'Sửa mục tiêu' : '🎯 Mục tiêu mới'}</h2>
        <p className="subtitle">
          Mục tiêu là kim chỉ nam — thứ nhắc bạn điều gì quan trọng nhất lúc này. Tối đa 3, vì sự
          tập trung là món quà.
        </p>
        <label>Bạn muốn đạt được điều gì?</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="VD: Đưa cả nhà đi du lịch Đà Nẵng hè này"
          autoFocus
        />
        <label>Vì sao điều này quan trọng với bạn? (tuỳ chọn)</label>
        <input
          type="text"
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          placeholder="Một câu để tự nhắc mình khi mệt mỏi"
        />
        <label>Chân trời thời gian</label>
        <div className="chips">
          {HORIZONS.map((h) => (
            <button
              key={h}
              className={`chip sm${horizon === h ? ' on' : ''}`}
              onClick={() => setHorizon(h)}
            >
              {h}
            </button>
          ))}
        </div>
        <label>Khía cạnh (tuỳ chọn)</label>
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
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>
            Huỷ
          </button>
          <button className="btn primary" disabled={!title.trim()} onClick={save}>
            Lưu mục tiêu
          </button>
        </div>
      </div>
    </div>
  )
}
