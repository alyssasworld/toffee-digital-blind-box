import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'

export const BOX_MODEL_URL = '/models/toffee_box.glb'

// Node names exported from the GLB. Each flap's origin sits on its hinge,
// so later phases can open a flap by rotating its node.
export const FLAP_NAMES = ['Flap_Front', 'Flap_Left', 'Flap_Right', 'Flap_Back']

export default function BlindBox({ onReady, ...props }) {
  const { scene, nodes } = useGLTF(BOX_MODEL_URL)

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

  return <primitive object={scene} {...props} />
}

useGLTF.preload(BOX_MODEL_URL)
