import { useEffect } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled])'

// Shared behaviour for panels that sit over the page: focus moves into the panel, Esc closes it,
// Tab stays inside it, and focus goes back to where it came from when it closes.
export function useDialogFocus(panel, initialFocus, onClose) {
  useEffect(() => {
    const opener = document.activeElement
    initialFocus.current?.focus({ preventScroll: true }) // so a long panel opens at its top
    return () => opener?.focus?.()
  }, [initialFocus])

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
  }, [panel, onClose])
}
