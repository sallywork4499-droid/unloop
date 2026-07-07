import { useState } from 'react'
import { useStore } from '../store'
import LoopCard from '../components/LoopCard'
import ClarifyModal from '../components/ClarifyModal'
import CloseModal from '../components/CloseModal'
import type { Loop } from '../types'

/** Inbox: nơi mọi thứ rơi vào trước — làm rõ từng chút một, không áp lực. */
export default function Inbox() {
  const { inbox, dispatch } = useStore()
  const [clarifying, setClarifying] = useState<Loop | null>(null)
  const [closing, setClosing] = useState<{ loop: Loop; initial?: 'accepted' | 'notdoing' } | null>(null)

  return (
    <>
      <div className="section-title">
        <span>📥 Chưa phân loại</span>
        <span className="count">{inbox.length}</span>
      </div>
      {inbox.length === 0 ? (
        <div className="empty">
          <span className="big-emoji">✨</span>
          Inbox trống — mọi mối bận tâm đều đã có chỗ của nó.
        </div>
      ) : (
        <>
          <div className="notice calm">
            Mỗi mục chỉ cần ~30 giây để làm rõ. Không cần làm hết một lúc — làm rõ được cái nào, não nhẹ thêm cái đó.
          </div>
          {inbox.map((l) => (
            <LoopCard key={l.id} loop={l}>
              <button className="btn primary" onClick={() => setClarifying(l)}>
                Làm rõ (30s)
              </button>
              <button className="btn ghost" onClick={() => dispatch({ type: 'deleteLoop', id: l.id })}>
                Xoá
              </button>
            </LoopCard>
          ))}
        </>
      )}

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
    </>
  )
}
