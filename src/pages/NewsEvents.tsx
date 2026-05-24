import { useState, useEffect } from 'react'

interface NewsItem { id: number; title: string; category: string; summary: string; content: string; date: string; created_at: string }

export default function NewsEvents({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<NewsItem|null>(null)

  useEffect(() => {
    fetch('/api/news-events').then(r => r.json()).then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (selected) {
    return (
      <div className="blog-post-page">
        <button className="blog-post-back" onClick={() => setSelected(null)}>← Back to News & Events</button>
        <div className="blog-post-wrap">
          <div className="blog-post-cat">{selected.category}</div>
          <h1 className="blog-post-title">{selected.title}</h1>
          <div className="blog-post-meta"><span>📅 {new Date(selected.date || selected.created_at).toLocaleDateString('en-PK', { day:'numeric', month:'long', year:'numeric' })}</span></div>
          <div className="blog-post-body"><p>{selected.content || selected.summary}</p></div>
          <div className="blog-post-cta"><h3>Need Legal Advice?</h3><p>Contact Rai & Associates for a free consultation.</p><a href="tel:+923044840937" className="blog-post-cta-btn">📞 Call: +92 304 484 0937</a></div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#f8f5ef' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
        <button className="blog-post-back" onClick={onBack}>← Back to Home</button>
        <h1 style={{ fontFamily: 'Playfair Display,serif', fontSize: '2rem', color: '#0d3d1e', margin: '24px 0 8px' }}>News & Events</h1>
        <p style={{ color: '#777', marginBottom: '32px' }}>Latest legal news and firm updates</p>
        {loading ? <div>Loading...</div> : items.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px', color:'#777' }}>
            <div style={{ fontSize:'3rem', marginBottom:'16px' }}>📰</div>
            <p>News and events will appear here once added.</p>
          </div>
        ) : (
          <div className="ra-blog__grid">
            {items.map(item => (
              <div key={item.id} className="ra-blog-card" onClick={() => setSelected(item)}>
                <div className="ra-blog-card__cat">{item.category}</div>
                <h3 className="ra-blog-card__title">{item.title}</h3>
                <p className="ra-blog-card__excerpt">{item.summary}</p>
                <div className="ra-blog-card__footer"><span>📅 {new Date(item.date || item.created_at).toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' })}</span></div>
                <button className="ra-blog-card__read">Read More →</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
