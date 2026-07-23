import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('[MewoOS] ErrorBoundary caught:', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--color-text-muted)',
          fontSize: 13,
          textAlign: 'center',
          gap: 8,
        }}>
          <span style={{ fontSize: 24 }}>💥</span>
          <span>Something went wrong</span>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: 8,
              padding: '6px 16px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'rgba(232,130,155,0.08)',
              color: 'var(--color-sakura)',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
