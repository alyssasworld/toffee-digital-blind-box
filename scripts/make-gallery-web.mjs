// Makes web-sized copies of the gallery photos from reference/gallery-originals/ into public/gallery/web/ (originals are never changed).
// Photos -> 1280px-longest-side JPEG q80. Videos are converted separately (see README note in src/data/gallery.js).
import fs from 'node:fs'
import path from 'node:path'

let sharp
try {
  sharp = (await import('sharp')).default
} catch (error) {
  console.warn(`Gallery copies skipped: sharp could not be loaded (${error.message}).`)
  process.exit(0)
}

const root = path.resolve(import.meta.dirname, '..', 'reference', 'gallery-originals') // untouched originals (git-ignored)
const outDir = path.resolve(import.meta.dirname, '..', 'public', 'gallery', 'web')
fs.mkdirSync(outDir, { recursive: true })
if (!fs.existsSync(root)) process.exit(0) // fine on a build machine: the committed copies in public/gallery/web are used

for (const file of fs.readdirSync(root).filter((f) => /\.jpe?g$/i.test(f))) {
  const target = path.join(outDir, file.replace(/\.jpe?g$/i, '.jpg').toLowerCase())
  if (fs.existsSync(target) && fs.statSync(target).mtimeMs >= fs.statSync(path.join(root, file)).mtimeMs) continue
  await sharp(path.join(root, file))
    .rotate() // apply the phone's orientation, then drop it
    .resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(target)
  console.log('made', path.relative(root, target))
}
