import { Component } from 'react'

// Catches crashes (most commonly: the browser can't create WebGL) so the
// user sees a friendly message instead of a blank page.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error('Blind box failed to start:', error)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="fallback" role="alert">
        <h1>Oops, the box won’t open</h1>
        <p>Your browser couldn’t start the 3D view. Try reloading, or opening this page in another browser.</p>
        {/* Technical detail is only shown while developing. */}
        {import.meta.env.DEV && <pre>{String(error.message || error)}</pre>}
      </div>
    )
  }
}
