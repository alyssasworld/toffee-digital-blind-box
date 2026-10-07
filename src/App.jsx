import { useCallback, useEffect, useRef, useState } from 'react'
import BoxScene from './components/BoxScene.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { STAGE } from './config.js'

export default function App() {
  const [ready, setReady] = useState(false)
  const [stage, setStage] = useState(STAGE.IDLE)
  const stageRef = useRef(STAGE.IDLE) // updated instantly, so a fast double-tap can't start twice

  const startOpening = useCallback(() => {
    if (stageRef.current !== STAGE.IDLE) return // locked: ignore extra taps
    stageRef.current = STAGE.SHAKING
    setStage(STAGE.SHAKING)
    if (import.meta.env.DEV) console.debug('[blind box] opening started')
    // Phase 6 will pick the random sticker here, once per reveal.
  }, [])

  const finishShake = useCallback(() => {
    stageRef.current = STAGE.OPENING
    setStage(STAGE.OPENING)
    if (import.meta.env.DEV) console.debug('[blind box] shake finished')
  }, [])

  const finishOpening = useCallback(() => {
    stageRef.current = STAGE.OPENED
    setStage(STAGE.OPENED)
    if (import.meta.env.DEV) console.debug('[blind box] box opened')
    // Phase 7: the sticker emerges from here.
  }, [])

  // Dev-only shortcut for testing: press R to put the box back to idle.
  // (Phase 11 adds the real "Open another box" button.)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const onKey = (e) => {
      if (e.key !== 'r' && e.key !== 'R') return
      stageRef.current = STAGE.IDLE
      setStage(STAGE.IDLE)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const locked = stage !== STAGE.IDLE

  return (
    <ErrorBoundary>
      <main className="app">
        <BoxScene stage={stage} onTap={startOpening} onShakeDone={finishShake} onOpenDone={finishOpening} onReady={() => setReady(true)} />
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
