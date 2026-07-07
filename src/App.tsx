import { useEffect, useState } from 'react'
import { useStore } from './store'
import CaptureBar from './components/CaptureBar'
import Onboarding from './components/Onboarding'
import Splash from './components/Splash'
import AuthScreen from './components/AuthScreen'
import { IconChart, IconLoops, IconSun } from './components/icons'
import Today from './views/Today'
import Loops from './views/Loops'
import Dashboard from './views/Dashboard'
import { todayStr } from './types'

type Tab = 'today' | 'loops' | 'dash'

const TABS: { id: Tab; Icon: () => JSX.Element; label: string }[] = [
  { id: 'today', Icon: IconSun, label: 'Hôm nay' },
  { id: 'loops', Icon: IconLoops, label: 'Vòng lặp' },
  { id: 'dash', Icon: IconChart, label: 'Tổng quan' },
]

export default function App() {
  const { data, inbox, dueToday } = useStore()
  const [tab, setTab] = useState<Tab>('today')
  const [splash, setSplash] = useState<'show' | 'fade' | 'gone'>('show')

  useEffect(() => {
    const t1 = setTimeout(() => setSplash('fade'), 1500)
    const t2 = setTimeout(() => setSplash('gone'), 2100)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  const splashEl = splash !== 'gone' ? <Splash fading={splash === 'fade'} /> : null

  if (!data.settings.onboarded)
    return (
      <>
        <Onboarding />
        {splashEl}
      </>
    )
  if (!data.settings.authSeen)
    return (
      <>
        <AuthScreen />
        {splashEl}
      </>
    )

  const reviewDue = data.settings.lastDailyReview !== todayStr()

  return (
    <div className="app">
      <header className="header">
        <h1>
          Un<span>loop</span>
        </h1>
        <span className="sub">Tắt vòng lặp, nhẹ cái đầu</span>
      </header>

      <CaptureBar />

      {tab === 'today' && <Today />}
      {tab === 'loops' && <Loops />}
      {tab === 'dash' && <Dashboard />}

      <nav className="nav">
        <div className="nav-inner">
          {TABS.map((t) => (
            <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
              {t.id === 'today' && inbox.length > 0 && <span className="dot">{inbox.length}</span>}
              {t.id === 'loops' && (reviewDue || dueToday.length > 0) && <span className="dot">!</span>}
              <span className="ico">
                <t.Icon />
              </span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
      {splashEl}
    </div>
  )
}
