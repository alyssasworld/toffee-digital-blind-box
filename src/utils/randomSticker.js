import { STICKERS } from '../data/stickers.js'

// The random source for sticker draws. The generator functions are grabbed once at load (not
// looked up at draw time), so overriding `Math.random` or `crypto.getRandomValues` later from the
// browser console can't steer the result. Prefers the browser's crypto generator. (Everything
// runs in the browser, so this stops casual tampering only - a determined user can always edit
// the page. A truly tamper-proof draw would need a server.)
const mathRandom = Math.random
const cryptoApi = globalThis.crypto
const getRandomValues = cryptoApi?.getRandomValues ? cryptoApi.getRandomValues.bind(cryptoApi) : null
export function secureRandom() {
  if (getRandomValues) {
    const buffer = new Uint32Array(1)
    getRandomValues(buffer)
    return buffer[0] / 4294967296
  }
  return mathRandom()
}

// Picks one item at random, where each item's chance is proportional to its `weight`.
// Items with a missing, zero, negative or non-numeric weight are never picked.
// `random` can be swapped for a fixed function in tests. Returns null if nothing can be picked.
export function pickWeighted(items, random = secureRandom) {
  const candidates = items.filter((item) => Number.isFinite(item.weight) && item.weight > 0)
  if (candidates.length === 0) return null

  const total = candidates.reduce((sum, item) => sum + item.weight, 0)
  let roll = random() * total
  for (const item of candidates) {
    roll -= item.weight
    if (roll < 0) return item
  }
  return candidates[candidates.length - 1] // guards against floating-point rounding at the very end
}

// `exclude` is a Set of sticker ids to skip (e.g. ones whose image failed to load).
export const pickRandomSticker = (random = secureRandom, exclude = new Set()) =>
  pickWeighted(
    STICKERS.filter((sticker) => !exclude.has(sticker.id)),
    random,
  )
