import LoopCard from './LoopCard'
import type { Loop } from '../types'

interface Props {
  title: string
  subtitle?: string
  loops: Loop[]
  showState?: boolean
  onClose: () => void
}

/** Danh sách loop trong bottom sheet — mở khi chạm vào các ô thống kê. */
export default function LoopListModal({ title, subtitle, loops, showState, onClose }: Props) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        {subtitle && <p className="subtitle">{subtitle}</p>}
        <div style={{ marginTop: 10 }}>
          {loops.length === 0 ? (
            <div className="empty">Chưa có mục nào ở đây.</div>
          ) : (
            loops.map((l) => <LoopCard key={l.id} loop={l} showState={showState} />)
          )}
        </div>
        <div className="modal-footer">
          <button className="btn big" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
