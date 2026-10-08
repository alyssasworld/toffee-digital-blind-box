import { CONTACT_EMAIL, GITHUB_URL } from '../data/about.js'

// Small links at the bottom of the screen. Hidden (and not tabbable) while the box is animating.
export default function Footer({ hidden, onAbout }) {
  return (
    <footer className={`footer${hidden ? ' footer--hidden' : ''}`}>
      <button type="button" className="footer-link" onClick={onAbout}>
        About
      </button>
      <span aria-hidden="true">·</span>
      <a className="footer-link" href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
        GitHub<span className="sr-only"> (opens in a new tab)</span>
      </a>
      <span aria-hidden="true">·</span>
      <a className="footer-link" href={`mailto:${CONTACT_EMAIL}`}>
        Let’s connect<span className="sr-only"> (opens your email app)</span>
      </a>
    </footer>
  )
}
