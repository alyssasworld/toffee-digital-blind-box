import { getReadyStickerFile, getStickerFile } from './stickerFile.js'

// Can this browser share an image FILE (not just a link)?
export function canShareFile(file) {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] })
  )
}

// Opens the phone's share sheet with the ORIGINAL sticker PNG.
// Resolves to 'shared', 'cancelled' (user closed the sheet) or 'unsupported'
// (this browser can't share files: the caller should offer Save instead).
// Rejects for real errors; NotAllowedError means the browser refused because the tap was too long ago.
//
// IMPORTANT for iPhone: Safari only opens the share sheet if share() is called straight away
// from the tap. So when the file is already downloaded (prefetchSticker did that while the
// result screen was appearing) there must be NO `await` before navigator.share below.
export async function shareSticker(sticker) {
  const file = getReadyStickerFile(sticker) ?? (await getStickerFile(sticker)) // only awaits if it was not ready yet
  if (!canShareFile(file)) return 'unsupported'

  try {
    await navigator.share({ files: [file], title: sticker.name })
    return 'shared'
  } catch (error) {
    if (error?.name === 'AbortError') return 'cancelled'
    throw error
  }
}
