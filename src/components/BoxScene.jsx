import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MathUtils, NoToneMapping } from 'three'
import { ContactShadows } from '@react-three/drei'
import BlindBox from './BlindBox.jsx'
import { STAGE } from '../config.js'

// Camera framing: a 3/4 view looking slightly down at the box.
// Two framings: tight on the closed box, and wider/higher once the flaps are open
// (they stick up above the box, and the sticker will come out up there too).
const CAMERA = {
  fov: 30,
  direction: [1, 0.55, 1.6], // 3/4 angle, front-right and a little above
  // target = the point the camera looks at (y is lower than the box centre so the box sits a
  // little above the middle of the screen, leaving room for the hint).
  // fitHalfWidth/Height = half the width/height (model units) that must stay on screen.
  closed: { target: [0, 0.6, 0], fitHalfWidth: 0.9, fitHalfHeight: 1.2 },
  open: { target: [0, 1.0, 0], fitHalfWidth: 1.15, fitHalfHeight: 1.55 },
  transitionSpeed: 4, // how quickly the camera eases between the two (higher = faster)
}

const lerp = MathUtils.lerp
const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Keeps the whole box in view at any screen shape by moving the camera back on
// narrow (portrait) or short (landscape) screens, and eases to the "open" framing.
function ResponsiveCamera({ open }) {
  const blend = useRef(0) // 0 = closed framing, 1 = open framing
  const applied = useRef({ blend: -1, aspect: -1 })

  useFrame(({ camera, size }, delta) => {
    const goal = open ? 1 : 0
    if (prefersReducedMotion()) blend.current = goal
    else blend.current = MathUtils.damp(blend.current, goal, CAMERA.transitionSpeed, delta)
    if (Math.abs(blend.current - goal) < 0.0005) blend.current = goal

    const aspect = size.width / size.height
    if (applied.current.blend === blend.current && applied.current.aspect === aspect) return // nothing changed
    applied.current = { blend: blend.current, aspect }

    const { closed, open: opened } = CAMERA
    const b = blend.current
    const halfWidth = lerp(closed.fitHalfWidth, opened.fitHalfWidth, b)
    const halfHeight = lerp(closed.fitHalfHeight, opened.fitHalfHeight, b)
    const target = closed.target.map((v, i) => lerp(v, opened.target[i], b))

    const vFov = MathUtils.degToRad(camera.fov)
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect)
    // Back up far enough to fit the width AND height; whichever needs more distance wins.
    const distance = Math.max(halfWidth / Math.tan(hFov / 2), halfHeight / Math.tan(vFov / 2))

    const [dx, dy, dz] = CAMERA.direction
    const len = Math.hypot(dx, dy, dz)
    const [tx, ty, tz] = target
    camera.position.set(tx + (dx / len) * distance, ty + (dy / len) * distance, tz + (dz / len) * distance)
    camera.lookAt(tx, ty, tz)
  })

  return null
}

export default function BoxScene({ stage, onTap, onShakeDone, onOpenDone, onReady }) {
  return (
    <Canvas
      className="scene"
      dpr={[1, 2]} // cap pixel ratio at 2 to protect mobile GPUs
      camera={{ fov: CAMERA.fov, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, toneMapping: NoToneMapping }} // no tone mapping keeps the artwork colours true
    >
      <ResponsiveCamera open={stage === STAGE.OPENING || stage === STAGE.OPENED} />

      <ambientLight intensity={1.7} />
      <directionalLight position={[3, 5, 4]} intensity={2} />
      <directionalLight position={[-4, 2, -2]} intensity={0.6} />

      <Suspense fallback={null}>
        <BlindBox stage={stage} onTap={onTap} onShakeDone={onShakeDone} onOpenDone={onOpenDone} onReady={onReady} />
      </Suspense>

      <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={4} blur={2.4} far={1.5} resolution={256} frames={1} />
    </Canvas>
  )
}
