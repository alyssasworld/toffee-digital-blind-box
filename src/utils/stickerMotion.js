import { TIMING } from '../config.js'
import { clamp01, easeOutBack, easeOutCubic } from './easing.js'

// Reduced motion: the sticker simply rises and arrives, quickly, with no bounce or rocking.
const REDUCED = { rise: 0.35, present: 0.35 }

function schedule(reducedMotion) {
  const rise = reducedMotion ? REDUCED.rise : TIMING.stickerRiseDuration
  const present = reducedMotion ? REDUCED.present : TIMING.stickerPresentDuration
  const presentStart = rise * 0.7 // overlaps the end of the rise so the motion flows
  return { rise, present, presentStart, arrive: presentStart + present }
}

export function revealTotalDuration(reducedMotion = false) {
  return schedule(reducedMotion).arrive + TIMING.stickerSettlePause
}

// Where the sticker is `t` seconds after the reveal begins. All values are 0..1 progress
// (present can briefly exceed 1 for the bounce); the component turns them into positions.
//   rise    0 = hidden inside the box, 1 = just above the rim
//   present 0 = still at the rim, 1 = at its final spot in front of the box
//   roll    sideways rocking, in radians
export function stickerProgress(t, reducedMotion = false) {
  const { rise, present, presentStart, arrive } = schedule(reducedMotion)
  const riseU = clamp01(t / rise)
  const presentU = clamp01((t - presentStart) / present)
  const overall = clamp01(t / arrive)
  return {
    rise: easeOutCubic(riseU),
    present: reducedMotion ? easeOutCubic(presentU) : easeOutBack(presentU, TIMING.stickerOvershoot),
    roll: reducedMotion ? 0 : TIMING.stickerSwayTilt * Math.sin(2 * Math.PI * 1.25 * overall) * (1 - overall),
  }
}
