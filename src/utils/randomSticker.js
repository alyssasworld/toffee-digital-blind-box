import { STICKERS } from '../data/stickers.js'

// Picks one item at random, where each item's chance is proportional to its `weight`.
// Items with a missing, zero, negative or non-numeric weight are never picked.
// `random` can be swapped for a fixed function in tests. Returns null if nothing can be picked.
export function pickWeighted(items, random = Math.random) {
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
export const pickRandomSticker = (random = Math.random, exclude = new Set()) =>
  pickWeighted(
    STICKERS.filter((sticker) => !exclude.has(sticker.id)),
    random,
  )
