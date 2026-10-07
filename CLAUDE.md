# DIGITAL BLIND BOX — PROJECT CONTEXT & INSTRUCTIONS

## 1. PROJECT OVERVIEW

I am building an interactive digital blind box experience designed primarily for mobile phones.

The core experience is:

1. A user lands on the website.
2. They see a cute, polished 3D blind box.
3. They are prompted to tap the box.
4. The box shakes with anticipation.
5. The box opens.
6. A randomly selected collectible sticker emerges from inside.
7. The user sees the sticker name and rarity, if applicable.
8. The user can save the sticker PNG to their device.
9. The user can share the sticker using the native mobile share sheet where supported.
10. The user can open another box and receive another random sticker.

The experience should feel like opening a real collectible blind box, translated into a digital interactive experience.

The goal is NOT to create a generic 3D website or a generic mobile game.

It should feel:

* cute
* collectible
* playful
* tactile
* visually polished
* simple
* slightly surprising
* design-led
* fast
* mobile-first

The physical/visual artwork I provide is the source of truth for the visual identity.

---

# 2. SOURCE ASSETS

I will provide several assets for this project.

These may include:

* A hand-drawn blind-box schematic/reference
* Finished transparent PNG sticker artwork
* A 3D GLB/GLTF blind-box model generated separately
* Branding, typography or other visual references

DO NOT replace supplied artwork with AI-generated placeholder artwork unless explicitly instructed.

DO NOT redesign the blind box independently.

If an implementation decision conflicts with the supplied artwork/reference, ask me or explain the conflict before changing the design.

---

# 3. TECH STACK

The preferred initial stack is:

* Vite
* React
* JavaScript
* Three.js
* @react-three/fiber
* @react-three/drei
* CSS

Keep the project lightweight.

Do not introduce additional libraries unless there is a clear reason.

Potential libraries such as GSAP may be introduced later if they provide a meaningful advantage for animation, but do not add dependencies simply because they are available.

There should be:

* no backend
* no database
* no authentication
* no user accounts

unless I explicitly request them later.

The first version should be a static client-side application.

---

# 4. TARGET PLATFORM

The primary target is:

**Mobile Safari on iPhone.**

The website should also work on:

* Android mobile browsers
* Chrome desktop
* Safari desktop

Mobile is the priority.

Assume that many users will arrive via an NFC tag or QR code, potentially on mobile data.

The experience therefore needs to load quickly and feel immediate.

---

# 5. PERFORMANCE PRIORITIES

Performance is extremely important.

The site may be accessed from a physical NFC tag, so the user should not have to wait unnecessarily before interacting with the experience.

Prioritise:

* small GLB file size
* optimised textures
* compressed PNGs where possible
* minimal JavaScript
* efficient React rendering
* efficient Three.js rendering
* minimal dependencies
* lazy loading where appropriate
* avoiding unnecessary re-renders
* mobile GPU performance

Aim for a total initial experience that is lightweight enough to work comfortably over mobile data.

Do not sacrifice visual quality unnecessarily, but always consider whether an asset can be made significantly smaller without a noticeable visual difference.

---

# 6. PROJECT ARCHITECTURE

Keep the code modular and understandable.

Prefer a structure similar to:

src/
├── App.jsx
├── main.jsx
├── styles.css
│
├── components/
│   ├── BlindBox.jsx
│   ├── BoxScene.jsx
│   ├── StickerReveal.jsx
│   ├── RevealResult.jsx
│   ├── LoadingScreen.jsx
│   └── ActionButtons.jsx
│
├── data/
│   └── stickers.js
│
├── utils/
│   └── randomSticker.js
│
└── assets/

This structure can change if there is a good technical reason.

Avoid putting the entire application into one enormous component.

Keep data, randomisation logic, 3D rendering, animation and UI reasonably separated.

---

# 7. 3D BLIND BOX

The blind box will be provided as a GLB/GLTF model.

It should be rendered using Three.js / React Three Fiber.

The box should:

* sit naturally in the scene
* have appropriate lighting
* have a transparent/clean surrounding environment
* be responsive to viewport size
* maintain its proportions
* look good from a 3/4 perspective
* work well on mobile GPUs

If possible, the lid should be a separate mesh/object so that it can physically open.

Do not replace a 3D animation with a flat 2D image unless specifically instructed.

---

# 8. INITIAL STATE

When the user first arrives:

* The box should be closed.
* The scene should feel calm.
* The box may have a subtle idle animation.
* The user should understand that the box is interactive.

There should be a simple instruction such as:

"Tap to open"

The UI should not overwhelm the artwork.

---

# 9. OPENING EXPERIENCE

The opening should feel physical and tactile.

Preferred sequence:

1. User taps the box.
2. Interaction becomes temporarily locked.
3. Short anticipation movement.
4. Box shakes.
5. Shake increases slightly in intensity.
6. Box settles.
7. Brief anticipation pause.
8. Lid opens.
9. Short reveal pause.
10. Sticker emerges from inside.
11. Sticker settles into position.
12. Sticker information appears.
13. Save/share actions become available.

The animation should have intentional pacing.

Do NOT make it feel like:

* a generic website transition
* a casino machine
* an overly flashy mobile game
* an excessive particle effect
* an NFT/crypto-style reveal

The desired feeling is closer to physically opening a cute collectible toy.

All important timing values should be configurable rather than buried throughout the code.

---

# 10. STICKER SYSTEM

All stickers will be transparent PNG files.

They will live in:

/public/stickers/

The sticker system should be data-driven.

Use a configuration structure similar to:

{
id: "sticker-01",
name: "Sticker Name",
file: "/stickers/sticker-01.png",
rarity: "common",
weight: 40
}

Potential properties:

* id
* name
* file
* rarity
* weight

Do not hard-code individual sticker behaviour into the animation.

Adding a new sticker should ideally require only adding the new asset and configuration entry.

---

# 11. RANDOMISATION

The sticker should NOT be selected when the page initially loads.

The sticker should be selected when the user begins opening the blind box.

Initially, all stickers may have equal probability.

The system should support weighted probabilities later.

Example:

Common:
weight 40

Rare:
weight 10

Secret:
weight 2

The weighted randomisation should be handled by a reusable utility function rather than mixed directly into the UI component.

The selected sticker must remain fixed throughout that reveal.

Do not allow accidental double-taps to reroll the sticker.

---

# 12. STICKER REVEAL

The sticker should feel as though it physically comes out of the box.

Preferred behaviour:

* starts inside/below the box
* moves upward
* scales slightly
* optionally rotates subtly
* becomes fully visible
* settles naturally

Avoid simply fading a PNG into the centre of the screen.

The sticker should become the visual focus after the box opens.

Do not distort the original sticker proportions.

---

# 13. RARITY

The system should support rarity categories, for example:

* Common
* Rare
* Secret

However, rarity should not necessarily be displayed before the reveal.

The user should discover the result first.

Do not expose probability percentages unless explicitly requested.

Avoid making the experience feel like gambling.

This is a collectible/creative experience.

---

# 14. RESULT SCREEN

After the sticker is revealed, show:

* sticker artwork
* sticker name
* rarity, if configured
* Save button
* Share button
* Open another box button

The design should remain simple and visually focused on the sticker.

---

# 15. SAVE FUNCTION

The Save button should download the original sticker PNG asset.

Important:

DO NOT screenshot the website.

DO NOT save a screenshot of the Three.js canvas.

The downloaded file should be the original transparent PNG.

Use a sensible filename based on the sticker name.

Example:

sleepy-toffee.png

---

# 16. SHARE FUNCTION

Where supported, use the Web Share API.

Ideally the user should be able to share the actual sticker PNG through the native mobile share sheet.

If file sharing is unsupported:

* provide a graceful fallback
* do not break the experience
* allow the user to save/download the sticker instead

The application should detect browser support rather than assuming the API exists.

---

# 17. RESET / OPEN ANOTHER BOX

After a reveal, the user should be able to select:

"Open another box"

This should:

* reset the box to its closed state
* remove the current sticker
* reset the animation state
* allow another random selection
* avoid a full page reload

The next opening should be treated as a new reveal.

---

# 18. MOBILE UX

Design for touch first.

Important requirements:

* large tap targets
* no hover-dependent interactions
* no horizontal scrolling
* safe-area support
* appropriate use of 100dvh
* responsive canvas
* portrait-first design
* good behaviour on smaller iPhones
* good behaviour on larger phones
* graceful desktop fallback

The website should feel like a small interactive experience rather than a desktop website squeezed onto a phone.

---

# 19. LOADING EXPERIENCE

Because the experience contains a 3D model and image assets, provide a lightweight loading state.

Never show:

* a blank white page
* an unstyled Three.js canvas
* broken model geometry while assets are loading

The loading experience should be minimal and branded.

Once assets are ready, transition naturally into the blind-box screen.

---

# 20. ERROR HANDLING

The application should gracefully handle:

* missing GLB model
* failed texture
* missing sticker PNG
* unsupported Web Share API
* WebGL limitations
* failed asset loading

Do not allow a single missing sticker to crash the entire experience.

Errors should be useful during development but should not expose ugly technical errors to normal users.

---

# 21. ACCESSIBILITY

Even though this is a visual interactive experience, maintain reasonable accessibility.

Consider:

* accessible button labels
* keyboard interaction on desktop
* visible focus states
* readable text
* sufficient contrast
* reduced-motion support where practical

If the user has reduced motion enabled, provide a simplified animation rather than completely breaking the experience.

---

# 22. DESIGN PRINCIPLES

The experience should feel:

* cute
* collectible
* charming
* tactile
* premium but approachable
* playful
* visually intentional

Avoid:

* generic SaaS UI
* excessive gradients
* excessive glassmorphism
* overly complex menus
* unnecessary navigation
* excessive particles
* casino aesthetics
* crypto/NFT aesthetics
* generic AI-generated design language
* excessive animations competing with the sticker

The supplied artwork should always take priority.

---

# 23. DEVELOPMENT APPROACH

IMPORTANT:

Do NOT attempt to build the entire project in one step.

Build incrementally.

Preferred development order:

PHASE 1
Project setup + 3D model rendering

PHASE 2
Responsive mobile layout

PHASE 3
Tap interaction

PHASE 4
Box shake animation

PHASE 5
Lid opening

PHASE 6
Sticker randomisation

PHASE 7
Sticker emergence animation

PHASE 8
Result UI

PHASE 9
Save functionality

PHASE 10
Native share functionality

PHASE 11
Reset / open another box

PHASE 12
Loading and error states

PHASE 13
Performance optimisation

PHASE 14
Production audit

Do not implement later phases until the earlier phase is working correctly.

---

# 24. HOW I WANT YOU TO WORK WITH ME

I am not an expert in every part of the web/Three.js stack.

Explain important technical decisions in straightforward language.

Do not overwhelm me with unnecessary technical detail.

When there are multiple reasonable approaches, recommend one and briefly explain why.

Do not make major architectural decisions silently.

If an implementation choice could significantly affect:

* visual appearance
* performance
* maintainability
* hosting
* mobile compatibility

explain the decision before proceeding.

---

# 25. WHEN DEBUGGING

When something breaks:

1. Identify the likely root cause.
2. Explain the problem briefly.
3. Make the smallest appropriate fix.
4. Avoid unrelated refactoring.
5. Retest the affected functionality.
6. Explain what changed.

Do not rewrite large parts of the project simply because something small is broken.

Preserve working functionality.

---

# 26. CODE QUALITY

Prefer:

* simple code
* readable names
* reusable functions
* reusable components
* clear state management
* comments only where useful
* configurable animation constants
* no unnecessary abstraction

Avoid:

* over-engineering
* unnecessary dependencies
* duplicated logic
* giant components
* hard-coded sticker logic
* hard-coded probabilities scattered across files
* unnecessary backend infrastructure

---

# 27. IMPORTANT RULE

This project is intended to become a real public-facing interactive experience.

Therefore, always think about the actual user journey:

NFC / QR CODE
↓
WEBSITE LOADS
↓
3D BOX APPEARS
↓
TAP
↓
SHAKE
↓
OPEN
↓
RANDOM STICKER
↓
SAVE / SHARE
↓
OPEN ANOTHER

Every technical decision should support that experience.

Do not optimise for developer cleverness at the expense of the user's experience.

---

## 28. CURRENT PROJECT STATUS

Phase: Web application development

Completed:

- [x] Blind-box schematic (kept in `reference/`, not shipped)
- [x] Sticker PNGs (`public/stickers/`)
- [x] 3D blind-box GLB (`public/models/toffee_box.glb`)
- [x] Vite + React + R3F project set up
- [x] GitHub repository
- [x] Phase 1 — 3D box renders, centred, responsive camera, true colours (no tone mapping)
- [x] Phase 2 — responsive mobile layout: 100dvh, safe-area padding, camera fits box width/height at any aspect, "Tap to open" hint (pulse disabled for reduced motion), no horizontal overflow (checked 375x667, 390x844, 430x932, 820x600, 1280x800)

GLB hierarchy: `Box_Root` > `Box_Body`, `Flap_Front`, `Flap_Left`, `Flap_Right`, `Flap_Back`.
Each flap's origin is on its hinge, so it opens by rotating its node.

Known to-dos:

- `sounds/*.MP3` are 4 identical placeholder files; replace before adding sound.
- Asset optimisation (stickers, GLB texture) is deliberately deferred to Phase 13 — do not shrink assets before then.
- Sticker PNGs are 3000x3000 / ~2.5 MB each; make ~1024px WebP copies for on-screen reveal, keep originals for Save/Share.

- [x] Phase 3 — tap interaction: tap the box or the "Tap to open" button (keyboard-accessible) -> stage IDLE->OPENING, locked against double-taps (ref guard in App.jsx), brief press-squish on the box, hint fades. Stages live in `src/config.js`; timing in `TIMING`.
- [x] ErrorBoundary: a browser without WebGL shows a friendly message instead of a blank page (Phase 12 will refine).

- [x] Phase 4 — box shake: tap -> anticipation squish (0.28s) -> shake building 40%->100% (1.2s) -> settle (0.35s) -> pause (0.4s) -> stage SETTLED (~2.23s total). Pure time-based pose in `src/utils/boxMotion.js`, all values in `TIMING` (`src/config.js`). Reduced motion skips the shake (~0.68s). Dev-only: press R to reset to idle while testing (Phase 11 adds the real button).

- [x] Phase 5 — flaps open: after the shake, stage OPENING: front flap (0s) and back flap (0.1s) swing up/out ~118° with a springy overshoot, then side flaps (0.36s/0.42s) follow (the sides sit UNDER the front/back flaps in the model, so opening them earlier clips through). 0.6s reveal pause, then stage OPENED (~3.8s from tap; ~1.8s with reduced motion). Pure functions in `src/utils/boxMotion.js`, values in `TIMING.flaps` etc. A numeric collision check against the real GLB geometry found no flap clipping. Camera eases to a wider/higher "open" framing so the flaps and later the sticker stay on screen (`CAMERA.open` in BoxScene.jsx).

- [x] Phase 6 — stickers: data-driven list in `src/data/stickers.js` (id/name/file/rarity/weight; dev-mode warnings for bad entries), reusable `pickWeighted` in `src/utils/randomSticker.js` (ignores invalid weights, null if nothing pickable). Sticker is picked once at tap time in `startOpening` (App.jsx, guarded by the stage lock), held in `sticker` state until reset, and its PNG starts preloading at the tap. Sticker names "Agent Mode"/"Shrimp Mode" are placeholders derived from file names. Both are weight 10 (equal). Rarity labels in `RARITIES`; not shown yet.

- [x] Phase 7 — sticker emergence: stages now IDLE > SHAKING > OPENING > REVEALING > REVEALED. `StickerReveal.jsx` renders the sticker as a flat 3D card (so the box walls hide it while inside), loads its texture at tap time and uploads it to the GPU early (`gl.initTexture`) to avoid a mid-animation stutter. It starts small (fits the 1.0-wide opening), rises past the rim, then grows/flies to a camera-relative spot (~80% screen width, centre 40% from top) with a small overshoot and gentle rocking; always faces the camera. Sizing/centring uses the sticker's visible artwork bounds (`utils/imageBounds.js`, 128px downscale, alpha>40) because the PNGs have big, uneven transparent margins. Pure timeline in `utils/stickerMotion.js`; timings in `TIMING`, placement in `STICKER_LAYOUT` (`src/config.js`). Once REVEALED the camera drifts to a `revealed` framing so the box slides down and the sticker is the focus. Missing image => skips the animation, no crash (Phase 12 adds the message). ~5.9s tap->REVEALED (~2.9s reduced motion).

Notes for later phases:

- Sticker PNG art has pale/low-contrast text (e.g. "SHRIMP MODE.") — it reads fine on the cream background but is faint over the box art.
- 3000px sticker = ~36MB of GPU texture (plus mipmaps). Fine on desktop; check on a real iPhone and downsize in Phase 13 (originals stay for Save/Share).
- Phase 8 result UI must fit under the sticker (centre ~40% from top); the box is cropped at the bottom of the screen in REVEALED.

- [x] Phase 8 — result UI + visual identity: Pixelify Sans (self-hosted `public/fonts/`, OFL, preloaded; matches the button art) as the global font; "Open Me!" heading (fades on tap); pixel-art buttons from `public/buttons/` via `PixelButton.jsx` (label baked into the image, so `aria-label` carries the text; invisible padding gives 47px+ tap areas). First screen: heading + box + Open button. REVEALED: `RevealResult.jsx` (name, rarity, role=status) + `ActionButtons.jsx` (Save, Share, Open another). Camera `revealed` framing now lifts the box fully out of the bottom of the screen so text sits on a clean background. "Open another" currently calls `resetBox` (instant reset; Phase 11 polishes it) and reuses `open_button.png` until a dedicated `open_another` image is added (`BUTTON_IMAGES.openAnother` in ActionButtons.jsx). Save/Share are rendered but inert until Phases 9/10. `.backdrop` layer + `--backdrop-image` CSS variable are ready for a background picture.

Pending from the user: footer content (About text; GitHub link candidate github.com/alyssapineda/toffee-digital-blind-box), background image, optional `open_another_button.png`.

Notes:

- Agent sticker PNG has faint stray marks near its top corners (in the source art).

- [x] Sticker PNGs renamed to `toffee-<name>-sticker.png` (hyphens) in `public/stickers/`; `src/data/stickers.js` updated.
- [x] Phase 9 — Save: `utils/saveSticker.js` fetches the ORIGINAL PNG (via `getStickerBlob` in `utils/stickerFile.js`, which rejects 404s and HTML-pretending-to-be-PNG, and remembers the blob) and downloads it as `toffee-<name>-sticker.png` (`stickerFileName`, derived from the sticker name). Verified byte-identical to the asset; repeat taps ignored while saving; failure shows a short message. On iPhone Safari this saves to Files/Downloads (not Photos) — Photos comes via the share sheet in Phase 10.

- [x] Phase 10 — Share: `utils/shareSticker.js` (Web Share API with the ORIGINAL PNG as a File) + `hooks/useStickerActions.js` (Save, Share, notice message; busy guard). The file is prefetched when the sticker starts to emerge (REVEALING) and released on reset, so `navigator.share()` is called synchronously inside the tap when the file is ready (iPhone Safari needs this; do NOT add an `await` or state update before it in `share`/`shareSticker`). Outcomes: shared; cancelled (silent); no file-share support or unexpected error => falls back to Save with a short notice; NotAllowedError => "Tap Share again". Tested with a mocked share API (7 scenarios) in desktop Brave — still needs a real-iPhone test.

- [x] Phase 11 — Open another box: stages REVEALED > RESETTING (0.35s: sticker floats up/shrinks/fades, result text fades; flaps close instantly while the box is off-screen) > RETURNING (0.9s: camera glides back so a fresh closed box rises into view) > IDLE (heading + Open button return, focus moves to the Open button for keyboard users). Input is locked throughout (`openAnother` only acts in REVEALED; repeat taps ignored). Sticker state is cleared (texture + downloaded file released) before the next tap picks a new one. Reduced motion: two quick ~0.12s fades. Dev-only R key hard-resets. Shared `utils/motionPreference.js` replaced 3 copy-pasted helpers; `goTo()` in App.jsx is the single stage-setter.
- Bug fixed along the way: the Open button was centred with `transform: translateX(-50%)`, and its `:active` press transform replaced that, so with reduced motion the button jumped sideways on press and the tap was lost. It is now centred with auto margins and the pulse uses the `translate` property. Rule: never position elements with `transform` if they also get a press/hover transform.

- [x] Phase 12 — Loading + error states. Loading: branded "Open Me! / Loading..." screen is plain HTML+inline CSS in `index.html` (shows before any JS arrives; React reuses the same `.boot` markup, then fades it out); `<noscript>` message. Errors (`components/ErrorScreen.jsx`, one friendly message + "Try again" reload button per kind: webgl / load / stickers / context; technical detail only in dev): missing or corrupt GLB and no-WebGL are caught by `ErrorBoundary`; if the GPU drops the 3D view and it doesn't return within 4s, `BoxScene` raises a 'context' error (restore within 4s is handled silently). Sticker images: if one fails to load, `App.handleStickerFailed` remembers the id (session) and quietly picks a different sticker before the user sees anything (`pickRandomSticker(random, excludeIds)`); if all fail => 'stickers' error screen. Slow sticker download: "Loading your sticker..." note fades in after 1s while the open box waits. All verified by an automated failure-injection run (JS delayed, GLB 404/corrupt, WebGL off, one/all sticker images 404, 7s sticker delay, context lost/restored/not restored) plus regression runs of reset/save/share.

Open questions for the user: (1) sound — `sounds/*.MP3` are still 4 identical placeholder files, and sound is not in the 14-phase plan yet; (2) optional "avoid the same sticker twice in a row" rule (only 2 stickers, so repeats are frequent and feel like a bug); (3) footer/About text, background image, `open_another_button.png`.

- [x] Phase 13 — Performance. Measured with a throttled, fresh-cache run of the production build behind a gzip server (Phase 12 vs now): 3G (1.6 Mbps): tap -> sticker on screen 24.6s -> 6.0s, data 3.0MB -> 0.66MB; 4G: 5.4MB -> 3.1MB; box tappable ~3.5s on 3G / ~0.9s on 4G (JS is ~330KB gz of the ~525KB first load).
  - Sticker on-screen copies: `scripts/make-sticker-previews.mjs` (sharp, devDependency; `npm run stickers`, also runs as `prebuild`) writes 1280px q88 WebP copies to `public/stickers/preview/` (~120-135KB vs 2.5MB; GPU ~8MB vs ~46MB). Same shape/margins (only scaled). `StickerReveal` loads the preview and falls back to the original PNG if it is missing. Verified vs the originals as rendered by the browser: mean difference 0.4/255, no colour shift. Save/Share still use the untouched original PNG.
  - IMPORTANT: the sticker PNGs are Display P3 (iCCP + cICP chunks). Do NOT run Save/Share files through a colour-managing tool: sharp/libvips silently converts the pixels (a "lossless" sharp recompress was NOT pixel-identical). A pixel-exact recompress (pngjs) only saves ~17-25%, so the originals are shipped as supplied.
  - Removed `@react-three/drei` (huge dependency tree; used only for useGLTF + ContactShadows): model now loads with `useLoader(GLTFLoader)`, and `components/GroundShadow.jsx` draws the soft floor shadow from a tiny canvas. Bundle ~-8KB gz (the bundle is inherently Three.js + R3F).
  - `index.html` preloads the GLB and the Open button image so they download in parallel with the JS.
  - The 2.5MB original is prefetched (so iPhone Share can open instantly) except on Data Saver / <=3G connections (Chrome/Android only; Safari does not expose this).
  - Left as is on purpose: GLB texture (2048px JPEG, 174KB; downscaling would blur the box art), continuous render loop (nothing animates at idle but the scene is cheap), DPR already capped at 2.
  - Hosting note: static files should be served with long-lived caching (hashed `/assets/*` can be immutable; `/stickers`, `/models`, `/buttons` are not hashed) and gzip/brotli for JS/CSS.

Open questions for the user: Save/Share file weight (see below), sound, avoid-repeat rule, footer/About text, background image, `open_another_button.png`.

Current task:

Phase 14 — Production audit (full pass: accessibility, mobile Safari behaviour, hosting/deploy, security headers, final checklist against this document).

Do not replace or regenerate the supplied assets unless explicitly instructed.
