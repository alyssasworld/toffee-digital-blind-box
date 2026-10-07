import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { STAGE } from '../config.js'
import { REST_POSE, shakePose, shakeTotalDuration } from '../utils/boxMotion.js'

export const BOX_MODEL_URL = '/models/toffee_box.glb'

// Node names exported from the GLB. Each flap's origin sits on its hinge,
// so later phases can open a flap by rotating its node.
export const FLAP_NAMES = ['Flap_Front', 'Flap_Left', 'Flap_Right', 'Flap_Back']

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Squish scales from the box base; tilt/twist rotate around the base; slide moves sideways.
function applyPose(root, { squish, tilt, twist, slide }) {
  root.scale.set(1 + squish * 0.5, 1 - squish, 1 + squish * 0.5)
  root.rotation.set(0, twist, tilt)
  root.position.x = slide
}

export default function BlindBox({ stage, onTap, onShakeDone, onReady, ...props }) {
  const { scene, nodes } = useGLTF(BOX_MODEL_URL)
  const startTime = useRef(null) // clock time when the tap happened
  const doneSent = useRef(false)

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

  // Drive the box from the shake timeline. Everything is a function of time since the tap.
  useFrame(({ clock }) => {
    if (stage === STAGE.IDLE) {
      startTime.current = null
      doneSent.current = false
      applyPose(parts.root, REST_POSE)
      return
    }
    if (stage !== STAGE.SHAKING) return

    if (startTime.current === null) startTime.current = clock.elapsedTime
    const reduced = prefersReducedMotion()
    const t = clock.elapsedTime - startTime.current

    applyPose(parts.root, shakePose(t, reduced))

    if (t >= shakeTotalDuration(reduced) && !doneSent.current) {
      doneSent.current = true
      onShakeDone?.()
    }
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

useGLTF.preload(BOX_MODEL_URL)
