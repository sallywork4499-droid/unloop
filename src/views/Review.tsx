import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useStore } from '../store'
import LoopCard from '../components/LoopCard'
import ClarifyModal from '../components/ClarifyModal'
import CloseModal from '../components/CloseModal'
import type { Loop } from '../types'
import { addDays, todayStr } from '../types'
import { quoteOfTheDay } from '../lib/quotes'

type Mode = 'menu' | 'daily' | 'weekly'

/**
 * Khối Review — đặt ở cuối tab Vòng lặp (không còn tab riêng).
 * Wizard chạy dạng overlay để người dùng vừa review vừa đối chiếu toàn cảnh.
 */
export default function ReviewSection() {
  const { data } = useStore()
  const [mode, setMode] = useState<Mode>('menu')
  const today = todayStr()

  return (
    <>
      <div className="section-title">
        <span>🧭 Review — để não tin và buông</span>
      </div>
      <div className="card">
        <div className="title">☀️ Review hằng ngày · ~5 phút</div>
        <div className="meta2">Quét việc đang xử lý, đóng cái đã xong, chọn việc cho hôm nay.</div>
        <div className="actions">
          <button className="btn primary" onClick={() => setMode('daily')}>
            {data.settings.lastDailyReview === today ? '✓ Hôm nay đã review — làm lại?' : 'Bắt đầu'}
          </button>
        </div>
      </div>
      <div className="card">
        <div className="title">🗓 Review hằng tuần · ~15 phút</div>
        <div className="meta2">Dọn mục chưa làm rõ, xem lại việc tạm gác & đang chờ, chọn nguyên tắc tuần.</div>
        <div className="actions">
          <button className="btn info" onClick={() => setMode('weekly')}>
            {data.settings.lastWeeklyReview && data.settings.lastWeeklyReview >= addDays(-6)
              ? '✓ Tuần này đã review — làm lại?'
              : 'Bắt đầu'}
          </button>
        </div>
      </div>
      {mode === 'daily' && (
        <WizardOverlay onExit={() => setMode('menu')}>
          <DailyWizard onExit={() => setMode('menu')} />
        </WizardOverlay>
      )}
      {mode === 'weekly' && (
        <WizardOverlay onExit={() => setMode('menu')}>
          <WeeklyWizard onExit={() => setMode('menu')} />
        </WizardOverlay>
      )}
    </>
  )
}

function WizardOverlay({ children, onExit }: { children: ReactNode; onExit: () => void }) {
  return (
    <div className="overlay" onClick={onExit}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

/* ---------------- Daily ---------------- */

function DailyWizard({ onExit }: { onExit: () => void }) {
  const { data, active, dueToday, inbox, parked, activeSlotsLeft, dispatch } = useStore()
  const [queue] = useState<string[]>(() => [...active, ...dueToday].map((l) => l.id))
  const [idx, setIdx] = useState(0)
  const [closing, setClosing] = useState<Loop | null>(null)
  const [clarifying, setClarifying] = useState<Loop | null>(null)
  const [phase, setPhase] = useState<'sweep' | 'promote' | 'done'>(queue.length ? 'sweep' : 'promote')

  const current = useMemo(() => data.loops.find((l) => l.id === queue[idx]), [data.loops, queue, idx])

  function next() {
    if (idx + 1 < queue.length) setIdx(idx + 1)
    else setPhase('promote')
  }

  function finish() {
    dispatch({ type: 'setSettings', patch: { lastDailyReview: todayStr() } })
    setPhase('done')
  }

  const candidates = [...inbox, ...parked]

  return (
    <>
      <div className="wizard-progress">
        <span className={phase !== 'sweep' || idx > 0 ? 'done' : ''} />
        <span className={phase !== 'sweep' ? 'done' : ''} />
        <span className={phase === 'done' ? 'done' : ''} />
      </div>

      {phase === 'sweep' && current && (
        <>
          <div className="section-title" style={{ marginTop: 0 }}>
            <span>
              Quét nhanh · {idx + 1}/{queue.length}
            </span>
            <button className="btn ghost" onClick={onExit}>
              Thoát
            </button>
          </div>
          <LoopCard loop={current} showState noDetail>
            <button className="btn success" onClick={() => setClosing(current)}>
              ✓ Xong rồi
            </button>
            <button className="btn" onClick={next}>
              → Giữ nguyên
            </button>
            <button
              className="btn warn"
              onClick={() => {
                dispatch({
                  type: 'setLoopState',
                  id: current.id,
                  state: 'parked',
                  patch: { reviewDate: current.reviewDate ?? addDays(7) },
                })
                next()
              }}
            >
              🅿️ Gác lại
            </button>
            <button className="btn ghost" onClick={() => setClarifying(current)}>
              Sửa
            </button>
          </LoopCard>
        </>
      )}
      {phase === 'sweep' && !current && (
        <div className="empty">
          Mục này đã được xử lý.{' '}
          <button className="btn" onClick={next}>
            Tiếp →
          </button>
        </div>
      )}

      {phase === 'promote' && (
        <>
          <div className="section-title" style={{ marginTop: 0 }}>
            <span>Chọn việc cho hôm nay · còn {activeSlotsLeft} chỗ</span>
            <button className="btn ghost" onClick={onExit}>
              Thoát
            </button>
          </div>
          {candidates.length === 0 || activeSlotsLeft === 0 ? (
            <div className="empty">
              {activeSlotsLeft === 0
                ? 'Danh sách hôm nay đã đầy — thế là đủ. Não chỉ chứa được chừng đó.'
                : 'Không còn gì để chọn thêm. Nhẹ nhõm chưa?'}
            </div>
          ) : (
            candidates.slice(0, 10).map((l) => (
              <LoopCard key={l.id} loop={l} showState noDetail>
                <button
                  className="btn primary"
                  disabled={activeSlotsLeft === 0}
                  onClick={() => dispatch({ type: 'setLoopState', id: l.id, state: 'active' })}
                >
                  🔥 Làm hôm nay
                </button>
              </LoopCard>
            ))
          )}
          <div className="modal-footer">
            <button className="btn primary big" onClick={finish}>
              Hoàn tất review ✓
            </button>
          </div>
        </>
      )}

      {phase === 'done' && (
        <>
          <div className="review-hero">
            <h3>✓ Xong! Mọi loop đều đang được kiểm soát.</h3>
            <p>Bạn không cần nhớ gì cả — app sẽ giữ hộ và nhắc lại đúng lúc. Hẹn gặp lại ngày mai.</p>
          </div>
          <div className="quote">
            “{quoteOfTheDay().text}”<span>— {quoteOfTheDay().source}</span>
          </div>
          <button className="btn big" style={{ width: '100%' }} onClick={onExit}>
            Đóng
          </button>
        </>
      )}

      {closing && (
        <CloseModal
          loop={closing}
          onClose={() => {
            setClosing(null)
            next()
          }}
        />
      )}
      {clarifying && (
        <ClarifyModal
          loop={clarifying}
          onClose={() => {
            setClarifying(null)
            next()
          }}
        />
      )}
    </>
  )
}

/* ---------------- Weekly ---------------- */

function WeeklyWizard({ onExit }: { onExit: () => void }) {
  const { inbox, parked, waiting, dispatch, data } = useStore()
  const [phase, setPhase] = useState<'inbox' | 'parked' | 'waiting' | 'principle' | 'done'>('inbox')
  const [clarifying, setClarifying] = useState<Loop | null>(null)
  const [closing, setClosing] = useState<{ loop: Loop; initial?: 'resolved' | 'accepted' | 'notdoing' } | null>(null)

  const lessonsWithText = data.lessons.filter((l) => l.guideline || l.insight)
  const closedThisWeek = data.loops.filter(
    (l) => l.closedAt && l.closedAt > Date.now() - 7 * 24 * 3600 * 1000,
  ).length

  function finish() {
    dispatch({ type: 'setSettings', patch: { lastWeeklyReview: todayStr() } })
    setPhase('done')
  }

  function afterWaiting() {
    if (lessonsWithText.length > 0) setPhase('principle')
    else finish()
  }

  function pickPrinciple(text: string) {
    dispatch({
      type: 'setSettings',
      patch: { weeklyPrinciple: { text, week: todayStr() }, lastWeeklyReview: todayStr() },
    })
    setPhase('done')
  }

  const steps = ['inbox', 'parked', 'waiting', 'principle']
  const stepIdx = steps.indexOf(phase)

  return (
    <>
      <div className="wizard-progress">
        {steps.map((s, i) => (
          <span key={s} className={phase === 'done' || i < stepIdx ? 'done' : ''} />
        ))}
      </div>
      <div className="section-title" style={{ marginTop: 0 }}>
        <span>
          {phase === 'inbox' && `1/4 · Dọn chưa làm rõ (${inbox.length})`}
          {phase === 'parked' && `2/4 · Việc tạm gác (${parked.length})`}
          {phase === 'waiting' && `3/4 · Việc đang chờ (${waiting.length})`}
          {phase === 'principle' && '4/4 · Nguyên tắc tuần này'}
          {phase === 'done' && 'Hoàn tất'}
        </span>
        {phase !== 'done' && (
          <button className="btn ghost" onClick={onExit}>
            Thoát
          </button>
        )}
      </div>

      {phase === 'inbox' && (
        <>
          {inbox.length === 0 ? (
            <div className="empty">✨ Không còn gì chưa làm rõ!</div>
          ) : (
            inbox.slice(0, 8).map((l) => (
              <LoopCard key={l.id} loop={l} noDetail>
                <button className="btn primary" onClick={() => setClarifying(l)}>
                  Làm rõ
                </button>
                <button className="btn ghost" onClick={() => dispatch({ type: 'deleteLoop', id: l.id })}>
                  Xoá
                </button>
              </LoopCard>
            ))
          )}
          <div className="modal-footer">
            <button className="btn primary big" onClick={() => setPhase('parked')}>
              Tiếp: việc tạm gác →
            </button>
          </div>
        </>
      )}

      {phase === 'parked' && (
        <>
          {parked.length === 0 ? (
            <div className="empty">Không có gì đang gác.</div>
          ) : (
            parked.map((l) => (
              <LoopCard key={l.id} loop={l} noDetail>
                <button className="btn primary" onClick={() => dispatch({ type: 'setLoopState', id: l.id, state: 'active' })}>
                  🔥 Kích hoạt
                </button>
                <button className="btn" onClick={() => dispatch({ type: 'updateLoop', id: l.id, patch: { reviewDate: addDays(7) } })}>
                  Gác thêm 1 tuần
                </button>
                <button className="btn ghost" onClick={() => setClosing({ loop: l, initial: 'notdoing' })}>
                  Không làm nữa
                </button>
              </LoopCard>
            ))
          )}
          <div className="modal-footer">
            <button className="btn primary big" onClick={() => setPhase('waiting')}>
              Tiếp: việc đang chờ →
            </button>
          </div>
        </>
      )}

      {phase === 'waiting' && (
        <>
          {waiting.length === 0 ? (
            <div className="empty">Không có gì đang chờ người khác.</div>
          ) : (
            waiting.map((l) => (
              <LoopCard key={l.id} loop={l} noDetail>
                <button className="btn success" onClick={() => setClosing({ loop: l })}>
                  ✓ Đã có kết quả
                </button>
                <button className="btn" onClick={() => dispatch({ type: 'updateLoop', id: l.id, patch: { reviewDate: addDays(3) } })}>
                  Hỏi lại sau 3 ngày
                </button>
              </LoopCard>
            ))
          )}
          <div className="modal-footer">
            <button className="btn primary big" onClick={afterWaiting}>
              {lessonsWithText.length > 0 ? 'Tiếp: nguyên tắc tuần →' : 'Hoàn tất review tuần ✓'}
            </button>
          </div>
        </>
      )}

      {phase === 'principle' && (
        <>
          <p className="subtitle">
            Chọn MỘT bài học của chính bạn để áp dụng tuần này — nó sẽ hiện trên màn hình Hôm nay
            suốt tuần.
          </p>
          {lessonsWithText.slice(0, 6).map((les) => (
            <button
              key={les.id}
              className="chip block"
              onClick={() => pickPrinciple((les.guideline || les.insight)!)}
            >
              📌 {les.guideline || les.insight}
              <span className="hint">từ loop: “{les.loopTitle}”</span>
            </button>
          ))}
          <div className="modal-footer">
            <button className="btn big" onClick={finish}>
              Tuần này bỏ qua
            </button>
          </div>
        </>
      )}

      {phase === 'done' && (
        <>
          <div className="review-hero">
            <h3>✓ Tuần này bạn đã đóng {closedThisWeek} loop.</h3>
            <p>Mọi thứ còn lại đều có trạng thái và lịch hẹn rõ ràng. Não bạn được phép nghỉ.</p>
          </div>
          <div className="quote">
            “{quoteOfTheDay().text}”<span>— {quoteOfTheDay().source}</span>
          </div>
          <button className="btn big" style={{ width: '100%' }} onClick={onExit}>
            Đóng
          </button>
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
