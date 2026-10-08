import { useCallback, useEffect, useRef, useState } from 'react'
import { GALLERY } from '../data/gallery.js'
import { prefersReducedMotion } from '../utils/motionPreference.js'

// A swipe gallery: a row of full-width slides that snap into place (native scrolling, so it feels
// right on touch). Arrow buttons and dots are for mouse/keyboard users; Left/Right keys work too.
export default function Gallery() {
  const scroller = useRef(null)
  const [index, setIndex] = useState(0)
  const count = GALLERY.length

  const goTo = useCallback((next) => {
    const el = scroller.current
    if (!el) return
    const target = Math.max(0, Math.min(count - 1, next))
    el.scrollTo({ left: target * el.clientWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [count])

  // Which slide is showing: read from the scroll position (works for swipes, keys and buttons alike).
  const onScroll = () => {
    const el = scroller.current
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  const onKeyDown = (event) => {
    if (event.key === 'ArrowRight') goTo(index + 1)
    else if (event.key === 'ArrowLeft') goTo(index - 1)
    else return
    event.preventDefault()
  }

  // Keep the current slide in place if the window is resized or the phone is rotated.
  useEffect(() => {
    const el = scroller.current
    if (!el) return
    const observer = new ResizeObserver(() => { el.scrollLeft = index * el.clientWidth })
    observer.observe(el)
    return () => observer.disconnect()
  }, [index])

  if (count === 0) return null

  return (
    <div className="gallery">
      <div className="gallery-frame">
        <div
          ref={scroller}
          className="gallery-track"
          role="region"
          aria-roledescription="carousel"
          aria-label="Photos and videos of Toffee"
          tabIndex={0}
          onScroll={onScroll}
          onKeyDown={onKeyDown}
        >
          {GALLERY.map((item, i) => (
            <Slide key={item.src} item={item} position={i + 1} total={count} active={i === index} />
          ))}
        </div>
        {count > 1 && (
          <>
            <button type="button" className="gallery-arrow gallery-prev" aria-label="Previous" disabled={index === 0} onClick={() => goTo(index - 1)}>
              ‹
            </button>
            <button type="button" className="gallery-arrow gallery-next" aria-label="Next" disabled={index === count - 1} onClick={() => goTo(index + 1)}>
              ›
            </button>
          </>
        )}
      </div>
      {count > 1 && (
        <div className="gallery-dots">
          {GALLERY.map((item, i) => (
            <button
              key={item.src}
              type="button"
              className="gallery-dot"
              aria-label={`Show ${i + 1} of ${count}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Slide({ item, position, total, active }) {
  return (
    <div className="gallery-slide" role="group" aria-roledescription="slide" aria-label={`${position} of ${total}`}>
      {item.type === 'video' ? (
        <GalleryVideo item={item} active={active} />
      ) : (
        <img
          src={item.src}
          alt={item.alt}
          loading={position === 1 ? 'eager' : 'lazy'}
          decoding="async"
          draggable="false"
        />
      )}
    </div>
  )
}

// Nothing downloads until the viewer taps play (the clip is several MB). It pauses when swiped away.
function GalleryVideo({ item, active }) {
  const video = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!active) video.current?.pause()
  }, [active])

  const play = () => {
    setStarted(true)
    video.current?.play().catch(() => {}) // blocked or failed: the native controls are shown so they can retry
  }

  return (
    <>
      <video
        ref={video}
        src={item.src}
        poster={item.poster}
        aria-label={item.alt}
        preload="none"
        playsInline
        loop
        controls={started}
        onPause={(event) => { if (event.target.ended) setStarted(false) }}
      />
      {!started && (
        <button type="button" className="gallery-play" aria-label="Play video" onClick={play}>
          <span aria-hidden="true">▶</span>
        </button>
      )}
    </>
  )
}
