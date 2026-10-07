import { useCallback, useRef, useState } from 'react'
import BoxScene from './components/BoxScene.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { STAGE } from './config.js'

export default function App() {
  const [ready, setReady] = useState(false)
  const [stage, setStage] = useState(STAGE.IDLE)
  const stageRef = useRef(STAGE.IDLE) // updated instantly, so a fast double-tap can't start twice

  const startOpening = useCallback(() => {
    if (stageRef.current !== STAGE.IDLE) return // locked: ignore extra taps
    stageRef.current = STAGE.OPENING
    setStage(STAGE.OPENING)
    if (import.meta.env.DEV) console.debug('[blind box] opening started')
    // Phase 6 will pick the random sticker here, once per reveal.
  }, [])

  const locked = stage !== STAGE.IDLE

  return (
    <ErrorBoundary>
      <main className="app">
        <BoxScene stage={stage} onTap={startOpening} onReady={() => setReady(true)} />
        {!ready && <div className="loading" aria-live="polite">Loading…</div>}
        {ready && (
          <button type="button" className="hint" onClick={startOpening} disabled={locked}>
            Tap to open
          </button>
        )}
      </main>
    </ErrorBoundary>
  )
}
