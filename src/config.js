// Stages of one reveal. Later phases add more (opening, revealing, revealed...).
export const STAGE = {
  IDLE: 'idle', // closed box, waiting for a tap
  SHAKING: 'shaking', // tap received: anticipation, shake, settle, pause (input locked)
  SETTLED: 'settled', // shake finished; Phase 5 will open the lid from here
}

// Central place for animation timing and feel. Times are in seconds.
export const TIMING = {
  // 1. Anticipation: the box squashes down slightly, like taking a breath.
  anticipationDuration: 0.28,
  anticipationSquish: 0.07, // 0.07 = squashes by 7%

  // 2. Shake: side-to-side wobble that builds in intensity.
  shakeDuration: 1.2,
  shakeFrequency: 8, // wobbles per second
  shakeStartStrength: 0.4, // fraction of full strength at the start of the shake
  shakeTilt: 0.075, // max tilt in radians (~4.3 degrees)
  shakeSlide: 0.03, // max sideways slide in model units

  // 3. Settle: the wobble dies away.
  settleDuration: 0.35,

  // 4. Pause: a beat of stillness before the lid opens.
  pauseDuration: 0.4,
}
