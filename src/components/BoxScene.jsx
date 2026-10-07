import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { NoToneMapping } from 'three'
import { ContactShadows } from '@react-three/drei'
import BlindBox from './BlindBox.jsx'

// Camera framing: a 3/4 view looking slightly down at the box.
const CAMERA = {
  fov: 30,
  target: [0, 0.6, 0], // below the box centre, so the box sits a little above the middle of the screen (room for the hint)
  direction: [1, 0.55, 1.6], // 3/4 angle, front-right and a little above
  // Half the width/height (in model units) that must stay on screen, including margin.
  // The box seen from 3/4 is roughly 1.7 wide x 1.5 tall; the extra height leaves room for the hint.
  fitHalfWidth: 0.9,
  fitHalfHeight: 1.2,
}

// Keeps the whole box in view at any screen shape by moving the camera
// back on narrow (portrait) or short (landscape) screens.
function ResponsiveCamera() {
  const camera = useThree((s) => s.camera)
  const aspect = useThree((s) => s.size.width / s.size.height)

  useEffect(() => {
    const vFov = (camera.fov * Math.PI) / 180
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect)
    // Back up far enough to fit the box's width AND height; whichever needs more distance wins.
    const distance = Math.max(
      CAMERA.fitHalfWidth / Math.tan(hFov / 2),
      CAMERA.fitHalfHeight / Math.tan(vFov / 2),
    )

    const [dx, dy, dz] = CAMERA.direction
    const len = Math.hypot(dx, dy, dz)
    const [tx, ty, tz] = CAMERA.target
    camera.position.set(tx + (dx / len) * distance, ty + (dy / len) * distance, tz + (dz / len) * distance)
    camera.lookAt(tx, ty, tz)
    camera.updateProjectionMatrix()
  }, [camera, aspect])

  return null
}

export default function BoxScene({ stage, onTap, onReady }) {
  return (
    <Canvas
      className="scene"
      dpr={[1, 2]} // cap pixel ratio at 2 to protect mobile GPUs
      camera={{ fov: CAMERA.fov, near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, toneMapping: NoToneMapping }} // no tone mapping keeps the artwork colours true
    >
      <ResponsiveCamera />

      <ambientLight intensity={1.7} />
      <directionalLight position={[3, 5, 4]} intensity={2} />
      <directionalLight position={[-4, 2, -2]} intensity={0.6} />

      <Suspense fallback={null}>
        <BlindBox stage={stage} onTap={onTap} onReady={onReady} />
      </Suspense>

      <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={4} blur={2.4} far={1.5} resolution={256} frames={1} />
    </Canvas>
  )
}
