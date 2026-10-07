import { TIMING } from '../config.js'

const smoothstep = (x) => x * x * (3 - 2 * x)

export const REST_POSE = { squish: 0, tilt: 0, twist: 0, slide: 0 }

export function shakeTotalDuration(reducedMotion) {
  const { anticipationDuration, shakeDuration, settleDuration, pauseDuration } = TIMING
  // Reduced motion: no shake, just the anticipation and the pause.
  return reducedMotion
    ? anticipationDuration + pauseDuration
    : anticipationDuration + shakeDuration + settleDuration + pauseDuration
}

// Pose of the box `t` seconds after the tap. Pure function of time, so the
// animation is identical on every device regardless of frame rate.
export function shakePose(t, reducedMotion = false) {
  const T = TIMING

  // 1. Anticipation: squash down and spring back.
  if (t < T.anticipationDuration) {
    const u = t / T.anticipationDuration
    return { ...REST_POSE, squish: Math.sin(Math.PI * u) * T.anticipationSquish }
  }
  if (reducedMotion) return REST_POSE

  const s = t - T.anticipationDuration // seconds since the shake began

  // 2 + 3. Shake then settle: one strength envelope that rises, then fades to 0.
  const shakeEnd = T.shakeDuration
  const settleEnd = T.shakeDuration + T.settleDuration
  if (s >= settleEnd) return REST_POSE // 4. Pause

  let strength
  if (s < shakeEnd) {
    const u = s / shakeEnd
    strength = T.shakeStartStrength + (1 - T.shakeStartStrength) * u * u // builds up
  } else {
    strength = 1 - smoothstep((s - shakeEnd) / T.settleDuration) // dies away
  }

  // Two slightly different wobbles added together feel less mechanical than one sine.
  const phase = 2 * Math.PI * T.shakeFrequency * s
  const wobble = Math.sin(phase) + 0.35 * Math.sin(phase * 1.9 + 1.3)
  const twistWobble = Math.cos(phase * 0.9)

  return {
    squish: 0,
    tilt: wobble * strength * T.shakeTilt,
    twist: twistWobble * strength * T.shakeTilt * 0.5,
    slide: wobble * strength * T.shakeSlide,
  }
}
