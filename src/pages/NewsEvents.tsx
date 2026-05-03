import { useState, useEffect, Component, ReactNode } from 'react'

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component<
  { children: ReactNode; name: string },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    console.error('[NewsEvents ErrorBoundary]', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[NewsEvents] componentDidCatch:', error.message)
    console.error('[NewsEvents] stack:', info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      const err = this.state.error as Error | null
      return (
        <div style={{ padding: '80px 24px', textAlign: 'center', background: '#f8f5ef', minHeight: '60vh' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ color: '#0d3d1e', marginBottom: '12px' }}>News page crashed</h2>
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

interface NewsItem {
  id: number
  title: string
  description: string
  image_url: string
  file_url: string
  file_type: string
  event_date: string
  published: boolean
  created_at: string
}

interface Props {
  onBack: () => void
}

function NewsEventsInner({ onBack }: Props) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<NewsItem | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    console.log('[NewsEvents] Fetching /api/news ...')
    fetch('/api/news')
      .then(r => {
        console.log('[NewsEvents] Response status:', r.status)
        if (!r.ok) throw new Error(`API returned ${r.status}`)
        return r.json()
      })
      .then(d => {
        console.log('[NewsEvents] Data received:', d)
        setItems(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(err => {
        console.error('[NewsEvents] Fetch error:', err)
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => { load() }, [])

  if (selected) {
    return (
      <div className="ne-detail">
        <button className="ne-back" onClick={() => setSelected(null)}>← Back to News & Events</button>
        <div className="ne-detail__wrap">
          {selected.image_url && (
            <div className="ne-detail__img">
              <img src={selected.image_url} alt={selected.title}
                onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none' }} />
            </div>
          )}
          <div className="ne-detail__info">
            <div className="ne-detail__date">📅 {selected.event_date}</div>
            <h1 className="ne-detail__title">{selected.title}</h1>
            <p className="ne-detail__desc">{selected.description}</p>
            {selected.file_url && selected.file_url !== selected.image_url && (
              <a href={selected.file_url} target="_blank" rel="noopener noreferrer" className="ne-detail__file">
                {selected.file_type === 'pdf' ? '📄 View Document' : '🖼️ View Full Image'}
              </a>
            )}
            <div className="ne-detail__cta">
              <h3>Want to Know More?</h3>
              <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ne-detail__wa">💬 WhatsApp Us</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ne-page">
      <div className="ne-header">
        <button className="ne-back" onClick={onBack}>← Back to Website</button>
        <div className="ne-header__text">
          <div className="ne-header__label">Latest Updates</div>
          <h1 className="ne-header__title">News & Events</h1>
          <p className="ne-header__sub">Stay updated with the latest activities and achievements of Rai & Associates</p>
        </div>
      </div>

      {loading ? (
        <div className="ne-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="ne-skeleton" />)}
        </div>
      ) : error ? (
        <div className="ne-empty">
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⚠️</div>
          <p style={{ fontWeight: 700, color: '#c00', marginBottom: '8px' }}>Error loading news</p>
          <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '16px' }}>{error}</p>
          <button className="ne-retry" onClick={load}>🔄 Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className="ne-empty">
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📰</div>
          <p>No news or events yet. Check back soon!</p>
        </div>
      ) : (
        <div className="ne-grid">
          {items.map(item => (
            <div key={item.id} className="ne-card" onClick={() => setSelected(item)}>
              <div className="ne-card__img">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} loading="lazy"
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none'
                      const parent = (e.target as HTMLImageElement).parentElement
                      if (parent) parent.style.background = 'linear-gradient(135deg,#0d3d1e,#155a2e)'
                    }} />
                ) : (
                  <div className="ne-card__img-placeholder">📰</div>
                )}
                <div className="ne-card__overlay">
                  <span className="ne-card__view">Click to View Details →</span>
                </div>
              </div>
              <div className="ne-card__body">
                <div className="ne-card__date">📅 {item.event_date}</div>
                <h3 className="ne-card__title">{item.title}</h3>
                <p className="ne-card__desc">{item.description?.substring(0, 100)}...</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function NewsEvents({ onBack }: Props) {
  return (
    <ErrorBoundary name="NewsEvents">
      <NewsEventsInner onBack={onBack} />
    </ErrorBoundary>
  )
}
