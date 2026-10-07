import { RARITIES } from '../data/stickers.js'
import ActionButtons from './ActionButtons.jsx'

// The result screen under the sticker: its name, its rarity (if it has one) and the buttons.
// The sticker artwork itself is drawn in the 3D scene (StickerReveal).
export default function RevealResult({ sticker, notice, leaving, onSave, onShare, onOpenAnother }) {
  const rarity = sticker?.rarity && RARITIES[sticker.rarity]

  return (
    <section className={`result${leaving ? ' result--leaving' : ''}`} aria-hidden={leaving || undefined}>
      {/* role="status" makes screen readers announce the result when it appears. */}
      <div role="status">
        <p className="sticker-name">{sticker?.name ?? 'Your sticker'}</p>
        {rarity && <p className="sticker-rarity">{rarity}</p>}
      </div>
      <ActionButtons onSave={onSave} onShare={onShare} onOpenAnother={onOpenAnother} />
      {notice && (
        <p className="result-notice" role="alert">
          {notice}
        </p>
      )}
    </section>
  )
}
