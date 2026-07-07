import { useRef, useState } from 'react'
import { exportJSON, useStore } from '../store'
import LoopCard from '../components/LoopCard'
import ClarifyModal from '../components/ClarifyModal'
import CloseModal from '../components/CloseModal'
import AuthScreen from '../components/AuthScreen'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { useSession } from '../lib/useSession'
import type { AppData, Loop } from '../types'

/** Toàn cảnh: Waiting / Parked / Đã đóng + công cụ sao lưu dữ liệu. */
export default function Loops() {
  const { waiting, parked, closed, dispatch, data } = useStore()
  const [clarifying, setClarifying] = useState<Loop | null>(null)
  const [closing, setClosing] = useState<{ loop: Loop; initial?: 'resolved' | 'accepted' | 'notdoing' } | null>(null)
  const [showClosed, setShowClosed] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const session = useSession()
  const fileRef = useRef<HTMLInputElement>(null)

  function importFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as AppData
        if (parsed && Array.isArray(parsed.loops)) {
          dispatch({ type: 'import', data: parsed })
          alert('Đã khôi phục dữ liệu thành công.')
        } else alert('File không đúng định dạng.')
      } catch {
        alert('Không đọc được file.')
      }
    }
    reader.readAsText(f)
    e.target.value = ''
  }

  const closedVisible = closed.filter((l) => l.state !== 'archived')

  return (
    <>
      <div className="section-title">
        <span>⏳ Đang chờ người khác</span>
        <span className="count">{waiting.length}</span>
      </div>
      {waiting.length === 0 ? (
        <div className="empty">Không có gì đang chờ — không có quả bóng nào đang ở sân người khác.</div>
      ) : (
        waiting.map((l) => (
          <LoopCard key={l.id} loop={l}>
            <button className="btn success" onClick={() => setClosing({ loop: l })}>
              ✓ Đã có kết quả
            </button>
            <button className="btn ghost" onClick={() => setClarifying(l)}>
              Sửa
            </button>
          </LoopCard>
        ))
      )}

      <div className="section-title">
        <span>🅿️ Tạm gác có chủ đích</span>
        <span className="count">{parked.length}</span>
      </div>
      {parked.length === 0 ? (
        <div className="empty">Chưa có gì được gác lại.</div>
      ) : (
        parked.map((l) => (
          <LoopCard key={l.id} loop={l}>
            <button className="btn" onClick={() => setClarifying(l)}>
              Xử lý lại
            </button>
            <button className="btn ghost" onClick={() => setClosing({ loop: l, initial: 'notdoing' })}>
              Thôi, không làm nữa
            </button>
          </LoopCard>
        ))
      )}

      <div className="section-title">
        <span>🗄 Đã đóng</span>
        <button className="btn ghost" onClick={() => setShowClosed(!showClosed)}>
          {showClosed ? 'Ẩn' : `Xem (${closedVisible.length})`}
        </button>
      </div>
      {showClosed &&
        (closedVisible.length === 0 ? (
          <div className="empty">Chưa có loop nào được đóng. Sẽ sớm thôi!</div>
        ) : (
          closedVisible.map((l) => (
            <LoopCard key={l.id} loop={l} showState>
              <button
                className="btn ghost"
                onClick={() => dispatch({ type: 'setLoopState', id: l.id, state: 'archived' })}
              >
                Lưu trữ
              </button>
              <button className="btn ghost" onClick={() => dispatch({ type: 'deleteLoop', id: l.id })}>
                Xoá
              </button>
            </LoopCard>
          ))
        ))}

      <div className="section-title">
        <span>👤 Tài khoản</span>
      </div>
      {!supabaseConfigured ? (
        <div className="notice">
          ⚙️ Đăng nhập sẽ khả dụng sau khi cấu hình Supabase (file .env — xem README). Hiện dữ liệu
          lưu trên máy này.
        </div>
      ) : session ? (
        <div className="card">
          <div className="title">✅ {session.user.email}</div>
          <div className="meta2">Đã đăng nhập — sẵn sàng cho đồng bộ đa thiết bị (giai đoạn sau).</div>
          <div className="actions">
            <button className="btn ghost" onClick={() => supabase?.auth.signOut()}>
              Đăng xuất
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="title">Chưa đăng nhập</div>
          <div className="meta2">Dữ liệu đang lưu trên máy này. Đăng nhập để chuẩn bị đồng bộ đa thiết bị.</div>
          <div className="actions">
            <button className="btn primary" onClick={() => setShowAuth(true)}>
              Đăng nhập / Đăng ký
            </button>
          </div>
        </div>
      )}

      <div className="section-title">
        <span>⚙️ Dữ liệu của bạn</span>
      </div>
      <div className="notice calm">
        Dữ liệu chỉ nằm trên thiết bị này (localStorage) — riêng tư tuyệt đối. Hãy xuất file sao lưu định kỳ để không mất
        dữ liệu.
      </div>
      <div className="footer-tools">
        <button className="btn" onClick={() => exportJSON(data)}>
          ⬇️ Xuất sao lưu (.json)
        </button>
        <button className="btn" onClick={() => fileRef.current?.click()}>
          ⬆️ Khôi phục từ file
        </button>
        <input ref={fileRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={importFile} />
        <button
          className="btn danger"
          onClick={() => {
            if (confirm('Xoá toàn bộ dữ liệu trên thiết bị này? Hành động không thể hoàn tác.')) {
              dispatch({ type: 'reset' })
            }
          }}
        >
          Xoá tất cả
        </button>
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
      {showAuth && <AuthScreen onDone={() => setShowAuth(false)} onCancel={() => setShowAuth(false)} />}
    </>
  )
}
