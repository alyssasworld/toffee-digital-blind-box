// Full-screen picture behind everything (set to null for a plain colour). It is drawn with hard
// pixel edges, so a low-resolution pixel-art image stays crisp at any screen size.
export const BACKDROP_IMAGE = '/background/sky-pixel-bg.png'

// Stages of one reveal. Later phases add more (opening, revealing, revealed...).
export const STAGE = {
  IDLE: 'idle', // closed box, waiting for a tap
  SHAKING: 'shaking', // tap received: anticipation, shake, settle, pause (input locked)
  OPENING: 'opening', // shake finished: the flaps swing open, then a short reveal pause
  REVEALING: 'revealing', // box is open: the sticker rises out and settles in front of it
  REVEALED: 'revealed', // sticker is in place, result text and buttons are showing
  RESETTING: 'resetting', // "Open another box" tapped: the sticker floats away, the result fades out
  RETURNING: 'returning', // a fresh closed box rises back into view (input still locked)
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

  // 7. Sticker: rises out of the open box, then travels toward the viewer and settles.
  stickerRiseDuration: 1.0, // rising up out of the box
  stickerPresentDuration: 0.9, // flying out to the final spot while growing (starts just before the rise ends)
  stickerOvershoot: 1.1, // 0 = no bounce when it arrives; higher = bouncier
  stickerSwayTilt: 0.1, // gentle sideways rocking while it rises, in radians (~6 degrees)
  stickerSettlePause: 0.5, // a beat after it arrives, before the result screen
  stickerFloat: 0.008, // the tiny idle bob once settled, as a fraction of screen height (0 = still)

  // 8. Open another box: the sticker leaves, then a fresh closed box returns.
  resetStickerExit: 0.35, // the sticker floats up, shrinks and fades; the result text fades
  stickerExitRise: 0.1, // how far it floats up while leaving, as a fraction of screen height
  stickerExitScale: 0.75, // how small it shrinks to
  resetBoxReturn: 0.9, // the new box rising into view (the camera glide)
  resetReducedMotion: 0.12, // with reduced motion each of the two steps is just a quick fade
}

// Where the sticker starts and ends up. Sizes describe the sticker's visible artwork (its
// transparent margins are ignored). Model units: the box is 1 wide and 1.5 tall.
export const STICKER_LAYOUT = {
  startY: 0.5, // height of the artwork's centre while hidden inside the box
  startFit: 0.75, // the artwork fits inside this square at the start (the box opening is 1.0 wide)
  rimY: 1.515, // height of the box's top edge
  clearance: 0.12, // how far above the rim its bottom edge is before it starts growing
  finalWidthFrac: 0.8, // final artwork width at most this fraction of the screen width...
  finalHeightFrac: 0.46, // ...and at most this fraction of the screen height
  finalCenterFromTop: 0.4, // where its centre sits: 0 = top of screen, 1 = bottom
  hoverDistanceFrac: 0.55, // how far toward the camera it settles (0.55 = about halfway; keeps it in front of the flaps)
}

// Sound mix. Each value multiplies that sound's volume (1 = as recorded). The clips were
// recorded at different loudness, so these even them out. `delay` shifts a sound later, in seconds.
export const SOUND_MIX = {
  master: 0.9,
  tap: { volume: 0.8, delay: 0 }, // the pop when you tap the box
  open: { volume: 1.15, delay: 0 }, // the flaps swinging open
  reveal: { volume: 1.2, delay: 0 }, // the glitter as the sticker rises out
  again: { volume: 0.55, delay: 0 }, // "Open another box"
}
