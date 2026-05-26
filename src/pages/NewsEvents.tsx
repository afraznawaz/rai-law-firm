import { useState, useEffect } from 'react'

interface NewsItem {
  id: number
  title: string
  type: string
  description: string
  image_url: string
  file_url: string
  file_name: string
  file_type: string
  event_date: string
  location: string
  published: boolean
  created_at: string
}

export default function NewsEvents({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<NewsItem | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState(0)
  const [filter, setFilter] = useState<'all' | 'news' | 'event'>('all')

  useEffect(() => {
    fetch('/api/news-events')
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? items : items.filter(i => i.type === filter)
  const imageItems = filtered.filter(i => i.image_url || i.file_url)

  const openLightbox = (item: NewsItem) => {
    const idx = imageItems.findIndex(i => i.id === item.id)
    setLightboxIdx(idx)
    setLightbox(item)
  }

  const prevImg = () => {
    const newIdx = (lightboxIdx - 1 + imageItems.length) % imageItems.length
    setLightboxIdx(newIdx)
    setLightbox(imageItems[newIdx])
  }

  const nextImg = () => {
    const newIdx = (lightboxIdx + 1) % imageItems.length
    setLightboxIdx(newIdx)
    setLightbox(imageItems[newIdx])
  }

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
                {f === 'all' ? '📋 All' : f === 'news' ? '📸 Certificates & News' : '📅 Events & Activities'}
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
            <div className="ne-gallery">
              {filtered.map(item => (
                <div key={item.id} className="ne-gallery-card" onClick={() => openLightbox(item)}>
                  <div className="ne-gallery-card__img-wrap">
                    <img
                      src={item.image_url || item.file_url}
                      alt={item.title}
                      className="ne-gallery-card__img"
                      loading="lazy"
                      onError={e => { (e.target as HTMLImageElement).src = '/uploads/upload_1.PNG' }}
                    />
                    <div className="ne-gallery-card__overlay">
                      <span className="ne-gallery-card__type">{item.type === 'event' ? '📅 Event' : '📸 Certificate/News'}</span>
                      <span className="ne-gallery-card__zoom">🔍 Click to View</span>
                    </div>
                  </div>
                  <div className="ne-gallery-card__body">
                    <h3 className="ne-gallery-card__title">{item.title}</h3>
                    <div className="ne-gallery-card__meta">
                      {item.event_date && <span>📅 {new Date(item.event_date).toLocaleDateString('en-PK', {day:'numeric', month:'short', year:'numeric'})}</span>}
                      {item.location && <span>📍 {item.location}</span>}
                    </div>
                    {item.description && <p className="ne-gallery-card__desc">{item.description.substring(0, 120)}{item.description.length > 120 ? '...' : ''}</p>}
                    <button className="ne-gallery-card__view">🔍 Click to View Full Image</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="cert-lightbox" onClick={() => setLightbox(null)}>
          <div className="cert-lightbox__inner" onClick={e => e.stopPropagation()}>
            <button className="cert-lightbox__close" onClick={() => setLightbox(null)}>✕</button>
            <img
              src={lightbox.image_url || lightbox.file_url}
              alt={lightbox.title}
              className="cert-lightbox__img"
              onError={e => { (e.target as HTMLImageElement).src = '/uploads/upload_1.PNG' }}
            />
            <div className="cert-lightbox__info">
              <h3>{lightbox.title}</h3>
              <div className="cert-lightbox__meta">
                <span>{lightbox.type === 'event' ? '📅 Event' : '📸 Certificate/News'}</span>
                {lightbox.event_date && <span>📅 {new Date(lightbox.event_date).toLocaleDateString('en-PK', {day:'numeric', month:'long', year:'numeric'})}</span>}
                {lightbox.location && <span>📍 {lightbox.location}</span>}
              </div>
              {lightbox.description && <p className="cert-lightbox__desc">{lightbox.description}</p>}
            </div>
            <button className="cert-lightbox__nav cert-lightbox__nav--prev" onClick={prevImg}>‹</button>
            <button className="cert-lightbox__nav cert-lightbox__nav--next" onClick={nextImg}>›</button>
            <div className="cert-lightbox__counter">{lightboxIdx + 1} / {imageItems.length}</div>
          </div>
        </div>
      )}

      {/* WhatsApp Float */}
      <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-wa-float">
        <svg viewBox="0 0 24 24" fill="currentColor" className="ra-wa-float__icon">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="ra-wa-float__text">Chat with Us</span>
      </a>
    </div>
  )
}
