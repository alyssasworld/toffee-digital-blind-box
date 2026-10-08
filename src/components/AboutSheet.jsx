import { useRef } from 'react'
import { ABOUT_PARAGRAPHS, ABOUT_TITLE, GITHUB_URL } from '../data/about.js'
import { useDialogFocus } from '../hooks/useDialogFocus.js'

// The "About" panel: a dialog over the page. Esc, the Close button or a tap outside closes it,
// Tab stays inside it, and focus goes back to where it came from when it closes.
export default function AboutSheet({ onClose }) {
  const panel = useRef(null)
  const closeButton = useRef(null)
  useDialogFocus(panel, closeButton, onClose)

  return (
    <div className="about-backdrop" onClick={onClose}>
      <section
        ref={panel}
        className="about"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="about-title">{ABOUT_TITLE}</h2>
        {ABOUT_PARAGRAPHS.map((text) => (
          <p key={text}>{text}</p>
        ))}
        <p className="about-links">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            GitHub<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
        <button ref={closeButton} type="button" className="text-button" onClick={onClose}>
          Close
        </button>
      </section>
    </div>
  )
}
