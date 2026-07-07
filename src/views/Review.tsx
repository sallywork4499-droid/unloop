import { useMemo, useState } from 'react'
import { useStore } from '../store'
import LoopCard from '../components/LoopCard'
import ClarifyModal from '../components/ClarifyModal'
import CloseModal from '../components/CloseModal'
import type { Loop } from '../types'
import { addDays, todayStr } from '../types'
import { quoteOfTheDay } from '../lib/quotes'

type Mode = 'menu' | 'daily' | 'weekly'

/**
 * Review ritual — trái tim của sự "đáng tin".
 * Não chỉ buông được open loops khi nó tin rằng hệ thống chắc chắn sẽ đưa chúng quay lại đúng lúc.
 */
export default function Review() {
  const { data } = useStore()
  const [mode, setMode] = useState<Mode>('menu')
  const today = todayStr()

  if (mode === 'daily') return <DailyWizard onExit={() => setMode('menu')} />
  if (mode === 'weekly') return <WeeklyWizard onExit={() => setMode('menu')} />

  return (
    <>
      <div className="review-hero">
        <h3>Vì sao cần review?</h3>
        <p>
          Não chỉ thực sự buông một vấn đề khi nó tin rằng hệ thống sẽ nhắc lại đúng lúc. Review đều đặn chính là cách
          xây niềm tin đó — mỗi ngày 5 phút là đủ.
        </p>
      </div>

      <div className="card">
        <div className="title">☀️ Review hằng ngày · ~5 phút</div>
        <div className="meta">Quét nhanh các việc đang xử lý, đóng cái đã xong, chọn việc cho hôm nay.</div>
        <div className="actions">
          <button className="btn primary big" onClick={() => setMode('daily')}>
            {data.settings.lastDailyReview === today ? '✓ Đã review hôm nay — làm lại?' : 'Bắt đầu'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="title">🗓 Review hằng tuần · ~15 phút</div>
        <div className="meta">Dọn Inbox, xem lại việc tạm gác và việc đang chờ — không để gì rơi rớt.</div>
        <div className="actions">
          <button className="btn info big" onClick={() => setMode('weekly')}>
            {data.settings.lastWeeklyReview &&
            data.settings.lastWeeklyReview >= addDays(-6)
              ? '✓ Tuần này đã review — làm lại?'
              : 'Bắt đầu'}
          </button>
        </div>
      </div>
    </>
  )
}

/* ---------------- Daily ---------------- */

function DailyWizard({ onExit }: { onExit: () => void }) {
  const { data, active, dueToday, inbox, parked, activeSlotsLeft, dispatch } = useStore()
  // chốt danh sách cần quét tại thời điểm bắt đầu
  const [queue] = useState<string[]>(() => [...active, ...dueToday].map((l) => l.id))
  const [idx, setIdx] = useState(0)
  const [closing, setClosing] = useState<Loop | null>(null)
  const [clarifying, setClarifying] = useState<Loop | null>(null)
  const [phase, setPhase] = useState<'sweep' | 'promote' | 'done'>(queue.length ? 'sweep' : 'promote')

  const current = useMemo(
    () => data.loops.find((l) => l.id === queue[idx]),
    [data.loops, queue, idx],
  )

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
          <div className="section-title">
            <span>
              Quét nhanh · {idx + 1}/{queue.length}
            </span>
            <button className="btn ghost" onClick={onExit}>
              Thoát
            </button>
          </div>
          <LoopCard loop={current} showState>
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
            <button className="btn info" onClick={() => setClarifying(current)}>
              ✎ Sửa
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
          <div className="section-title">
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
              <LoopCard key={l.id} loop={l} showState>
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
            <p>
              Bạn không cần nhớ gì cả — app sẽ giữ hộ và nhắc lại đúng lúc. Hẹn gặp lại ở review ngày mai.
            </p>
          </div>
          <div className="quote">
            “{quoteOfTheDay().text}”<span>— {quoteOfTheDay().source}</span>
          </div>
          <button className="btn big" onClick={onExit}>
            ← Về màn hình Review
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
  const [phase, setPhase] = useState<'inbox' | 'parked' | 'waiting' | 'done'>('inbox')
  const [clarifying, setClarifying] = useState<Loop | null>(null)
  const [closing, setClosing] = useState<{ loop: Loop; initial?: 'resolved' | 'accepted' | 'notdoing' } | null>(null)

  const closedThisWeek = data.loops.filter(
    (l) => l.closedAt && l.closedAt > Date.now() - 7 * 24 * 3600 * 1000,
  ).length

  function finish() {
    dispatch({ type: 'setSettings', patch: { lastWeeklyReview: todayStr() } })
    setPhase('done')
  }

  return (
    <>
      <div className="wizard-progress">
        <span className={phase !== 'inbox' ? 'done' : ''} />
        <span className={phase === 'waiting' || phase === 'done' ? 'done' : ''} />
        <span className={phase === 'done' ? 'done' : ''} />
      </div>
      <div className="section-title">
        <span>
          {phase === 'inbox' && `1/3 · Dọn Inbox (${inbox.length})`}
          {phase === 'parked' && `2/3 · Việc tạm gác (${parked.length})`}
          {phase === 'waiting' && `3/3 · Việc đang chờ (${waiting.length})`}
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
            <div className="empty">✨ Inbox trống!</div>
          ) : (
            inbox.slice(0, 8).map((l) => (
              <LoopCard key={l.id} loop={l}>
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
              <LoopCard key={l.id} loop={l}>
                <button className="btn primary" onClick={() => dispatch({ type: 'setLoopState', id: l.id, state: 'active' })}>
                  🔥 Kích hoạt
                </button>
                <button className="btn" onClick={() => dispatch({ type: 'updateLoop', id: l.id, patch: { reviewDate: addDays(7) } })}>
                  Gác thêm 1 tuần
                </button>
                <button className="btn danger" onClick={() => setClosing({ loop: l, initial: 'notdoing' })}>
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
              <LoopCard key={l.id} loop={l}>
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
            <button className="btn primary big" onClick={finish}>
              Hoàn tất review tuần ✓
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
          <button className="btn big" onClick={onExit}>
            ← Về màn hình Review
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
