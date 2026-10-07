// The sticker collection. To add a sticker: drop its transparent PNG into
// /public/stickers/ and add one entry here. Nothing else needs to change.
//
//   id      unique, stable identifier
//   name    shown on the result screen (also used for the saved filename)
//   file    path under /public
//   rarity  'common' | 'rare' | 'secret' (see RARITIES)
//   weight  relative chance of being drawn. Only the ratios matter: weight 40 vs 10
//           means the first comes up four times as often as the second.
//
// After adding a PNG, run `npm run stickers` once. It makes a small on-screen copy in
// /public/stickers/preview/ (the original PNG is still what Save and Share use). It also runs
// automatically before `npm run build`. If a copy is missing the app just uses the original.
//
// Names below are taken from the file names: edit them freely.
export const STICKERS = [
  {
    id: 'agent-mode',
    name: 'Agent Mode',
    file: '/stickers/toffee-agent-mode-sticker.png',
    rarity: 'common',
    weight: 10,
  },
  {
    id: 'shrimp-mode',
    name: 'Shrimp Mode',
    file: '/stickers/toffee-shrimp-mode-sticker.png',
    rarity: 'common',
    weight: 10,
  },
]

// The small copy shown in the 3D reveal: /stickers/x.png -> /stickers/preview/x.webp
export const previewFile = (sticker) =>
  sticker.preview ?? sticker.file.replace(/\/([^/]+)\.png$/i, '/preview/$1.webp')

// Display labels for each rarity (shown on the result screen, never before the reveal).
export const RARITIES = {
  common: 'Common',
  rare: 'Rare',
  secret: 'Secret',
}

if (import.meta.env?.DEV) {
  const seen = new Set()
  for (const s of STICKERS) {
    if (seen.has(s.id)) console.warn(`stickers.js: duplicate id "${s.id}"`)
    seen.add(s.id)
    if (!s.name || !s.file) console.warn(`stickers.js: "${s.id}" needs a name and a file`)
    if (!(s.weight > 0)) console.warn(`stickers.js: "${s.id}" has no positive weight, it can never be drawn`)
    if (s.rarity && !RARITIES[s.rarity]) console.warn(`stickers.js: "${s.id}" has unknown rarity "${s.rarity}"`)
  }
}
