const MESSAGES = {
  webgl: {
    title: 'The box can’t open here',
    text: 'Your browser couldn’t start the 3D view. Try another browser (like Safari or Chrome), or check that graphics acceleration is turned on.',
  },
  load: {
    title: 'The box didn’t load',
    text: 'Something went wrong while loading. Check your internet connection and try again.',
  },
  stickers: {
    title: 'The stickers didn’t load',
    text: 'We couldn’t load the stickers. Check your internet connection and try again.',
  },
  context: {
    title: 'The 3D view stopped',
    text: 'Your phone paused the 3D view. Reload to carry on opening boxes.',
  },
}

// A friendly full-screen message with a reload button. `kind` picks the wording;
// `detail` is the technical error, only shown while developing.
export default function ErrorScreen({ kind = 'load', detail }) {
  const { title, text } = MESSAGES[kind] ?? MESSAGES.load
  return (
    <div className="fallback" role="alert">
      <h1>{title}</h1>
      <p>{text}</p>
      <button type="button" className="fallback-button" onClick={() => window.location.reload()}>
        Try again
      </button>
      {import.meta.env.DEV && detail && <pre>{String(detail)}</pre>}
    </div>
  )
}

// Decides which message fits an error thrown while starting up.
export function kindOfError(error) {
  return /webgl/i.test(String(error?.message ?? error)) ? 'webgl' : 'load'
}
