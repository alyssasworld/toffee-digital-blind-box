// A button whose look (and label text) is a pixel-art picture from /public/buttons/.
// `label` is read aloud by screen readers, since the visible text is part of the image.
export default function PixelButton({ src, label, className = '', ...props }) {
  return (
    <button type="button" className={`pixel-button ${className}`} aria-label={label} {...props}>
      <img src={src} alt="" draggable={false} />
    </button>
  )
}
