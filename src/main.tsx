import { StrictMode, lazy, Suspense, Component, ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { registerSW, initPWA } from './pwa'

// Register service worker & init PWA install prompt
registerSW()
initPWA()

// ── Global Error Boundary ─────────────────────────────────────────────────────
class GlobalErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    console.error('[GlobalErrorBoundary] Caught error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[GlobalErrorBoundary] Error details:', error)
    console.error('[GlobalErrorBoundary] Component stack:', info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      const err = this.state.error as Error | null
      return (
        <div style={{
          minHeight: '100vh', background: '#0d3d1e',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', fontFamily: 'sans-serif'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '40px',
            maxWidth: '600px', width: '100%', textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ color: '#0d3d1e', marginBottom: '12px', fontFamily: 'Georgia,serif' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#666', marginBottom: '16px', fontSize: '0.9rem' }}>
              An error occurred while loading the page. Please try refreshing.
            </p>
            {err && (
              <details style={{
                background: '#f5f5f0', borderRadius: '8px', padding: '12px 16px',
                marginBottom: '20px', textAlign: 'left'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#c00', fontSize: '0.85rem' }}>
                  Error Details (click to expand)
                </summary>
                <pre style={{
                  marginTop: '10px', fontSize: '0.78rem', color: '#333',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                }}>
                  {err.message}{'\n\n'}{err.stack}
                </pre>
              </details>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 24px', background: '#0d3d1e', color: 'white',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.9rem'
                }}
              >
                🔄 Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{
                  padding: '10px 24px', background: '#c9a84c', color: '#0d3d1e',
                  border: 'none', borderRadius: '6px', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.9rem'
                }}
              >
                ↩ Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Loading Spinner ───────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh', background: '#0d3d1e',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: '16px'
  }}>
    <img
      src="/uploads/upload_1.PNG"
      alt="RAI & Associates"
      width="80" height="80"
      style={{ borderRadius: '8px', objectFit: 'contain' }}
    />
    <div style={{
      width: '40px', height: '40px',
      border: '3px solid rgba(201,168,76,0.3)',
      borderTop: '3px solid #c9a84c',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
)

// ── App (lazy) ────────────────────────────────────────────────────────────────
const App = lazy(() =>
  import('./App').catch(err => {
    console.error('[App] Failed to load App module:', err)
    throw err
  })
)

// ── Mount ─────────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <App />
      </Suspense>
    </GlobalErrorBoundary>
  </StrictMode>,
)
