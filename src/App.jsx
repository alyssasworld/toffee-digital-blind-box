import { useCallback, useEffect, useRef, useState } from 'react'
import BoxScene from './components/BoxScene.jsx'
import PixelButton from './components/PixelButton.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import RevealResult from './components/RevealResult.jsx'
import { BUTTON_IMAGES, preloadActionImages } from './components/ActionButtons.jsx'
import { STAGE } from './config.js'
import { pickRandomSticker } from './utils/randomSticker.js'
import { saveSticker } from './utils/saveSticker.js'

export default function App() {
  const [ready, setReady] = useState(false)
  const [stage, setStage] = useState(STAGE.IDLE)
  const [sticker, setSticker] = useState(null) // chosen when the box is tapped; fixed until the next reveal
  const [saveFailed, setSaveFailed] = useState(false)
  const savingRef = useRef(false) // ignores repeat taps while a save is in progress
  const stageRef = useRef(STAGE.IDLE) // updated instantly, so a fast double-tap can't start twice

  const startOpening = useCallback(() => {
    if (stageRef.current !== STAGE.IDLE) return // locked: ignore extra taps
    stageRef.current = STAGE.SHAKING
    setStage(STAGE.SHAKING)
    if (import.meta.env.DEV) console.debug('[blind box] opening started')

    // Pick the sticker now (not on page load). The guard above means this runs once per reveal.
    const picked = pickRandomSticker()
    setSticker(picked)
    // StickerReveal starts downloading its image as soon as `sticker` is set, while the box shakes.
    if (import.meta.env.DEV) console.debug('[blind box] picked sticker', picked?.id ?? 'none')
  }, [])

  const finishShake = useCallback(() => {
    stageRef.current = STAGE.OPENING
    setStage(STAGE.OPENING)
    if (import.meta.env.DEV) console.debug('[blind box] shake finished')
  }, [])

  const finishOpening = useCallback(() => {
    stageRef.current = STAGE.REVEALING
    setStage(STAGE.REVEALING) // the sticker rises out (StickerReveal)
  }, [])

  const finishReveal = useCallback(() => {
    stageRef.current = STAGE.REVEALED
    setStage(STAGE.REVEALED)
    if (import.meta.env.DEV) console.debug('[blind box] revealed', sticker?.id ?? 'none')
    // Phase 8: the name, rarity and buttons appear from here.
  }, [sticker])

  const handleSave = useCallback(async () => {
    if (!sticker || savingRef.current) return
    savingRef.current = true
    setSaveFailed(false)
    try {
      await saveSticker(sticker)
    } catch (error) {
      console.warn('Could not save the sticker:', error)
      setSaveFailed(true)
    } finally {
      savingRef.current = false
    }
  }, [sticker])

  // Back to a closed box with no sticker. Phase 11 will polish this ("Open another box").
  const resetBox = useCallback(() => {
    stageRef.current = STAGE.IDLE
    setStage(STAGE.IDLE)
    setSticker(null)
    setSaveFailed(false)
  }, [])

  // Dev-only shortcut for testing: press R to reset.
  useEffect(() => {
    if (!import.meta.env.DEV) return
    const onKey = (e) => {
      if (e.key === 'r' || e.key === 'R') resetBox()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [resetBox])

  // Once the box is on screen, fetch the result-screen button pictures in the background.
  useEffect(() => {
    if (ready) preloadActionImages()
  }, [ready])

  const locked = stage !== STAGE.IDLE

  return (
    <ErrorBoundary>
      <main className="app">
        <div className="backdrop" />
        <BoxScene
          stage={stage}
          sticker={sticker}
          onTap={startOpening}
          onShakeDone={finishShake}
          onOpenDone={finishOpening}
          onRevealDone={finishReveal}
          onReady={() => setReady(true)}
        />
        {!ready && <div className="loading" aria-live="polite">Loading…</div>}
        {ready && <h1 className={`title${locked ? ' title--hidden' : ''}`}>Open Me!</h1>}
        {ready && (
          <PixelButton
            src={BUTTON_IMAGES.open}
            label="Open the box"
            className="open-cta"
            onClick={startOpening}
            disabled={locked}
          />
        )}
        {stage === STAGE.REVEALED && (
          // Share gets wired up in the next phase.
          <RevealResult sticker={sticker} saveFailed={saveFailed} onSave={handleSave} onOpenAnother={resetBox} />
        )}
      </main>
    </ErrorBoundary>
  )
}
