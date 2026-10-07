import { useCallback, useEffect, useRef, useState } from 'react'
import BoxScene from './components/BoxScene.jsx'
import PixelButton from './components/PixelButton.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import RevealResult from './components/RevealResult.jsx'
import { BUTTON_IMAGES, preloadActionImages } from './components/ActionButtons.jsx'
import { STAGE, TIMING } from './config.js'
import { prefersReducedMotion } from './utils/motionPreference.js'
import { pickRandomSticker } from './utils/randomSticker.js'
import { useStickerActions } from './hooks/useStickerActions.js'

export default function App() {
  const [ready, setReady] = useState(false)
  const [stage, setStage] = useState(STAGE.IDLE)
  const [sticker, setSticker] = useState(null) // chosen when the box is tapped; fixed until the next reveal
  const stageRef = useRef(STAGE.IDLE) // updated instantly, so a fast double-tap can't start twice
  const openButton = useRef(null)
  const previousStage = useRef(STAGE.IDLE)

  const goTo = useCallback((next) => {
    stageRef.current = next
    setStage(next)
  }, [])

  const startOpening = useCallback(() => {
    if (stageRef.current !== STAGE.IDLE) return // locked: ignore extra taps
    goTo(STAGE.SHAKING)
    if (import.meta.env.DEV) console.debug('[blind box] opening started')

    // Pick the sticker now (not on page load). The guard above means this runs once per reveal.
    const picked = pickRandomSticker()
    setSticker(picked)
    // StickerReveal starts downloading its image as soon as `sticker` is set, while the box shakes.
    if (import.meta.env.DEV) console.debug('[blind box] picked sticker', picked?.id ?? 'none')
  }, [goTo])

  const finishShake = useCallback(() => {
    goTo(STAGE.OPENING)
    if (import.meta.env.DEV) console.debug('[blind box] shake finished')
  }, [goTo])

  const finishOpening = useCallback(() => {
    goTo(STAGE.REVEALING) // the sticker rises out (StickerReveal)
  }, [goTo])

  const finishReveal = useCallback(() => {
    goTo(STAGE.REVEALED)
    if (import.meta.env.DEV) console.debug('[blind box] revealed', sticker?.id ?? 'none')
  }, [goTo, sticker])

  // "Open another box": sticker leaves (RESETTING) -> a fresh closed box rises into view
  // (RETURNING) -> back to IDLE, ready for a brand-new reveal. No page reload involved.
  const openAnother = useCallback(() => {
    if (stageRef.current !== STAGE.REVEALED) return // ignores repeat taps and taps mid-animation
    goTo(STAGE.RESETTING)
    if (import.meta.env.DEV) console.debug('[blind box] resetting')
  }, [goTo])

  useEffect(() => {
    if (stage !== STAGE.RESETTING && stage !== STAGE.RETURNING) return
    const quick = prefersReducedMotion() ? TIMING.resetReducedMotion : null
    const seconds = quick ?? (stage === STAGE.RESETTING ? TIMING.resetStickerExit : TIMING.resetBoxReturn)
    const timer = setTimeout(() => {
      if (stage === STAGE.RESETTING) {
        setSticker(null) // the old sticker is gone for good; the next tap picks a new one
        goTo(STAGE.RETURNING)
      } else {
        goTo(STAGE.IDLE)
        if (import.meta.env.DEV) console.debug('[blind box] ready for another box')
      }
    }, seconds * 1000)
    return () => clearTimeout(timer)
  }, [stage, goTo])

  // Keyboard users: the button they pressed disappeared, so put focus on the new Open button.
  useEffect(() => {
    if (stage === STAGE.IDLE && previousStage.current === STAGE.RETURNING && document.activeElement === document.body) {
      openButton.current?.focus({ preventScroll: true })
    }
    previousStage.current = stage
  }, [stage])

  // Dev-only shortcut: press R to snap straight back to a closed box (skips the animation).
  const hardReset = useCallback(() => {
    goTo(STAGE.IDLE)
    setSticker(null)
  }, [goTo])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    const onKey = (e) => {
      if (e.key === 'r' || e.key === 'R') hardReset()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hardReset])

  // Once the box is on screen, fetch the result-screen button pictures in the background.
  useEffect(() => {
    if (ready) preloadActionImages()
  }, [ready])

  const locked = stage !== STAGE.IDLE
  // Starts fetching the sticker file for Save/Share once the sticker is on its way out of the box.
  const { save, share, notice } = useStickerActions(sticker, stage === STAGE.REVEALING || stage === STAGE.REVEALED)

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
            ref={openButton}
            onClick={startOpening}
            disabled={locked}
          />
        )}
        {(stage === STAGE.REVEALED || stage === STAGE.RESETTING) && (
          <RevealResult
            sticker={sticker}
            notice={notice}
            leaving={stage === STAGE.RESETTING}
            onSave={save}
            onShare={share}
            onOpenAnother={openAnother}
          />
        )}
      </main>
    </ErrorBoundary>
  )
}
