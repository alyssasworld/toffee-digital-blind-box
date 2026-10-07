import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { STAGE, TIMING } from '../config.js'

export const BOX_MODEL_URL = '/models/toffee_box.glb'

// Node names exported from the GLB. Each flap's origin sits on its hinge,
// so later phases can open a flap by rotating its node.
export const FLAP_NAMES = ['Flap_Front', 'Flap_Left', 'Flap_Right', 'Flap_Back']

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export default function BlindBox({ stage, onTap, onReady, ...props }) {
  const { scene, nodes } = useGLTF(BOX_MODEL_URL)
  const pressStart = useRef(null) // clock time when the tap squish began

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

  // Tap squish: a quick press-down and bounce back, from the base of the box.
  useFrame(({ clock }) => {
    if (stage === STAGE.OPENING && pressStart.current === null) {
      pressStart.current = clock.elapsedTime
    }
    if (pressStart.current === null) return

    const t = (clock.elapsedTime - pressStart.current) / TIMING.pressDuration
    const squish = t < 1 && !prefersReducedMotion() ? Math.sin(Math.PI * t) * TIMING.pressSquish : 0
    parts.root.scale.set(1 + squish * 0.5, 1 - squish, 1 + squish * 0.5)
  })

  // Reset the squish bookkeeping when the box returns to idle (Phase 11).
  useEffect(() => {
    if (stage === STAGE.IDLE) pressStart.current = null
  }, [stage])

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
