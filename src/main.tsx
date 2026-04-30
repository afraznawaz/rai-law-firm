import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Lazy load the main app to reduce initial bundle
const App = lazy(() => import('./App'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: '#0d3d1e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <img
          src="/uploads/upload_1.PNG"
          alt="RAI & Associates"
          width="80"
          height="80"
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
    }>
      <App />
    </Suspense>
  </StrictMode>,
)
