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
