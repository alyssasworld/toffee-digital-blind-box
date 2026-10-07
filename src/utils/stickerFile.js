// "Agent Mode" -> "toffee-agent-mode-sticker.png". Based on the sticker's name, and never
// doubles up the prefix/suffix if the name already contains them.
export function stickerFileName(sticker) {
  const slug = (sticker.name || sticker.id || 'sticker')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // drop accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/^toffee-/, '')
    .replace(/-sticker$/, '')
  return `toffee-${slug || 'mystery'}-sticker.png`
}

// One download per sticker file, remembered for the rest of the session. The browser usually
// already has the image cached from the reveal, so this is normally instant. Phase 10 (Share)
// can call this early so the file is ready the moment the Share button is tapped.
const blobs = new Map()

export function getStickerBlob(sticker) {
  if (!blobs.has(sticker.file)) {
    const promise = fetch(sticker.file)
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status} for ${sticker.file}`)
        const blob = await response.blob()
        // A missing file can come back as a "successful" web page; make sure it is a real image.
        if (!blob.type.startsWith('image/')) throw new Error(`${sticker.file} is not an image (${blob.type})`)
        return blob
      })
      .catch((error) => {
        blobs.delete(sticker.file) // let a later tap try again
        throw error
      })
    blobs.set(sticker.file, promise)
  }
  return blobs.get(sticker.file)
}

// The same image as a File (what the share sheet needs). `readyFiles` holds the ones that have
// finished loading, so a tap handler can grab one WITHOUT waiting (see shareSticker).
const filePromises = new Map()
const readyFiles = new Map()

export function getStickerFile(sticker) {
  if (!filePromises.has(sticker.file)) {
    const promise = getStickerBlob(sticker)
      .then((blob) => {
        const file = new File([blob], stickerFileName(sticker), { type: blob.type })
        readyFiles.set(sticker.file, file)
        return file
      })
      .catch((error) => {
        filePromises.delete(sticker.file)
        throw error
      })
    filePromises.set(sticker.file, promise)
  }
  return filePromises.get(sticker.file)
}

export const getReadyStickerFile = (sticker) => readyFiles.get(sticker.file) ?? null

// The full-size original is ~2.5 MB. Downloading it in the background (so Share can open instantly)
// is not worth it on a weak or metered connection. Chrome/Android report this; Safari does not,
// so there it always prefetches. When skipped, Share just waits for the file when tapped.
function connectionIsWeak() {
  const connection = navigator.connection
  return Boolean(connection?.saveData) || ['slow-2g', '2g', '3g'].includes(connection?.effectiveType)
}

// Start fetching in the background; errors are handled later when the user actually taps.
export function prefetchSticker(sticker) {
  if (connectionIsWeak()) return
  getStickerFile(sticker).catch(() => {})
}

// Forget a sticker's downloaded copy (a few MB) once the reveal is over.
export function releaseSticker(sticker) {
  blobs.delete(sticker.file)
  filePromises.delete(sticker.file)
  readyFiles.delete(sticker.file)
}
