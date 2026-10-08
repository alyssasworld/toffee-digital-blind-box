// The backgrounds a visitor can choose from. Adding one = drop the picture into /public/background/
// and add an entry here.
//
//   color:    the picture's average colour. It is the page colour while the picture loads, and the
//             browser bar colour on phones.
//   position: which part of the picture stays in view when the screen is a different shape.
//             The picture always fills the screen ("cover"), so a portrait picture on a wide
//             screen shows a horizontal slice of it: this chooses the slice (vertical %).
export const BACKGROUNDS = [
  {
    id: 'sky',
    name: 'Sky',
    file: '/background/sky-pixel-bg.png',
    color: '#0b82e8',
    position: 'center',
  },
  {
    id: 'room',
    name: 'Cozy room',
    file: '/background/office_room_pixel.png',
    color: '#b8845f',
    position: 'center 35%', // on wide screens keep the glowing lamp area in view
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    file: '/background/galaxy_pixel.png',
    color: '#264b61',
    position: 'center', // the bright core is in the middle, so a centred crop keeps it on phones too
  },
  {
    id: 'meadow',
    name: 'Meadow',
    file: '/background/green_meadow_pixel.png',
    color: '#749506',
    position: 'center',
  },
]

export const DEFAULT_BACKGROUND_ID = 'sky'

export function findBackground(id) {
  return BACKGROUNDS.find((background) => background.id === id) ?? BACKGROUNDS[0]
}
