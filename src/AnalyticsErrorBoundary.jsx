import { Component } from 'react'

export default class AnalyticsErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[Analytics dashboard render error]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="analytics-dashboard" role="alert">
          <h2>Analytics temporarily unavailable</h2>
          <p>
            The analytics dashboard encountered an error.
            Your profile editor and administrator session are still available.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
          >
            Try analytics again
          </button>
        </section>
      )
    }

    return this.props.children
  }
}
