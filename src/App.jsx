import { useCallback, useEffect, useRef, useState } from 'react'
import BoxScene from './components/BoxScene.jsx'
import PixelButton from './components/PixelButton.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import ErrorScreen from './components/ErrorScreen.jsx'
import HoldToSave from './components/HoldToSave.jsx'
import RevealResult from './components/RevealResult.jsx'
import Footer from './components/Footer.jsx'
import AboutSheet from './components/AboutSheet.jsx'
import SoundToggle from './components/SoundToggle.jsx'
import BackgroundPicker, { BackgroundButton } from './components/BackgroundPicker.jsx'
import { BUTTON_IMAGES, preloadActionImages } from './components/ActionButtons.jsx'
import { STAGE, TIMING } from './config.js'
import { prefersReducedMotion } from './utils/motionPreference.js'
import { pickRandomSticker, secureRandom } from './utils/randomSticker.js'
import { useStickerActions } from './hooks/useStickerActions.js'
import { useSounds } from './hooks/useSounds.js'
import { useBackground } from './hooks/useBackground.js'

export default function App() {
  const [ready, setReady] = useState(false)
  const [stage, setStage] = useState(STAGE.IDLE)
  const [sticker, setSticker] = useState(null) // chosen when the box is tapped; fixed until the next reveal
  const [bootVisible, setBootVisible] = useState(true) // the loading screen, kept briefly so it can fade out
  const [fatal, setFatal] = useState(null) // an unrecoverable problem: 'stickers' | 'context'
  const [waitingForSticker, setWaitingForSticker] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [turned, setTurned] = useState(false) // has the visitor spun the box yet? (hides the "Rotate me!" hint for good)
  const [pickerOpen, setPickerOpen] = useState(false)
  const stickerRef = useRef(null) // the current sticker, readable from callbacks without making them change
  const failedStickers = useRef(new Set()) // ids of stickers whose image would not load (this visit)
  const stageRef = useRef(STAGE.IDLE) // updated instantly, so a fast double-tap can't start twice
  const openButton = useRef(null)
  const previousStage = useRef(STAGE.IDLE)

  const goTo = useCallback((next) => {
    stageRef.current = next
    setStage(next)
  }, [])

  const handleTurn = useCallback(() => setTurned(true), [])

  const startOpening = useCallback(() => {
    if (stageRef.current !== STAGE.IDLE) return // locked: ignore extra taps
    goTo(STAGE.SHAKING)
    if (import.meta.env.DEV) console.debug('[blind box] opening started')

    // Pick the sticker now (not on page load). The guard above means this runs once per reveal.
    const picked = pickRandomSticker(secureRandom, failedStickers.current)
    stickerRef.current = picked
    setSticker(picked)
    if (!picked) setFatal('stickers') // every sticker image has failed to load
    // StickerReveal starts downloading its image as soon as `sticker` is set, while the box shakes.
    if (import.meta.env.DEV) console.debug('[blind box] picked sticker', picked?.id ?? 'none')
  }, [goTo])

  // A sticker's picture would not load. Quietly swap it for a different sticker: the user has
  // not seen the first one yet, so they just get a (different) sticker. Only if none are left
  // do we show an error.
  const handleStickerFailed = useCallback((failed) => {
    if (stickerRef.current?.id !== failed.id) return // an old sticker; ignore
    failedStickers.current.add(failed.id)
    const next = pickRandomSticker(secureRandom, failedStickers.current)
    if (import.meta.env.DEV) console.debug('[blind box] sticker image failed:', failed.id, '-> using', next?.id ?? 'none')
    stickerRef.current = next
    setSticker(next)
    if (!next) setFatal('stickers')
  }, [])

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
        stickerRef.current = null
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
    stickerRef.current = null
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

  // Fade the loading screen out once the box is ready, then remove it.
  useEffect(() => {
    if (!ready) return
    const timer = setTimeout(() => setBootVisible(false), 400)
    return () => clearTimeout(timer)
  }, [ready])

  // Once the box is on screen, fetch the result-screen button pictures in the background.
  useEffect(() => {
    if (ready) preloadActionImages()
  }, [ready])

  const openAbout = useCallback(() => setAboutOpen(true), [])
  const closeAbout = useCallback(() => setAboutOpen(false), [])
  const openPicker = useCallback(() => setPickerOpen(true), [])
  const closePicker = useCallback(() => setPickerOpen(false), [])
  // Fades the chosen picture in once it has downloaded (until then the page is its average colour).
  const { background, choose: chooseBackground, ready: backdropReady } = useBackground()
  const handleReady = useCallback(() => setReady(true), []) // stable, so the scene is not re-set up on every render
  const locked = stage !== STAGE.IDLE
  // Starts fetching the sticker file for Save/Share once the sticker is on its way out of the box.
  const { muted, toggleMuted } = useSounds(stage)
  const { save, share, notice, holdToSave, closeHoldToSave } = useStickerActions(sticker, stage === STAGE.REVEALING || stage === STAGE.REVEALED)

  if (fatal) return <ErrorScreen kind={fatal} />

  return (
    <ErrorBoundary>
      <main className="app">
        <div
          className={`backdrop${backdropReady ? ' backdrop--ready' : ''}`}
          style={{ '--backdrop-image': `url(${background.file})`, '--backdrop-position': background.position }}
        />
        <BoxScene
          stage={stage}
          sticker={sticker}
          onTap={startOpening}
          onShakeDone={finishShake}
          onOpenDone={finishOpening}
          onRevealDone={finishReveal}
          onStickerFailed={handleStickerFailed}
          onStickerWaiting={setWaitingForSticker}
          onFatal={setFatal}
          onReady={handleReady}
          onTurn={handleTurn}
        />
        {bootVisible && (
          <div className={`boot${ready ? ' boot--done' : ''}`} role="status">
            <h1 className="boot-title">Open Me!</h1>
            <p className="boot-note">
              Loading
              <span className="boot-dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </p>
          </div>
        )}
        {ready && <h1 className={`title${locked ? ' title--hidden' : ''}`}>Open Me!</h1>}
        {ready && (
          <p className={`turn-hint${locked || turned ? ' turn-hint--hidden' : ''}`} aria-hidden="true">
            <span>Rotate me!</span>
          </p>
        )}
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
        {waitingForSticker && (
          <p className="status-note" role="status">
            Loading your sticker…
          </p>
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
        {/* Last in the page, so keyboard users reach the main buttons first. */}
        {ready && (
          <Footer hidden={aboutOpen || (stage !== STAGE.IDLE && stage !== STAGE.REVEALED)} onAbout={openAbout} />
        )}
        {ready && <SoundToggle muted={muted} onToggle={toggleMuted} />}
        {ready && (
          <BackgroundButton
            onClick={openPicker}
            hidden={aboutOpen || (stage !== STAGE.IDLE && stage !== STAGE.REVEALED)}
          />
        )}
        {aboutOpen && <AboutSheet onClose={closeAbout} />}
        {holdToSave && sticker && <HoldToSave sticker={sticker} onClose={closeHoldToSave} />}
        {pickerOpen && (
          <BackgroundPicker currentId={background.id} onChoose={chooseBackground} onClose={closePicker} />
        )}
      </main>
    </ErrorBoundary>
  )
}
