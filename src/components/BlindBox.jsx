import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { STAGE, TURN } from '../config.js'
import { clamp01, easeOutCubic } from '../utils/easing.js'
import {
  FLAPS_CLOSED,
  REST_POSE,
  flapAngles,
  openTotalDuration,
  shakePose,
  shakeTotalDuration,
} from '../utils/boxMotion.js'
import { prefersReducedMotion } from '../utils/motionPreference.js'

export const BOX_MODEL_URL = '/models/toffee_box.glb'

// Node names exported from the GLB. Each flap's origin sits on its hinge,
// so later phases can open a flap by rotating its node.
export const FLAP_NAMES = ['Flap_Front', 'Flap_Left', 'Flap_Right', 'Flap_Back']


// Squish scales from the box base; tilt/twist rotate around the base; slide moves sideways.
function applyPose(root, { squish, tilt, twist, slide }) {
  root.scale.set(1 + squish * 0.5, 1 - squish, 1 + squish * 0.5)
  root.rotation.set(0, twist, tilt)
  root.position.x = slide
}

// Each flap's origin is on its hinge, so opening a flap is just a rotation. The sign
// of each axis makes the flap swing up and outward, away from the box opening.
function applyFlaps(flaps, angles) {
  flaps.Flap_Front.rotation.x = angles.front
  flaps.Flap_Back.rotation.x = -angles.back
  flaps.Flap_Left.rotation.z = angles.left
  flaps.Flap_Right.rotation.z = -angles.right
}

export default function BlindBox({ stage, onTap, onShakeDone, onOpenDone, onReady, onTurn, ...props }) {
  const { scene } = useLoader(GLTFLoader, BOX_MODEL_URL)
  // Every named part of the model (Box_Root, Box_Body, Flap_Front...), for the animations.
  const nodes = useMemo(() => {
    const byName = {}
    scene.traverse((object) => {
      if (object.name) byName[object.name] = object
    })
    return byName
  }, [scene])
  const startTime = useRef(null) // clock time when the tap happened
  const openStart = useRef(null) // clock time when the flaps began to open
  const shakeDoneSent = useRef(false)

  // Turning the closed box by dragging. `yaw` is the extra spin (radians) on top of the pose.
  const gl = useThree((state) => state.gl)
  const stageRef = useRef(stage)
  stageRef.current = stage
  const yaw = useRef(0)
  const spin = useRef(0) // radians per second, carries on briefly after letting go
  const yawFrom = useRef(0) // where the swing back to front starts
  const drag = useRef(null) // { id, x, time } while a finger/mouse is down
  const openDoneSent = useRef(false)

  // References to the movable parts, for the shake/open animations.
  const parts = useMemo(
    () => ({
      root: nodes.Box_Root,
      body: nodes.Box_Body,
      flaps: Object.fromEntries(FLAP_NAMES.map((name) => [name, nodes[name]])),
    }),
    [nodes],
  )

  useEffect(() => {
    if (import.meta.env.DEV) {
      const missing = FLAP_NAMES.filter((name) => !parts.flaps[name])
      if (missing.length) console.warn('BlindBox: missing GLB nodes', missing)
    }
    onReady?.()
  }, [parts, onReady])

  // Drag anywhere on the scene to turn the box, only while it is still closed and waiting.
  useEffect(() => {
    const canvas = gl.domElement
    const onDown = (e) => {
      if (stageRef.current !== STAGE.IDLE || !e.isPrimary) return
      drag.current = { id: e.pointerId, x: e.clientX, time: e.timeStamp }
      spin.current = 0
    }
    const onMove = (e) => {
      const d = drag.current
      if (!d || d.id !== e.pointerId || stageRef.current !== STAGE.IDLE) return
      const dx = e.clientX - d.x
      if (dx === 0) return
      const dt = Math.max((e.timeStamp - d.time) / 1000, 0.008)
      const turn = dx * TURN.radiansPerPixel
      yaw.current += turn
      onTurn?.() // lets the "Rotate me!" hint know the visitor found it
      // Smoothed so one jittery event doesn't decide the flick speed.
      spin.current = 0.6 * spin.current + 0.4 * Math.max(-TURN.maxSpin, Math.min(TURN.maxSpin, turn / dt))
      d.x = e.clientX
      d.time = e.timeStamp
    }
    const onUp = (e) => {
      const d = drag.current
      if (!d || d.id !== e.pointerId) return
      // If the finger rested before lifting, don't fling.
      if (e.timeStamp - d.time > 90 || prefersReducedMotion()) spin.current = 0
      drag.current = null
    }
    canvas.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [gl, onTurn])

  // Drive the box from the timelines. Everything is a function of time since the stage began.
  useFrame(({ clock }, delta) => {
    const reduced = prefersReducedMotion()

    // While the reset runs the box is off-screen, so it can quietly close up before returning.
    if (stage === STAGE.IDLE || stage === STAGE.RESETTING || stage === STAGE.RETURNING) {
      startTime.current = null
      openStart.current = null
      shakeDoneSent.current = false
      openDoneSent.current = false
      if (stage === STAGE.IDLE) {
        // Let a flick keep spinning for a moment, then slow to a stop.
        if (!drag.current && spin.current !== 0) {
          yaw.current += spin.current * delta
          spin.current *= Math.exp(-TURN.spinDecay * delta)
          if (Math.abs(spin.current) < 0.02) spin.current = 0
        }
      } else {
        yaw.current = 0 // a fresh box always comes back facing front
        spin.current = 0
      }
      applyPose(parts.root, REST_POSE)
      parts.root.rotation.y = yaw.current
      applyFlaps(parts.flaps, FLAPS_CLOSED)
      return
    }

    if (stage === STAGE.SHAKING) {
      if (startTime.current === null) {
        startTime.current = clock.elapsedTime
        // Take the shortest way round back to facing front.
        yawFrom.current = Math.atan2(Math.sin(yaw.current), Math.cos(yaw.current))
        spin.current = 0
      }
      const t = clock.elapsedTime - startTime.current
      const pose = shakePose(t, reduced)
      applyPose(parts.root, pose)
      const back = reduced ? TURN.returnDurationReduced : TURN.returnDuration
      yaw.current = yawFrom.current * (1 - easeOutCubic(clamp01(t / back)))
      parts.root.rotation.y = pose.twist + yaw.current
      if (t >= shakeTotalDuration(reduced) && !shakeDoneSent.current) {
        shakeDoneSent.current = true
        onShakeDone?.()
      }
      return
    }

    if (stage === STAGE.OPENING) {
      if (openStart.current === null) openStart.current = clock.elapsedTime
      const t = clock.elapsedTime - openStart.current
      applyPose(parts.root, REST_POSE)
      yaw.current = 0
      applyFlaps(parts.flaps, flapAngles(t, reduced))
      if (t >= openTotalDuration(reduced) && !openDoneSent.current) {
        openDoneSent.current = true
        onOpenDone?.()
      }
    }
    // Later stages: the flaps stay where the last OPENING frame left them.
  })

  const idle = stage === STAGE.IDLE

  return (
    <primitive
      object={scene}
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta > TURN.tapSlop) return // that was a drag to turn the box, not a tap
        onTap?.()
      }}
      onPointerOver={() => idle && (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
      {...props}
    />
  )
}

useLoader.preload(GLTFLoader, BOX_MODEL_URL)
