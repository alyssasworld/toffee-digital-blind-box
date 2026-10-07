import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MathUtils, NoToneMapping } from 'three'
import { ContactShadows } from '@react-three/drei'
import BlindBox from './BlindBox.jsx'
import StickerReveal from './StickerReveal.jsx'
import { STAGE } from '../config.js'

// Camera framing: a 3/4 view looking slightly down at the box. Three framings:
//   closed:   tight on the closed box
//   open:     wider/higher once the flaps are open (they stick up above the box)
//   revealed: once the sticker has arrived, the camera drifts up so the box slides down
//             the screen and the sticker (which is fixed relative to the camera) takes centre stage
const CAMERA = {
  fov: 30,
  direction: [1, 0.55, 1.6], // 3/4 angle, front-right and a little above
  // target = the point the camera looks at. Raising it moves the box DOWN on screen.
  // fitHalfWidth/Height = half the width/height (model units) that must stay on screen.
  closed: { target: [0, 0.6, 0], fitHalfWidth: 0.9, fitHalfHeight: 1.2 },
  open: { target: [0, 1.0, 0], fitHalfWidth: 1.15, fitHalfHeight: 1.55 },
  revealed: { target: [0, 1.75, 0], fitHalfWidth: 1.15, fitHalfHeight: 1.55 },
  transitionSpeed: 4, // how quickly the camera eases between framings (higher = faster)
}

const FRAMING_INDEX = { closed: 0, open: 1, revealed: 2 }
const lerp = MathUtils.lerp
const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function framingFor(stage) {
  if (stage === STAGE.OPENING || stage === STAGE.REVEALING) return 'open'
  if (stage === STAGE.REVEALED) return 'revealed'
  return 'closed'
}

// Keeps the whole box in view at any screen shape by moving the camera back on
// narrow (portrait) or short (landscape) screens, and eases between the framings.
function ResponsiveCamera({ framing }) {
  const blend = useRef(0) // 0 = closed, 1 = open, 2 = revealed
  const applied = useRef({ blend: -1, aspect: -1 })

  useFrame(({ camera, size }, delta) => {
    const goal = FRAMING_INDEX[framing]
    if (prefersReducedMotion()) blend.current = goal
    else blend.current = MathUtils.damp(blend.current, goal, CAMERA.transitionSpeed, delta)
    if (Math.abs(blend.current - goal) < 0.0005) blend.current = goal

    const aspect = size.width / size.height
    if (applied.current.blend === blend.current && applied.current.aspect === aspect) return // nothing changed
    applied.current = { blend: blend.current, aspect }

    // Interpolate between neighbouring framings.
    const [from, to, b] =
      blend.current <= 1 ? [CAMERA.closed, CAMERA.open, blend.current] : [CAMERA.open, CAMERA.revealed, blend.current - 1]
    const halfWidth = lerp(from.fitHalfWidth, to.fitHalfWidth, b)
    const halfHeight = lerp(from.fitHalfHeight, to.fitHalfHeight, b)
    const target = from.target.map((v, i) => lerp(v, to.target[i], b))

    const vFov = MathUtils.degToRad(camera.fov)
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect)
    // Back up far enough to fit the width AND height; whichever needs more distance wins.
    const distance = Math.max(halfWidth / Math.tan(hFov / 2), halfHeight / Math.tan(vFov / 2))
    camera.userData.framingDistance = distance // lets the sticker size itself without depending on where the camera looks

    const [dx, dy, dz] = CAMERA.direction
    const len = Math.hypot(dx, dy, dz)
    const [tx, ty, tz] = target
    camera.position.set(tx + (dx / len) * distance, ty + (dy / len) * distance, tz + (dz / len) * distance)
    camera.lookAt(tx, ty, tz)
  })

  return null
}

export default function BoxScene({ stage, sticker, onTap, onShakeDone, onOpenDone, onRevealDone, onReady }) {
  return (
    <Canvas
      className="scene"
      dpr={[1, 2]} // cap pixel ratio at 2 to protect mobile GPUs
      camera={{ fov: CAMERA.fov, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, toneMapping: NoToneMapping }} // no tone mapping keeps the artwork colours true
    >
      <ResponsiveCamera framing={framingFor(stage)} />

      <ambientLight intensity={1.7} />
      <directionalLight position={[3, 5, 4]} intensity={2} />
      <directionalLight position={[-4, 2, -2]} intensity={0.6} />

      <Suspense fallback={null}>
        <BlindBox stage={stage} onTap={onTap} onShakeDone={onShakeDone} onOpenDone={onOpenDone} onReady={onReady} />
      </Suspense>

      <StickerReveal sticker={sticker} stage={stage} onRevealDone={onRevealDone} />

      <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={4} blur={2.4} far={1.5} resolution={256} frames={1} />
    </Canvas>
  )
}
