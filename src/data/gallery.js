// The swipe gallery shown in the About panel. Edit freely; one entry per slide.
//   type: 'image' | 'video'
//   src:  the web-sized copy in public/gallery/web/ (made by `npm run gallery` for photos;
//         videos are converted by hand to H.264 .mp4 because iPhone .MOV files are huge and don't play in Chrome)
//   poster: (video only) still frame shown before play
//   alt:  what the picture shows, for screen readers
export const GALLERY = [
  { type: 'image', src: '/gallery/web/img_8554.jpg', alt: 'Toffee, a tortoiseshell cat, asleep on a round brown cushion with her paws stretched out.' },
  { type: 'video', src: '/gallery/web/video-1.mp4', poster: '/gallery/web/video-1-poster.jpg', alt: 'Video of Toffee lying on a blanket, looking at the camera.' },
  { type: 'image', src: '/gallery/web/img_8702.jpg', alt: 'Toffee looking up at the camera from Alyssa’s lap.' },
]
