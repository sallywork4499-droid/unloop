import { useRef, useState } from 'react'
import { useStore } from '../store'

/** Quick capture: gõ hoặc nói — Enter là xong, mọi thứ rơi vào Inbox. */
export default function CaptureBar() {
  const { dispatch } = useStore()
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const recRef = useRef<any>(null)

  const SpeechRec =
    typeof window !== 'undefined'
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      : undefined

  function submit() {
    const t = text.trim()
    if (!t) return
    dispatch({ type: 'capture', titles: [t] })
    setText('')
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
  )
}
