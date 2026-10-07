import { SOUND_MIX } from '../config.js'
// The sound files live in /sounds (outside /public); Vite bundles them and gives each a cache-friendly URL.
import tapUrl from '../../sounds/user_clicks_open_pop_sound_effect.MP3?url'
import openUrl from '../../sounds/opening_box_sound_effect.MP3?url'
import revealUrl from '../../sounds/open_package_glitter_sound_effect.MP3?url'
import againUrl from '../../sounds/open_again_sound_effect.MP3?url'

const FILES = { tap: tapUrl, open: openUrl, reveal: revealUrl, again: againUrl }
const MUTE_KEY = 'toffee-blind-box:muted'

let context = null
let master = null
let loading = null
let muted = readMuted()
const buffers = {}
const playing = new Set()

function readMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === '1'
  } catch {
    return false // storage can be blocked (private mode): just default to sound on
  }
}

// Phones only allow sound after the user has touched the page, so the audio engine is created
// "suspended" and woken up by the first tap or key press (see unlockOnGesture).
function getContext() {
  if (context) return context
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return null
  context = new AudioContext()
  master = context.createGain()
  master.gain.value = SOUND_MIX.master
  master.connect(context.destination)
  return context
}

// decodeAudioData in a form that also works on older Safari (callback style).
const decode = (ctx, data) => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject))

// Downloads and decodes all the sounds (about 65 KB in total). Safe to call more than once.
export function loadSounds() {
  if (loading) return loading
  const ctx = getContext()
  if (!ctx) return Promise.resolve()
  loading = Promise.all(
    Object.entries(FILES).map(async ([name, url]) => {
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        buffers[name] = await decode(ctx, await response.arrayBuffer())
      } catch (error) {
        console.warn(`Sound "${name}" could not be loaded; it will stay silent.`, error)
      }
    }),
  )
  return loading
}

function resume() {
  if (context && context.state !== 'running') context.resume().catch(() => {})
}

// Wake the audio engine on the first (and any later) tap or key press.
export function unlockOnGesture() {
  const events = ['pointerup', 'touchend', 'click', 'keydown']
  const handler = () => resume()
  events.forEach((name) => window.addEventListener(name, handler, { capture: true, passive: true }))
  // Hand the audio back politely when the tab/app goes to the background.
  const onVisibility = () => {
    if (!context) return
    if (document.hidden) context.suspend().catch(() => {})
    else resume()
  }
  document.addEventListener('visibilitychange', onVisibility)
  return () => {
    events.forEach((name) => window.removeEventListener(name, handler, { capture: true }))
    document.removeEventListener('visibilitychange', onVisibility)
  }
}

export function stopAll() {
  playing.forEach((source) => {
    try {
      source.stop()
    } catch {
      /* already finished */
    }
  })
  playing.clear()
}

export function isMuted() {
  return muted
}

export function setMuted(value) {
  muted = value
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0')
  } catch {
    /* not saved, but still works for this visit */
  }
  if (value) stopAll()
}

// Plays one of the sounds ('tap' | 'open' | 'reveal' | 'again'). Does nothing if muted, still loading,
// or the phone has not yet allowed sound; it never throws.
export function playSound(name) {
  try {
    const ctx = context
    const buffer = buffers[name]
    if (muted || !ctx || !buffer) return
    resume()
    const mix = SOUND_MIX[name]
    const gain = ctx.createGain()
    gain.gain.value = mix.volume
    gain.connect(master)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(gain)
    source.onended = () => {
      playing.delete(source)
      gain.disconnect()
    }
    playing.add(source)
    source.start(ctx.currentTime + mix.delay)
  } catch (error) {
    console.warn('Could not play sound', error)
  }
}
