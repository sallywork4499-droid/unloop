import { useState } from 'react'
import { useStore } from '../store'

/** FTUE: giải thích open loops (2 màn) + brain dump 3 phút → mọi thứ vào Inbox. */
export default function Onboarding() {
  const { dispatch } = useStore()
  const [step, setStep] = useState(0)
  const [dump, setDump] = useState('')

  function finish() {
    const titles = dump
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean)
    if (titles.length) dispatch({ type: 'capture', titles })
    dispatch({ type: 'setSettings', patch: { onboarded: true } })
  }

  return (
    <div className="onboard">
      <div className="onboard-inner">
        {step === 0 && (
          <>
            <h1>
              Un<span>loop</span>
            </h1>
            <p>
              Mỗi vấn đề chưa xử lý — một việc chưa làm, một quyết định chưa chốt, một nỗi lo chưa gọi tên — là một{' '}
              <b>open loop</b> đang chạy ngầm trong đầu bạn.
            </p>
            <p>
              Não người chỉ giữ thoải mái được <b>3–4 mối bận tâm</b> một lúc. Giữ 20 open loops trong đầu nghĩa là não
              luôn quá tải: khó tập trung, khó nghỉ, và mệt vì những thứ chưa-cần-nghĩ-đến.
            </p>
            <p>
              Nghiên cứu tâm lý học cho thấy: bạn <b>không cần giải quyết xong</b> vấn đề để não buông nó ra. Chỉ cần vấn
              đề được ghi lại ở một nơi đáng tin, có trạng thái rõ ràng và một kế hoạch tối thiểu — thế là đủ.
            </p>
            <button className="btn primary big" onClick={() => setStep(1)}>
              Hiểu rồi, tiếp →
            </button>
          </>
        )}
        {step === 1 && (
          <>
            <h1>
              Cách app <span>hoạt động</span>
            </h1>
            <p>
              <b>1 · Ghi lại</b> — mọi mối bận tâm rơi vào Inbox trong vài giây, không sợ quên.
            </p>
            <p>
              <b>2 · Làm rõ 30 giây</b> — nó là việc làm được, một quyết định, hay một nỗi lo? Bước nhỏ nhất là gì?
            </p>
            <p>
              <b>3 · Đặt đúng chỗ</b> — Xử lý ngay · Đang chờ · Tạm gác · Chấp nhận · Không làm. Cả “không làm” cũng là
              một cách đóng loop hợp lệ.
            </p>
            <p>
              <b>4 · Review 5 phút mỗi ngày</b> — để não tin rằng không gì bị bỏ rơi, và thật sự buông.
            </p>
            <button className="btn primary big" onClick={() => setStep(2)}>
              Bắt đầu thôi →
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <h1>
              Trút hết ra <span>trong 3 phút</span>
            </h1>
            <p>
              Viết ra <b>mọi thứ</b> đang chiếm chỗ trong đầu bạn — việc lớn, việc vặt, nỗi lo, quyết định đang phân
              vân. Mỗi dòng một thứ. Đừng phân loại, đừng sắp xếp — chỉ trút ra.
            </p>
            <textarea
              autoFocus
              value={dump}
              onChange={(e) => setDump(e.target.value)}
              placeholder={'Nộp báo cáo thuế\nLo cho sức khoẻ của mẹ\nCó nên đổi việc không?\nSửa cái vòi nước rò\n…'}
            />
            <p style={{ fontSize: 13 }}>
              {dump.split('\n').filter((t) => t.trim()).length} điều sẽ được app giữ hộ bạn.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn big" onClick={finish}>
                Bỏ qua
              </button>
              <button className="btn primary big" style={{ flex: 1 }} onClick={finish}>
                Trút vào Inbox — nhẹ đầu nào 🍃
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
