import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { MathUtils, SRGBColorSpace, TextureLoader, Vector3 } from 'three'
import { STAGE, STICKER_LAYOUT as L, TIMING } from '../config.js'
import { findContentBounds } from '../utils/imageBounds.js'
import { revealTotalDuration, stickerProgress } from '../utils/stickerMotion.js'

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Reused every frame to avoid creating garbage.
const BOX_CENTER = new Vector3(0, 0.75, 0)
const START = new Vector3()
const OUT = new Vector3()
const FINAL = new Vector3()
const FORWARD = new Vector3()
const UP = new Vector3()

// The sticker as a flat card in the 3D scene, so the box genuinely hides it while it is inside.
// It loads its image as soon as a sticker is picked (at tap time), so the picture is ready
// by the time the box has shaken and opened.
export default function StickerReveal({ sticker, stage, onRevealDone }) {
  const gl = useThree((s) => s.gl)
  const group = useRef()
  const [loaded, setLoaded] = useState(null) // { texture, bounds } once the image is ready
  const [failed, setFailed] = useState(false)
  const startTime = useRef(null)
  const doneSent = useRef(false)

  useEffect(() => {
    setLoaded(null)
    setFailed(false)
    if (!sticker) return

    let cancelled = false
    let texture = null
    new TextureLoader().load(
      sticker.file,
      (tex) => {
        if (cancelled) return tex.dispose()
        tex.colorSpace = SRGBColorSpace
        tex.anisotropy = Math.min(4, gl.capabilities.getMaxAnisotropy())
        gl.initTexture(tex) // upload to the GPU now, so there is no stutter mid-animation
        texture = tex
        setLoaded({ texture: tex, bounds: findContentBounds(tex.image) })
      },
      undefined,
      () => {
        if (cancelled) return
        console.warn(`Could not load sticker image ${sticker.file}`)
        setFailed(true)
      },
    )
    return () => {
      cancelled = true
      texture?.dispose() // free the GPU memory when the sticker is cleared
    }
  }, [sticker, gl])

  useFrame(({ clock, camera, size }) => {
    const g = group.current
    if (!g) return

    const active = stage === STAGE.REVEALING || stage === STAGE.REVEALED
    g.visible = active && !!loaded
    if (!active) {
      startTime.current = null
      doneSent.current = false
      return
    }
    if (failed) {
      // Image missing: skip the animation so the experience carries on (Phase 12 adds a proper message).
      if (!doneSent.current) {
        doneSent.current = true
        onRevealDone?.()
      }
      return
    }
    if (!loaded) return // still downloading: the open box waits

    const reduced = prefersReducedMotion()
    if (startTime.current === null) startTime.current = clock.elapsedTime
    const t = clock.elapsedTime - startTime.current
    const { rise, present, roll } = stickerProgress(t, reduced)
    const { texture, bounds } = loaded
    const aspect = texture.image.width / texture.image.height

    // The card is sized so the visible artwork (bounds) fits a given box: returns the card's width.
    const cardWidthFor = (fitWidth, fitHeight) =>
      Math.min(fitWidth / bounds.w, (fitHeight * aspect) / bounds.h)

    // Final spot: in front of the box, defined relative to the camera so it
    // looks the same on every screen shape.
    // (camera.userData.framingDistance is the camera's fitted distance, set in BoxScene.)
    const hoverDistance = (camera.userData.framingDistance ?? camera.position.distanceTo(BOX_CENTER)) * L.hoverDistanceFrac
    const visibleHeight = 2 * hoverDistance * Math.tan(MathUtils.degToRad(camera.fov) / 2)
    const visibleWidth = visibleHeight * (size.width / size.height)
    const startWidth = cardWidthFor(L.startFit, L.startFit)
    const finalWidth = cardWidthFor(L.finalWidthFrac * visibleWidth, L.finalHeightFrac * visibleHeight)
    FORWARD.set(0, 0, -1).applyQuaternion(camera.quaternion)
    UP.set(0, 1, 0).applyQuaternion(camera.quaternion)
    const bob = reduced ? 0 : Math.sin(t * 1.8) * TIMING.stickerFloat * visibleHeight * MathUtils.clamp(present, 0, 1)
    FINAL.copy(camera.position)
      .addScaledVector(FORWARD, hoverDistance)
      .addScaledVector(UP, (1 - 2 * L.finalCenterFromTop) * (visibleHeight / 2) + bob)

    // Path: up out of the box, then out to the final spot. The group's origin is the centre
    // of the visible artwork, so it rises, rocks and grows around that point.
    START.set(0, L.startY, 0)
    OUT.set(0, L.rimY + (bounds.h * startWidth) / aspect / 2 + L.clearance, 0)
    START.lerp(OUT, rise).lerp(FINAL, present)
    const width = MathUtils.lerp(startWidth, finalWidth, present)

    g.position.copy(START)
    g.quaternion.copy(camera.quaternion) // always faces the viewer
    g.rotateZ(roll)
    g.scale.set(width, width / aspect, 1)

    if (stage === STAGE.REVEALING && t >= revealTotalDuration(reduced) && !doneSent.current) {
      doneSent.current = true
      onRevealDone?.()
    }
  })

  return (
    <group ref={group} visible={false}>
      {loaded && (
        // Shifted so the centre of the visible artwork sits at the group's origin.
        <mesh frustumCulled={false} position={[0.5 - loaded.bounds.cx, loaded.bounds.cy - 0.5, 0]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={loaded.texture} transparent alphaTest={0.02} toneMapped={false} />
        </mesh>
      )}
    </group>
  )
}
