// Stages of one reveal. Later phases add more (opening, revealing, revealed...).
export const STAGE = {
  IDLE: 'idle', // closed box, waiting for a tap
  SHAKING: 'shaking', // tap received: anticipation, shake, settle, pause (input locked)
  OPENING: 'opening', // shake finished: the flaps swing open, then a short reveal pause
  OPENED: 'opened', // box is open and still; Phase 7 brings the sticker out from here
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

  // 5. Flaps: each flap swings open on its hinge. The front/back flaps lie on top of
  // the side flaps in the model, so they go first and the sides follow once they have
  // swung clear (opening the sides earlier would make them pass through the front flap).
  flapDuration: 0.55, // how long each flap takes to swing open
  flapOvershoot: 1.4, // 0 = no bounce at the end; higher = bouncier pop (about 1.7 is very springy)
  flaps: {
    front: { delay: 0, angle: 118 }, // angle = how far it opens, in degrees
    back: { delay: 0.1, angle: 118 },
    left: { delay: 0.36, angle: 108 },
    right: { delay: 0.42, angle: 108 },
  },

  // 6. Reveal pause: the open box sits still for a moment before the sticker comes out.
  revealPause: 0.6,
}
