import { useCallback, useEffect, useRef, useState } from 'react'
import { prefetchSticker, releaseSticker } from '../utils/stickerFile.js'
import { saveSticker } from '../utils/saveSticker.js'
import { shareSticker } from '../utils/shareSticker.js'
import { isInAppBrowser } from '../utils/inAppBrowser.js'

const MESSAGES = {
  saveFailed: 'Couldn’t save the sticker. Please try again.',
  shareUnsupported: 'Sharing isn’t available here, so your sticker was saved instead.',
  shareFailed: 'Couldn’t share, so your sticker was saved instead.',
  shareTapAgain: 'The share sheet didn’t open. Tap Share again.',
}
const NOTICE_SECONDS = 6

// Save and Share for the revealed sticker, plus the short message shown when something needs saying.
// `enabled` should be true from the moment the sticker starts to appear: that is when the image
// file starts downloading in the background, so it is ready by the time Share is tapped.
export function useStickerActions(sticker, enabled) {
  const [notice, setNotice] = useState(null)
  const [holdToSave, setHoldToSave] = useState(false) // in-app browsers: show the press-and-hold picture
  const busy = useRef(false) // ignores repeat taps while a save/share is in progress

  useEffect(() => {
    if (!sticker || !enabled) return
    prefetchSticker(sticker)
    return () => releaseSticker(sticker)
  }, [sticker, enabled])

  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), NOTICE_SECONDS * 1000)
    return () => clearTimeout(timer)
  }, [notice])

  useEffect(() => {
    setNotice(null)
    setHoldToSave(false)
  }, [sticker]) // new reveal, clean slate

  // In-app browsers (LinkedIn etc.) ignore file downloads, so Save opens the share sheet instead
  // (it has "Save Image"), and if that isn't possible either, the press-and-hold picture.
  // As in share(): nothing is awaited or set before shareSticker, so it still counts as coming from the tap.
  const saveInApp = useCallback(async () => {
    try {
      const outcome = await shareSticker(sticker)
      if (outcome === 'unsupported') setHoldToSave(true)
      else setNotice(null)
    } catch (error) {
      if (error?.name === 'NotAllowedError') setNotice(MESSAGES.shareTapAgain)
      else setHoldToSave(true)
    }
  }, [sticker])

  const save = useCallback(async () => {
    if (!sticker || busy.current) return
    busy.current = true
    try {
      if (isInAppBrowser()) {
        await saveInApp()
        return
      }
      setNotice(null)
      await saveSticker(sticker)
    } catch (error) {
      console.warn('Could not save the sticker:', error)
      setNotice(MESSAGES.saveFailed)
    } finally {
      busy.current = false
    }
  }, [sticker, saveInApp])

  // Saving as the fallback when the share sheet isn't an option.
  const saveInstead = useCallback(
    async (message) => {
      try {
        await saveSticker(sticker)
        setNotice(message)
      } catch (error) {
        console.warn('Could not save the sticker:', error)
        setNotice(MESSAGES.saveFailed)
      }
    },
    [sticker],
  )

  // NOTE: no `await` and no state updates before shareSticker(), so navigator.share() still
  // counts as coming straight from the tap (required by iPhone Safari).
  const share = useCallback(async () => {
    if (!sticker || busy.current) return
    busy.current = true
    try {
      const outcome = await shareSticker(sticker)
      if (outcome === 'unsupported') await saveInstead(MESSAGES.shareUnsupported)
      else setNotice(null)
    } catch (error) {
      console.warn('Could not share the sticker:', error)
      if (error?.name === 'NotAllowedError') setNotice(MESSAGES.shareTapAgain)
      else await saveInstead(MESSAGES.shareFailed)
    } finally {
      busy.current = false
    }
  }, [sticker, saveInstead])

  const closeHoldToSave = useCallback(() => setHoldToSave(false), [])

  return { save, share, notice, holdToSave, closeHoldToSave }
}
