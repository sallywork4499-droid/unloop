import { useState } from 'react'
import { useStore } from '../store'
import type { QuoteTheme } from '../lib/quotes'
import { QUOTES, QUOTE_THEME_META } from '../lib/quotes'

/** Thư viện bài học + kho trích dẫn "Vị thần Thái độ" phân theo chủ đề. */
export default function Lessons() {
  const { data, dispatch } = useStore()
  const { lessons } = data
  const [showQuotes, setShowQuotes] = useState(false)
  const [theme, setTheme] = useState<QuoteTheme | 'all'>('all')

  const filtered = theme === 'all' ? QUOTES : QUOTES.filter((q) => q.theme === theme)

  return (
    <>
      <div className="section-title">
        <span>📖 Bài học của bạn</span>
        <span className="count">{lessons.length}</span>
      </div>
      {lessons.length === 0 ? (
        <div className="empty">
          <span className="big-emoji">🌱</span>
          Khi đóng một loop, bạn có thể rút một bài học 30 giây.
          <br />
          Chúng sẽ được gom về đây — trí khôn của riêng bạn, từ chính trải nghiệm của bạn.
        </div>
      ) : (
        lessons.map((les) => (
          <div key={les.id} className="card lesson-card">
            {les.situation && (
              <div className="part">
                <b>Tình huống</b>
                <br />
                {les.situation}
              </div>
            )}
            {les.insight && (
              <div className="part">
                <b>Nhận ra</b>
                <br />
                {les.insight}
              </div>
            )}
            {les.guideline && (
              <div className="part">
                <b>Lần sau</b>
                <br />
                {les.guideline}
              </div>
            )}
            <div className="src">
              từ loop: “{les.loopTitle}” ·{' '}
              <button
                className="btn ghost"
                style={{ padding: 0, fontSize: 12 }}
                onClick={() => dispatch({ type: 'deleteLesson', id: les.id })}
              >
                xoá
              </button>
            </div>
          </div>
        ))
      )}

      <div className="section-title">
        <span>📚 Kho trích dẫn — Vị thần Thái độ</span>
        <button className="btn ghost" onClick={() => setShowQuotes(!showQuotes)}>
          {showQuotes ? 'Ẩn' : `Xem (${QUOTES.length})`}
        </button>
      </div>
      {showQuotes && (
        <>
          <div className="chips" style={{ marginBottom: 10 }}>
            <button
              className={`chip sm${theme === 'all' ? ' on' : ''}`}
              onClick={() => setTheme('all')}
            >
              Tất cả
            </button>
            {(Object.keys(QUOTE_THEME_META) as QuoteTheme[]).map((t) => (
              <button
                key={t}
                className={`chip sm${theme === t ? ' on' : ''}`}
                onClick={() => setTheme(t)}
              >
                {QUOTE_THEME_META[t].icon} {QUOTE_THEME_META[t].label}
              </button>
            ))}
          </div>
          {filtered.map((q, i) => (
            <div key={i} className="card">
              <div style={{ fontSize: 13.5, fontStyle: 'italic', lineHeight: 1.6 }}>“{q.text}”</div>
              <div className="meta2">
                {QUOTE_THEME_META[q.theme].icon} {QUOTE_THEME_META[q.theme].label}
              </div>
            </div>
          ))}
          <div className="notice calm">
            📖 Trích ngắn & lược dịch từ <i>You Are a Badass</i> — Jen Sincero. Muốn thấm cả quyển,
            rất đáng mua sách gốc.
          </div>
        </>
      )}
    </>
  )
}
