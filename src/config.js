// Stages of one reveal. Later phases add more (shaking, opening, revealed...).
export const STAGE = { IDLE: 'idle', OPENING: 'opening' }

// Central place for animation timing and feel. Times are in seconds.
export const TIMING = {
  pressDuration: 0.22, // how long the "tap squish" on the box lasts
  pressSquish: 0.06, // how much the box squashes down on tap (0.06 = 6%)
}
