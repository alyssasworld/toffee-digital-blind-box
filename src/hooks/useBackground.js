import { useCallback, useEffect, useState } from 'react'
import { BACKGROUNDS, DEFAULT_BACKGROUND_ID, findBackground } from '../data/backgrounds.js'

const STORAGE_KEY = 'toffee-background'

function loadSavedId() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (BACKGROUNDS.some((background) => background.id === saved)) return saved
  } catch {
    // storage blocked (private mode etc.): just use the default
  }
  return DEFAULT_BACKGROUND_ID
}

// The chosen background, remembered between visits. Also keeps the page colour and the phone's
// browser-bar colour in step with the picture, and fades the new picture in once it has loaded.
export function useBackground() {
  const [id, setId] = useState(loadSavedId)
  const [loadedFile, setLoadedFile] = useState(null)
  const background = findBackground(id)

  useEffect(() => {
    let current = true
    const image = new Image()
    image.onload = () => current && setLoadedFile(background.file)
    image.src = background.file
    return () => {
      current = false
    }
  }, [background.file])

  useEffect(() => {
    document.documentElement.style.setProperty('--bg', background.color)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', background.color)
  }, [background.color])

  const choose = useCallback((nextId) => {
    setId(nextId)
    try {
      localStorage.setItem(STORAGE_KEY, nextId)
    } catch {
      // not saved, still works for this visit
    }
  }, [])

  return { background, choose, ready: loadedFile === background.file }
}
