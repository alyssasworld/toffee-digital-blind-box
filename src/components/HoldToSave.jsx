import { useRef } from 'react'
import { useDialogFocus } from '../hooks/useDialogFocus.js'

// Last-resort way to save in an in-app browser (LinkedIn etc.) that can't download files or open the
// share sheet: show the original PNG and let the person press and hold it, which every browser supports.
export default function HoldToSave({ sticker, onClose }) {
  const panel = useRef(null)
  const closeButton = useRef(null)
  useDialogFocus(panel, closeButton, onClose)

  return (
    <div className="about-backdrop" onClick={onClose}>
      <section
        ref={panel}
        className="about hold-to-save"
        role="dialog"
        aria-modal="true"
        aria-labelledby="hold-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="hold-title">Save sticker</h2>
        <p>Press and hold the sticker, then tap “Save to Photos”.</p>
        <img src={sticker.file} alt={sticker.name} />
        <button ref={closeButton} type="button" className="text-button" onClick={onClose}>
          Done
        </button>
      </section>
    </div>
  )
}
