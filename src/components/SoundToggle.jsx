// The little speaker button (top right) that turns sound off and on. The icon is drawn with
// square "pixels" so it matches the rest of the artwork.
const SPEAKER = [
  [1, 4, 2, 4],
  [3, 3, 1, 6],
  [4, 2, 1, 8],
]
const WAVES = [
  [6, 4, 1, 4],
  [8, 2, 1, 8],
]
const CROSS = [
  [6, 3], [7, 4], [8, 5], [9, 6], [10, 7],
  [10, 3], [9, 4], [7, 6], [6, 7],
]

export default function SoundToggle({ muted, onToggle }) {
  return (
    <button
      type="button"
      className="sound-toggle"
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      aria-pressed={muted}
      onClick={onToggle}
    >
      <svg viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
        {SPEAKER.map(([x, y, w, h]) => (
          <rect key={`s${x}`} x={x} y={y} width={w} height={h} />
        ))}
        {muted
          ? CROSS.map(([x, y]) => <rect key={`c${x}-${y}`} x={x} y={y} width="1" height="1" />)
          : WAVES.map(([x, y, w, h]) => <rect key={`w${x}`} x={x} y={y} width={w} height={h} />)}
      </svg>
    </button>
  )
}
