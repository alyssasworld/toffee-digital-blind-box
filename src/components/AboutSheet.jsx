import { useEffect, useRef } from 'react'
import { ABOUT_PARAGRAPHS, ABOUT_TITLE, GITHUB_URL } from '../data/about.js'

const FOCUSABLE = 'a[href], button:not([disabled])'

// The "About" panel: a dialog over the page. Esc, the Close button or a tap outside closes it,
// Tab stays inside it, and focus goes back to where it came from when it closes.
export default function AboutSheet({ onClose }) {
  const panel = useRef(null)
  const closeButton = useRef(null)

  useEffect(() => {
    const opener = document.activeElement
    closeButton.current?.focus()
    return () => opener?.focus?.() // back to the footer's About button
  }, [])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') return onClose()
      if (event.key !== 'Tab') return
      const items = [...panel.current.querySelectorAll(FOCUSABLE)]
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

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
