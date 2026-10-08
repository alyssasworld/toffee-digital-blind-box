import { useRef } from 'react'
import { BACKGROUNDS } from '../data/backgrounds.js'
import { useDialogFocus } from '../hooks/useDialogFocus.js'

// A tiny picture-frame icon, drawn from square "pixels" like the speaker icon.
const FRAME = [
  [1, 2, 10, 1],
  [1, 9, 10, 1],
  [1, 3, 1, 6],
  [10, 3, 1, 6],
  [3, 7, 2, 1],
  [4, 6, 2, 1],
  [5, 5, 2, 1],
  [6, 6, 1, 1],
  [7, 5, 2, 2],
]

// The button (top left) that opens the picker.
export function BackgroundButton({ onClick, hidden }) {
  return (
    <button
      type="button"
      className={`bg-toggle${hidden ? ' bg-toggle--hidden' : ''}`}
      aria-label="Choose background"
      aria-haspopup="dialog"
      onClick={onClick}
    >
      <svg viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
        {FRAME.map(([x, y, w, h]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} />
        ))}
      </svg>
    </button>
  )
}

// The picker panel: one big thumbnail per background. Choosing one applies it straight away
// (so you can see it behind the panel); "Done" closes it. Thumbnails only download once it is open.
export default function BackgroundPicker({ currentId, onChoose, onClose }) {
  const panel = useRef(null)
  const doneButton = useRef(null)
  useDialogFocus(panel, doneButton, onClose)

  return (
    <div className="about-backdrop bg-backdrop" onClick={onClose}>
      <section
        ref={panel}
        className="about bg-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bg-picker-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="bg-picker-title">Background</h2>
        <div className="bg-options">
          {BACKGROUNDS.map((background) => (
            <button
              key={background.id}
              type="button"
              className="bg-option"
              aria-pressed={background.id === currentId}
              onClick={() => onChoose(background.id)}
            >
              <span
                className="bg-thumb"
                style={{ backgroundImage: `url(${background.file})`, backgroundColor: background.color }}
                aria-hidden="true"
              />
              <span className="bg-name">{background.name}</span>
            </button>
          ))}
        </div>
        <button ref={doneButton} type="button" className="text-button" onClick={onClose}>
          Done
        </button>
      </section>
    </div>
  )
}
