import { useCallback, useEffect, useRef, useState } from 'react'
import { STAGE } from '../config.js'
import { isMuted, loadSounds, playSound, setMuted, unlockOnGesture } from '../audio/sounds.js'

// Which sound goes with which moment of the reveal.
const SOUND_FOR_STAGE = {
  [STAGE.SHAKING]: 'tap', // you tapped the box
  [STAGE.OPENING]: 'open', // the flaps swing open
  [STAGE.REVEALING]: 'reveal', // the sticker rises out
  [STAGE.RESETTING]: 'again', // "Open another box"
}

// Loads the sounds, wakes them on the first tap, and plays each at its moment.
// Returns the mute switch for the little speaker button.
export function useSounds(stage) {
  const [muted, setMutedState] = useState(isMuted)
  const previousStage = useRef(stage)

  useEffect(() => {
    loadSounds()
    return unlockOnGesture()
  }, [])

  useEffect(() => {
    if (stage === previousStage.current) return
    previousStage.current = stage
    const sound = SOUND_FOR_STAGE[stage]
    if (sound) playSound(sound)
  }, [stage])

  const toggleMuted = useCallback(() => {
    const next = !isMuted()
    setMuted(next)
    setMutedState(next)
  }, [])

  return { muted, toggleMuted }
}
