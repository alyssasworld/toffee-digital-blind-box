import { Component } from 'react'
import ErrorScreen, { kindOfError } from './ErrorScreen.jsx'

// Catches crashes (a browser without WebGL, a missing or broken 3D model...) so the
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
    return <ErrorScreen kind={kindOfError(error)} detail={error.message || error} />
  }
}
