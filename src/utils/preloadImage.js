// Starts downloading an image so the browser has it cached by the time it's needed.
// Never throws: a missing file just means the reveal falls back later (Phase 12).
export function preloadImage(url) {
  const img = new Image()
  img.onerror = () => console.warn(`Could not preload ${url}`)
  img.src = url
}
