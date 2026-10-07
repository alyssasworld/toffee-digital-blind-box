const WHOLE_IMAGE = { cx: 0.5, cy: 0.5, w: 1, h: 1 }

// Finds the box around the visible (non-transparent) artwork in an image, as fractions of the
// image: centre (cx, cy) and size (w, h). Stickers have transparent margins of different
// sizes, so this lets us size and centre each one by what you can actually see.
// It checks a small downscaled copy, so it is cheap even for a 3000px PNG.
export function findContentBounds(image, size = 128, alphaThreshold = 40) {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(image, 0, 0, size, size)
    const { data } = ctx.getImageData(0, 0, size, size)

    let x0 = size, y0 = size, x1 = -1, y1 = -1
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (data[(y * size + x) * 4 + 3] > alphaThreshold) {
          if (x < x0) x0 = x
          if (x > x1) x1 = x
          if (y < y0) y0 = y
          if (y > y1) y1 = y
        }
      }
    }
    if (x1 < 0) return WHOLE_IMAGE // fully transparent: nothing to measure

    return {
      cx: (x0 + x1 + 1) / 2 / size,
      cy: (y0 + y1 + 1) / 2 / size,
      w: (x1 - x0 + 1) / size,
      h: (y1 - y0 + 1) / size,
    }
  } catch {
    return WHOLE_IMAGE
  }
}
