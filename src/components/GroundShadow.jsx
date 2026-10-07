import { useMemo } from 'react'
import { CanvasTexture, LinearFilter } from 'three'

const SIZE = 128 // texture resolution: it is only a soft blur, so small is fine
const PLANE = 2.4 // size of the shadow plane in model units (the box footprint is about 1 x 0.96)

// A soft, box-shaped blur drawn once on a tiny canvas. The shape is drawn off-screen and only its
// blurred shadow is moved into view: a trick that works in every browser (Safari has no canvas blur filter).
function makeShadowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  const footprint = (1 / PLANE) * SIZE // the box's footprint in texture pixels
  const far = 1000
  ctx.shadowColor = 'rgba(0, 0, 0, 1)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetX = far
  ctx.fillRect((SIZE - footprint) / 2 - far, (SIZE - footprint * 0.96) / 2, footprint, footprint * 0.96)

  const texture = new CanvasTexture(canvas)
  texture.minFilter = texture.magFilter = LinearFilter
  texture.generateMipmaps = false
  return texture
}

// A soft shadow under the box so it sits on the "floor" instead of floating.
export default function GroundShadow({ opacity = 0.35 }) {
  const texture = useMemo(makeShadowTexture, [])
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0.002, 0]} renderOrder={-1}>
      <planeGeometry args={[PLANE, PLANE]} />
      <meshBasicMaterial map={texture} transparent opacity={opacity} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}
