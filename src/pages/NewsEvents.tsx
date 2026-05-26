import { useState, useEffect, Component, ReactNode } from 'react'

class ErrorBoundary extends Component<{ children: ReactNode; name: string }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error } }
  componentDidCatch(error: Error) { console.error('[NewsEvents]', error.message) }
  render() {
    if (this.state.hasError) {
      const err = this.state.error as Error | null
      return <div style={{ padding: '80px 24px', textAlign: 'center' }}><div style={{ fontSize: '3rem' }}>⚠️</div><h2>News page crashed</h2><p>{err?.message}</p><button onClick={() => this.setState({ hasError: false, error: null })} style={{ padding: '10px 24px', background: '#0d3d1e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Try Again</button></div>
    }
    return this.props.children
  }
}

interface NewsItem { id: number; title: string; description: string; image_url: string; file_url: string; file_type: string; event_date: string; published: boolean; created_at: string }
interface Props { onBack: () => void }

function NewsEventsInner({ onBack }: Props) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<NewsItem | null>(null)

  const load = () => {
    setLoading(true); setError(null)
    fetch('/api/news')
      .then(async r => {
        const ct = r.headers.get('content-type') || ''
        if (!r.ok) throw new Error(`API returned ${r.status}`)
        if (!ct.includes('application/json')) {
          const txt = await r.text()
          console.error('Expected JSON, got:', txt.substring(0, 200))
          throw new Error('Server returned non-JSON response')
        }
        return r.json()
      })
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(err => { setError(err.message); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  if (selected) {
    return (
      <div className="ne-detail">
        <button className="ne-back" onClick={() => setSelected(null)}>← Back to News & Events</button>
        <div className="ne-detail__wrap">
          <div className="ne-detail__img">
            {selected.image_url 
              ? <img src={selected.image_url} alt={selected.title} onError={e => { const t = e.target as HTMLImageElement; t.style.display='none'; t.nextElementSibling?.setAttribute('style','display:flex') }} />
              : null}
            <div className="ne-detail__img-placeholder" style={{display: selected.image_url ? 'none' : 'flex'}}>📰<span>{selected.title}</span></div>
          </div>
          <div className="ne-detail__info">
            <div className="ne-detail__date">📅 {selected.event_date}</div>
            <h1 className="ne-detail__title">{selected.title}</h1>
            <p className="ne-detail__desc">{selected.description}</p>
            {selected.file_url && selected.file_url !== selected.image_url && <a href={selected.file_url} target="_blank" rel="noopener noreferrer" className="ne-detail__file">{selected.file_type === 'pdf' ? '📄 View Document' : '🖼️ View Full Image'}</a>}
            <div className="ne-detail__cta"><h3>Want to Know More?</h3><a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ne-detail__wa">💬 WhatsApp Us</a></div>
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
      {loading ? <div className="ne-grid">{[1,2,3,4,5,6].map(i => <div key={i} className="ne-skeleton" />)}</div>
        : error ? <div className="ne-empty"><div style={{ fontSize: '3rem' }}>⚠️</div><p style={{ fontWeight: 700, color: '#c00' }}>Error: {error}</p><button className="ne-retry" onClick={load}>🔄 Retry</button></div>
        : items.length === 0 ? <div className="ne-empty"><div style={{ fontSize: '3rem' }}>📰</div><p>No news or events yet. Check back soon!</p></div>
        : <div className="ne-grid">{items.map(item => (
          <div key={item.id} className="ne-card" onClick={() => setSelected(item)}>
            <div className="ne-card__img">
              {item.image_url 
              ? <img src={item.image_url} alt={item.title} loading="lazy" onError={e => { const t = e.target as HTMLImageElement; t.style.display='none'; t.parentElement!.querySelector('.ne-card__img-placeholder')?.setAttribute('style','display:flex') }} />
              : null}
            <div className="ne-card__img-placeholder" style={{display: item.image_url ? 'none' : 'flex'}}>📰</div>
              <div className="ne-card__overlay"><span className="ne-card__view">Click to View Details →</span></div>
            </div>
            <div className="ne-card__body">
              <div className="ne-card__date">📅 {item.event_date}</div>
              <h3 className="ne-card__title">{item.title}</h3>
              <p className="ne-card__desc">{item.description?.substring(0, 100)}...</p>
            </div>
          </div>
        ))}</div>}
    </div>
  )
}

export default function NewsEvents({ onBack }: Props) {
  return <ErrorBoundary name="NewsEvents"><NewsEventsInner onBack={onBack} /></ErrorBoundary>
}
