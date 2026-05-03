import { useState, useEffect, Component, ReactNode } from 'react'

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component<
  { children: ReactNode; name: string },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    console.error('[CertificatesPage ErrorBoundary]', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[CertificatesPage] componentDidCatch:', error.message)
    console.error('[CertificatesPage] stack:', info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      const err = this.state.error as Error | null
      return (
        <div style={{ padding: '80px 24px', textAlign: 'center', background: '#f8f5ef', minHeight: '60vh' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#0d3d1e', marginBottom: '12px' }}>Certificates page crashed</h2>
          <p style={{ color: '#666', marginBottom: '16px' }}>Error: {err?.message || 'Unknown error'}</p>
          {err?.stack && (
            <details style={{ background: '#eee', padding: '12px', borderRadius: '8px', textAlign: 'left', maxWidth: '600px', margin: '0 auto 20px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#c00' }}>Stack Trace</summary>
              <pre style={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap', marginTop: '8px' }}>{err.stack}</pre>
            </details>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ padding: '10px 24px', background: '#0d3d1e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
          >
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

interface Cert {
  id: number
  title: string
  description: string
  file_url: string
  issued_by: string
  issued_date: string
  category: string
  created_at: string
}

interface Props {
  onBack: () => void
}

function CertificatesPageInner({ onBack }: Props) {
  const [items, setItems] = useState<Cert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Cert | null>(null)

  const isImage = (url: string) => url && /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
  const isPdf = (url: string) => url && /\.pdf$/i.test(url)

  const load = () => {
    setLoading(true)
    setError(null)
    console.log('[CertificatesPage] Fetching /api/certificates ...')
    fetch('/api/certificates')
      .then(r => {
        console.log('[CertificatesPage] Response status:', r.status)
        if (!r.ok) throw new Error(`API returned ${r.status}`)
        return r.json()
      })
      .then(d => {
        console.log('[CertificatesPage] Data received:', d)
        setItems(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(err => {
        console.error('[CertificatesPage] Fetch error:', err)
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [])

  if (selected) {
    return (
      <div className="cert-detail">
        <button className="ne-back" onClick={() => setSelected(null)}>← Back to Certificates</button>
        <div className="cert-detail__wrap">
          {selected.file_url && isImage(selected.file_url) ? (
            <div className="cert-detail__img">
              <img src={selected.file_url} alt={selected.title}
                onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }} />
            </div>
          ) : selected.file_url && isPdf(selected.file_url) ? (
            <div className="cert-detail__pdf">
              <iframe src={selected.file_url} title={selected.title} />
            </div>
          ) : (
            <div className="cert-detail__placeholder">🏅</div>
          )}
          <div className="cert-detail__info">
            {selected.category && <div className="cert-detail__cat">{selected.category}</div>}
            <h1 className="cert-detail__title">{selected.title}</h1>
            {selected.issued_by && <div className="cert-detail__issuer">🏛️ {selected.issued_by}</div>}
            {selected.issued_date && <div className="cert-detail__date">📅 Issued: {selected.issued_date}</div>}
            <p className="cert-detail__desc">{selected.description}</p>
            {selected.file_url && (
              <a href={selected.file_url} target="_blank" rel="noopener noreferrer" className="cert-detail__download">
                {isPdf(selected.file_url) ? '📄 Open PDF' : '🖼️ View Full Certificate'}
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cert-page">
      <div className="ne-header">
        <button className="ne-back" onClick={onBack}>← Back to Website</button>
        <div className="ne-header__text">
          <div className="ne-header__label">Professional Credentials</div>
          <h1 className="ne-header__title">Certificates & Memberships</h1>
          <p className="ne-header__sub">Official certifications and bar memberships of Rai Afraz (Advocate)</p>
        </div>
      </div>

      {loading ? (
        <div className="cert-grid" style={{ padding: '36px 32px', maxWidth: '1200px', margin: '0 auto' }}>
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="ne-skeleton" />)}
        </div>
      ) : error ? (
        <div className="ne-empty">
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</div>
          <p style={{ fontWeight: 700, color: '#c00', marginBottom: '8px' }}>Error loading certificates</p>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '16px' }}>{error}</p>
          <button className="ne-retry" onClick={load}>🔄 Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="ne-empty">
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎖️</div>
          <p>No certificates added yet.</p>
          <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '8px' }}>
            Go to <strong>/admin</strong> to add certificates.
          </p>
        </div>
      ) : (
        <div className="cert-grid">
          {items.map(item => (
            <div key={item.id} className="cert-card" onClick={() => setSelected(item)}>
              <div className="cert-card__img">
                {item.file_url && isImage(item.file_url) ? (
                  <img src={item.file_url} alt={item.title} loading="lazy"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }} />
                ) : item.file_url && isPdf(item.file_url) ? (
                  <div className="cert-card__pdf-icon">📄<span>PDF</span></div>
                ) : (
                  <div className="cert-card__pdf-icon">🏅</div>
                )}
                <div className="ne-card__overlay">
                  <span className="ne-card__view">Click to View →</span>
                </div>
              </div>
              <div className="cert-card__body">
                {item.category && <div className="cert-card__cat">{item.category}</div>}
                <h3 className="cert-card__title">{item.title}</h3>
                {item.issued_by && <div className="cert-card__issuer">{item.issued_by}</div>}
                {item.issued_date && <div className="cert-card__date">📅 {item.issued_date}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function CertificatesPage({ onBack }: Props) {
  return (
    <ErrorBoundary name="CertificatesPage">
      <CertificatesPageInner onBack={onBack} />
    </ErrorBoundary>
  )
}
