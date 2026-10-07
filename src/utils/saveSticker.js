import { getStickerBlob, stickerFileName } from './stickerFile.js'

// Downloads the ORIGINAL sticker PNG (the file from /public/stickers, with its transparency),
// never a screenshot of the 3D scene. Throws if the file can't be fetched.
export async function saveSticker(sticker) {
  const blob = await getStickerBlob(sticker)
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = stickerFileName(sticker)
  link.rel = 'noopener'
  link.style.display = 'none'
  document.body.appendChild(link) // Safari needs the link to be in the page
  link.click()
  link.remove()

  setTimeout(() => URL.revokeObjectURL(url), 30000) // give the browser time to start the download
}
