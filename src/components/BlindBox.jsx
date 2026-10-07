import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { STAGE } from '../config.js'
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

export default function BlindBox({ stage, onTap, onShakeDone, onOpenDone, onReady, ...props }) {
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

  // Drive the box from the timelines. Everything is a function of time since the stage began.
  useFrame(({ clock }) => {
    const reduced = prefersReducedMotion()

    // While the reset runs the box is off-screen, so it can quietly close up before returning.
    if (stage === STAGE.IDLE || stage === STAGE.RESETTING || stage === STAGE.RETURNING) {
      startTime.current = null
      openStart.current = null
      shakeDoneSent.current = false
      openDoneSent.current = false
      applyPose(parts.root, REST_POSE)
      applyFlaps(parts.flaps, FLAPS_CLOSED)
      return
    }

    if (stage === STAGE.SHAKING) {
      if (startTime.current === null) startTime.current = clock.elapsedTime
      const t = clock.elapsedTime - startTime.current
      applyPose(parts.root, shakePose(t, reduced))
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
        onTap?.()
      }}
      onPointerOver={() => idle && (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
      {...props}
    />
  )
}

useLoader.preload(GLTFLoader, BOX_MODEL_URL)
