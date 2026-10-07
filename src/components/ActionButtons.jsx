import PixelButton from './PixelButton.jsx'

// The button pictures (all in /public/buttons/).
export const BUTTON_IMAGES = {
  open: '/buttons/open_button.png',
  save: '/buttons/save_button.png',
  share: '/buttons/share_button.png',
  openAnother: '/buttons/open_another_button.png',
}

// Starts downloading the result-screen buttons (a few KB each) so they don't pop in late.
export function preloadActionImages() {
  for (const src of [BUTTON_IMAGES.save, BUTTON_IMAGES.share, BUTTON_IMAGES.openAnother]) {
    new Image().src = src
  }
}

// Save, Share and Open another, shown under the revealed sticker.
export default function ActionButtons({ onSave, onShare, onOpenAnother }) {
  return (
    <div className="actions">
      <div className="actions-row">
        <PixelButton src={BUTTON_IMAGES.save} label="Save sticker" onClick={onSave} />
        <PixelButton src={BUTTON_IMAGES.share} label="Share sticker" onClick={onShare} />
      </div>
      <PixelButton
        src={BUTTON_IMAGES.openAnother}
        label="Open another box"
        className="action-wide"
        onClick={onOpenAnother}
      />
    </div>
  )
}
