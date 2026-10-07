// Makes small on-screen copies of the sticker PNGs.
//
//   public/stickers/toffee-agent-mode-sticker.png          <- your original (used for Save and Share, never changed)
//   public/stickers/preview/toffee-agent-mode-sticker.webp <- small copy shown in the 3D reveal (made by this script)
//
// The original is ~2.5 MB and 3000px: far too heavy to download and hold in GPU memory for a sticker
// that is drawn about 300-800px wide. The copy keeps the same shape and transparent margins (it is only
// scaled down), so it looks identical on screen.
//
// Run it with `npm run stickers` after adding a sticker. It also runs automatically before `npm run build`.
// It only redoes files whose original is newer; add --force to redo everything.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const SIZE = 1280 // longest side in pixels
const QUALITY = 88

const root = path.resolve(import.meta.dirname, '..', 'public', 'stickers')
const outDir = path.join(root, 'preview')
const force = process.argv.includes('--force')
fs.mkdirSync(outDir, { recursive: true })

const originals = fs.readdirSync(root).filter((f) => f.toLowerCase().endsWith('.png'))
let made = 0
for (const file of originals) {
  const source = path.join(root, file)
  const target = path.join(outDir, file.replace(/\.png$/i, '.webp'))
  if (!force && fs.existsSync(target) && fs.statSync(target).mtimeMs >= fs.statSync(source).mtimeMs) continue

  const info = await sharp(source)
    .resize({ width: SIZE, height: SIZE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: QUALITY, alphaQuality: 100, effort: 6 })
    .toFile(target)
  const before = fs.statSync(source).size
  console.log(`${file}: ${(before / 1024).toFixed(0)} KB -> ${(info.size / 1024).toFixed(0)} KB (${info.width}x${info.height})`)
  made++
}
console.log(made ? `Made ${made} preview${made === 1 ? '' : 's'}.` : 'Sticker previews are up to date.')
