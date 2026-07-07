/** Màn hình mở đầu — hiện ~1.5s khi mở app rồi tan dần. */
export default function Splash({ fading }: { fading: boolean }) {
  return (
    <div className={`splash${fading ? ' fade' : ''}`}>
      <div className="splash-logo">🍃</div>
      <div className="splash-name">
        Un<span>loop</span>
      </div>
      <div className="splash-tag">tắt vòng lặp, nhẹ cái đầu</div>
    </div>
  )
}
