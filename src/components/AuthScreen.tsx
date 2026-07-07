import { useState } from 'react'
import { useStore } from '../store'
import { supabase, supabaseConfigured } from '../lib/supabase'

interface Props {
  /** Gọi khi đăng nhập xong / chọn dùng offline. Mặc định: đánh dấu authSeen. */
  onDone?: () => void
  /** Nếu có: hiện nút quay lại (mở từ Cài đặt) thay vì nút "dùng không cần tài khoản". */
  onCancel?: () => void
}

/**
 * Đăng nhập / đăng ký / quên mật khẩu qua Supabase (email + mật khẩu).
 * Chưa cấu hình Supabase → form khoá, vẫn cho dùng offline (localStorage).
 */
export default function AuthScreen({ onDone, onCancel }: Props) {
  const { dispatch } = useStore()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  function enter() {
    dispatch({ type: 'setSettings', patch: { authSeen: true } })
    onDone?.()
  }

  async function submit() {
    if (!supabase) return
    setBusy(true)
    setErr('')
    setInfo('')
    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password: pw })
        : await supabase.auth.signUp({ email, password: pw })
    setBusy(false)
    if (error) {
      setErr(translateAuthError(error.message))
      return
    }
    if (mode === 'signup') {
      setInfo('Đã tạo tài khoản! Kiểm tra email để xác nhận, sau đó quay lại đăng nhập.')
      setMode('signin')
      return
    }
    enter()
  }

  async function forgot() {
    if (!supabase) return
    if (!email) {
      setErr('Nhập email của bạn trước đã.')
      return
    }
    setBusy(true)
    setErr('')
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setBusy(false)
    if (error) setErr(translateAuthError(error.message))
    else setInfo('Đã gửi email đặt lại mật khẩu — kiểm tra hộp thư của bạn.')
  }

  return (
    <div className="onboard">
      <div className="onboard-inner">
        {onCancel && (
          <button className="btn ghost" style={{ alignSelf: 'flex-start', paddingLeft: 0 }} onClick={onCancel}>
            ← Quay lại
          </button>
        )}
        <h1>
          Xin chào 👋 <br />
          Đăng nhập <span>Unloop</span>
        </h1>
        <p>
          Có tài khoản, dữ liệu của bạn sẽ sẵn sàng đồng bộ giữa các thiết bị. Hoặc dùng ngay không
          cần tài khoản — khi đó dữ liệu chỉ nằm trên máy này, riêng tư tuyệt đối.
        </p>

        {!supabaseConfigured && (
          <div className="notice">
            ⚙️ Chưa cấu hình Supabase — form dưới tạm khoá. Tạo file <b>.env</b> với{' '}
            VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY rồi chạy lại (xem README).
          </div>
        )}

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ban@email.com"
          disabled={!supabaseConfigured}
          autoComplete="email"
        />
        <label>Mật khẩu</label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Tối thiểu 6 ký tự"
          disabled={!supabaseConfigured}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
        />
        {mode === 'signin' && supabaseConfigured && (
          <button className="btn ghost" style={{ padding: '6px 0' }} onClick={forgot} disabled={busy}>
            Quên mật khẩu?
          </button>
        )}
        {err && (
          <div className="notice" style={{ background: 'var(--rose-soft)', color: 'var(--rose)', marginTop: 10 }}>
            {err}
          </div>
        )}
        {info && (
          <div className="notice calm" style={{ marginTop: 10 }}>
            {info}
          </div>
        )}

        <button
          className="btn primary big"
          disabled={!supabaseConfigured || busy || !email || pw.length < 6}
          onClick={submit}
        >
          {busy ? 'Đang xử lý…' : mode === 'signin' ? 'Đăng nhập' : 'Tạo tài khoản'}
        </button>
        <button
          className="btn ghost big"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setErr('')
            setInfo('')
          }}
        >
          {mode === 'signin' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
        </button>
        {!onCancel && (
          <button className="btn big" onClick={enter}>
            Dùng không cần tài khoản →
          </button>
        )}
      </div>
    </div>
  )
}

/** Dịch các lỗi Supabase thường gặp sang tiếng Việt thân thiện. */
function translateAuthError(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Email hoặc mật khẩu chưa đúng.'
  if (m.includes('email not confirmed')) return 'Email chưa được xác nhận — kiểm tra hộp thư để bấm link xác nhận.'
  if (m.includes('user already registered')) return 'Email này đã có tài khoản — thử đăng nhập hoặc quên mật khẩu.'
  if (m.includes('password should be at least')) return 'Mật khẩu cần tối thiểu 6 ký tự.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Thao tác quá nhanh — chờ một lát rồi thử lại.'
  if (m.includes('invalid email') || m.includes('unable to validate email')) return 'Email không hợp lệ.'
  return msg
}
