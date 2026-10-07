import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { NoToneMapping } from 'three'
import { ContactShadows } from '@react-three/drei'
import BlindBox from './BlindBox.jsx'

// Camera framing: a 3/4 view looking slightly down at the box.
const CAMERA = {
  fov: 30,
  target: [0, 0.75, 0], // roughly the vertical centre of the box
  direction: [1, 0.55, 1.6], // 3/4 angle, front-right and a little above
  fitRadius: 1.15, // how much of the scene must stay visible (box plus margin)
}

// Keeps the whole box in view at any screen shape by moving the camera
// back on narrow (portrait) screens.
function ResponsiveCamera() {
  const camera = useThree((s) => s.camera)
  const aspect = useThree((s) => s.size.width / s.size.height)

  useEffect(() => {
    const vFov = (camera.fov * Math.PI) / 180
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect)
    const limitingFov = Math.min(vFov, hFov)
    const distance = CAMERA.fitRadius / Math.sin(limitingFov / 2)

    const [dx, dy, dz] = CAMERA.direction
    const len = Math.hypot(dx, dy, dz)
    const [tx, ty, tz] = CAMERA.target
    camera.position.set(tx + (dx / len) * distance, ty + (dy / len) * distance, tz + (dz / len) * distance)
    camera.lookAt(tx, ty, tz)
    camera.updateProjectionMatrix()
  }, [camera, aspect])

  return null
}

export default function BoxScene({ onReady }) {
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
        <BlindBox onReady={onReady} />
      </Suspense>

      <ContactShadows position={[0, 0, 0]} opacity={0.35} scale={4} blur={2.4} far={1.5} resolution={256} frames={1} />
    </Canvas>
  )
}
