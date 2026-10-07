import { useState } from 'react'
import BoxScene from './components/BoxScene.jsx'

export default function App() {
  const [ready, setReady] = useState(false)

  return (
    <main className="app">
      <BoxScene onReady={() => setReady(true)} />
      {!ready && <div className="loading" aria-live="polite">Loading…</div>}
    </main>
  )
}
