import { useCallback, useEffect, useRef, useState } from 'react'
import BoxScene from './components/BoxScene.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { STAGE } from './config.js'
import { pickRandomSticker } from './utils/randomSticker.js'
import { preloadImage } from './utils/preloadImage.js'

export default function App() {
  const [ready, setReady] = useState(false)
  const [stage, setStage] = useState(STAGE.IDLE)
  const [sticker, setSticker] = useState(null) // chosen when the box is tapped; fixed until the next reveal
  const stageRef = useRef(STAGE.IDLE) // updated instantly, so a fast double-tap can't start twice

  const startOpening = useCallback(() => {
    if (stageRef.current !== STAGE.IDLE) return // locked: ignore extra taps
    stageRef.current = STAGE.SHAKING
    setStage(STAGE.SHAKING)
    if (import.meta.env.DEV) console.debug('[blind box] opening started')

    // Pick the sticker now (not on page load). The guard above means this runs once per reveal.
    const picked = pickRandomSticker()
    setSticker(picked)
    if (picked) preloadImage(picked.file) // start downloading it while the box shakes
    if (import.meta.env.DEV) console.debug('[blind box] picked sticker', picked?.id ?? 'none')
  }, [])

  const finishShake = useCallback(() => {
    stageRef.current = STAGE.OPENING
    setStage(STAGE.OPENING)
    if (import.meta.env.DEV) console.debug('[blind box] shake finished')
  }, [])

  const finishOpening = useCallback(() => {
    stageRef.current = STAGE.OPENED
    setStage(STAGE.OPENED)
    if (import.meta.env.DEV) console.debug('[blind box] box opened with sticker', sticker?.id ?? 'none')
    // Phase 7: the sticker emerges from here.
  }, [sticker])

  // Dev-only shortcut for testing: press R to put the box back to idle.
  // (Phase 11 adds the real "Open another box" button.)
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const onKey = (e) => {
      if (e.key !== 'r' && e.key !== 'R') return
      stageRef.current = STAGE.IDLE
      setStage(STAGE.IDLE)
      setSticker(null)
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
