import { useState, useEffect } from 'react'

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

export default function NewsEvents({ onBack }: Props) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<NewsItem | null>(null)

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (selected) {
    return (
      <div className="ne-detail">
        <button className="ne-back" onClick={() => setSelected(null)}>← Back to News & Events</button>
        <div className="ne-detail__wrap">
          <div className="ne-detail__img">
            <img src={selected.image_url} alt={selected.title} />
          </div>
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
          {[1,2,3,4,5,6].map(i => <div key={i} className="ne-skeleton" />)}
        </div>
      ) : (
        <div className="ne-grid">
          {items.map(item => (
            <div key={item.id} className="ne-card" onClick={() => setSelected(item)}>
              <div className="ne-card__img">
                <img src={item.image_url} alt={item.title} loading="lazy" />
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
