import { useRef, useState } from 'react'
import { useStore } from '../store'
import ClarifyModal from './ClarifyModal'
import CloseModal from './CloseModal'
import type { Loop } from '../types'
import { uid } from '../types'

/**
 * Quick capture: gõ hoặc nói — Enter là xong.
 * Ghi xong mở luôn phiếu "Làm rõ" (đã điền sẵn gợi ý, ~5 giây).
 * Bấm "Để sau" thì mục nằm ở khối "Chưa làm rõ" trên màn hình Hôm nay.
 */
export default function CaptureBar() {
  const { dispatch } = useStore()
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const [clarifying, setClarifying] = useState<Loop | null>(null)
  const [closing, setClosing] = useState<{ loop: Loop; initial: 'accepted' | 'notdoing' } | null>(null)
  const recRef = useRef<any>(null)

  const SpeechRec =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : undefined

  function submit() {
    const t = text.trim()
    if (!t) return
    const now = Date.now()
    const loop: Loop = { id: uid(), title: t, createdAt: now, stateChangedAt: now, state: 'inbox' }
    dispatch({ type: 'addLoop', loop })
    setText('')
    setClarifying(loop)
  }

  function toggleMic() {
    if (!SpeechRec) return
    if (recording) {
      recRef.current?.stop()
      setRecording(false)
      return
    }
    const rec = new SpeechRec()
    rec.lang = 'vi-VN'
    rec.interimResults = false
    rec.onresult = (e: any) => {
      const t = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join(' ')
      setText((prev) => (prev ? prev + ' ' + t : t))
    }
    rec.onend = () => setRecording(false)
    rec.onerror = () => setRecording(false)
    recRef.current = rec
    rec.start()
    setRecording(true)
  }

  return (
    <>
      <div className="capture">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Điều gì đang chiếm chỗ trong đầu bạn?"
          aria-label="Ghi nhanh vấn đề"
        />
        {SpeechRec && (
          <button className={`mic${recording ? ' rec' : ''}`} onClick={toggleMic} title="Nói thay vì gõ">
            🎙
          </button>
        )}
        <button className="add" onClick={submit}>
          Ghi lại
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
    </>
  )
}
