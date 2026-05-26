import { useState, useEffect } from 'react'

interface NewsItem {
  id: number
  title: string
  type: 'news' | 'event'
  description: string
  content: string
  event_date: string
  location: string
  file_url: string
  file_name: string
  file_type: string
  published: boolean
  created_at: string
}

export default function NewsEvents({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<NewsItem | null>(null)
  const [filter, setFilter] = useState<'all' | 'news' | 'event'>('all')

  useEffect(() => {
    fetch('/api/news-events')
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter)
  const imageItems = filtered.filter(i => i.file_url && ['jpg','jpeg','png','gif','webp'].includes(i.file_type?.toLowerCase()))
  const nonImageItems = filtered.filter(i => !i.file_url || !['jpg','jpeg','png','gif','webp'].includes(i.file_type?.toLowerCase()))

  return (
    <div className="cert-page">
      <div className="cert-header">
        <div className="ra-container">
          <button className="cert-back" onClick={onBack}>← Back to Home</button>
          <div className="cert-header__content">
            <div className="ra-section__label">Latest Updates</div>
            <h1 className="cert-header__title">News & Events</h1>
            <div className="ra-divider ra-divider--center" />
            <p className="cert-header__sub">Events, seminars, legal proceedings and activities of Rai & Associates Law Firm</p>
          </div>
        </div>
      </div>

      <div className="cert-body">
        <div className="ra-container">

          {/* Filter Tabs */}
          <div className="ne-filters">
            {(['all','news','event'] as const).map(f => (
              <button key={f} className={`ne-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? '📋 All' : f === 'news' ? '📰 News' : '📅 Events'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="ne-loading">
              {[1,2,3,4,5,6].map(i => <div key={i} className="ne-skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="ne-empty">
              <div className="ne-empty__icon">📰</div>
              <p>No {filter === 'all' ? 'news or events' : filter} yet. Check back soon!</p>
            </div>
          ) : (
            <>
              {/* Image Gallery Grid */}
              {imageItems.length > 0 && (
                <div className="ne-gallery">
                  {imageItems.map(item => (
                    <div key={item.id} className="ne-gallery-card" onClick={() => setLightbox(item)}>
                      <div className="ne-gallery-card__img-wrap">
                        <img
                          src={item.file_url}
                          alt={item.title}
                          className="ne-gallery-card__img"
                          loading="lazy"
                        />
                        <div className="ne-gallery-card__overlay">
                          <span className="ne-gallery-card__type">{item.type === 'event' ? '📅 Event' : '📰 News'}</span>
                          <span className="ne-gallery-card__zoom">🔍</span>
                        </div>
                      </div>
                      <div className="ne-gallery-card__body">
                        <h3 className="ne-gallery-card__title">{item.title}</h3>
                        <div className="ne-gallery-card__meta">
                          {item.event_date && <span>📅 {item.event_date}</span>}
                          {item.location && <span>📍 {item.location}</span>}
                        </div>
                        {item.description && <p className="ne-gallery-card__desc">{item.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Text/PDF items */}
              {nonImageItems.length > 0 && (
                <div className="ne-list">
                  {nonImageItems.map(item => (
                    <div key={item.id} className="ne-list-card">
                      <div className="ne-list-card__icon">{item.type === 'event' ? '📅' : '📰'}</div>
                      <div className="ne-list-card__body">
                        <div className="ne-list-card__tag">{item.type === 'event' ? 'Event' : 'News'}</div>
                        <h3 className="ne-list-card__title">{item.title}</h3>
                        <div className="ne-list-card__meta">
                          {item.event_date && <span>📅 {item.event_date}</span>}
                          {item.location && <span>📍 {item.location}</span>}
                        </div>
                        {item.description && <p className="ne-list-card__desc">{item.description}</p>}
                        {item.content && <p className="ne-list-card__content">{item.content}</p>}
                        {item.file_url && (
                          <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="ne-list-card__file">
                            {item.file_type === 'pdf' ? '📄' : '📝'} {item.file_name}
                          </a>
                        )}
                      </div>
                      <div className="ne-list-card__date">
                        {new Date(item.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="cert-lightbox" onClick={() => setLightbox(null)}>
          <div className="cert-lightbox__inner" onClick={e => e.stopPropagation()}>
            <button className="cert-lightbox__close" onClick={() => setLightbox(null)}>✕</button>
            <img src={lightbox.file_url} alt={lightbox.title} className="cert-lightbox__img" />
            <div className="cert-lightbox__info">
              <h3>{lightbox.title}</h3>
              <p>
                {lightbox.type === 'event' ? '📅 Event' : '📰 News'}
                {lightbox.event_date && ` · ${lightbox.event_date}`}
                {lightbox.location && ` · 📍 ${lightbox.location}`}
              </p>
              {lightbox.description && <p style={{marginTop:'8px', opacity:0.8}}>{lightbox.description}</p>}
            </div>
            {/* Prev/Next */}
            <button className="cert-lightbox__nav cert-lightbox__nav--prev"
              onClick={() => {
                const idx = imageItems.findIndex(i => i.id === lightbox.id)
                setLightbox(imageItems[(idx - 1 + imageItems.length) % imageItems.length])
              }}>‹</button>
            <button className="cert-lightbox__nav cert-lightbox__nav--next"
              onClick={() => {
                const idx = imageItems.findIndex(i => i.id === lightbox.id)
                setLightbox(imageItems[(idx + 1) % imageItems.length])
              }}>›</button>
          </div>
        </div>
      )}
    </div>
  )
}
