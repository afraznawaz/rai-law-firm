import { useState, useEffect } from 'react'

const SOCIAL_LINKS = [
  { icon: '📘', label: 'Facebook', href: 'https://www.facebook.com/61577203114572', color: '#1877f2' },
  { icon: '📘', label: 'Facebook', href: 'https://www.facebook.com/raiafraz10', color: '#1877f2' },
  { icon: '🎵', label: 'TikTok', href: 'https://www.tiktok.com/@rai_associates', color: '#010101' },
  { icon: '📸', label: 'Instagram', href: 'https://www.instagram.com/rai_associates10', color: '#e1306c' },
  { icon: '▶️', label: 'YouTube', href: 'https://www.youtube.com/@raiandassociates', color: '#ff0000' },
  { icon: '💬', label: 'WhatsApp', href: 'https://wa.me/923164371096', color: '#25d366' },
]

const CATEGORY_ICONS: Record<string, string> = {
  'Constitutional Law': '🏛️',
  'Criminal Law': '🔏',
  'Civil Litigation': '⚖️',
  'Family Law': '👨‍👩‍👧',
  'Tax Law': '📊',
  'Revenue Law': '🏠',
  'Cybercrime & FIA': '💻',
  'Corporate Law': '🏢',
  'Intellectual Property': '™️',
  'General Legal Advice': '📝',
  'Environmental Law': '🌿',
}

function renderContent(text: string) {
  if (!text) return ''
  return text.split('\n\n').map((para) => {
    const html = para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
    return `<p>${html}</p>`
  }).join('')
}

interface Item {
  id: number
  title: string
  category: string
  description: string
  content?: string
  image_url: string
  views: number
  created_at: string
  comments?: Comment[]
}

interface Comment {
  id: number
  user_name: string
  comment: string
  created_at: string
}

export default function ELibrary({ onBack }: { onBack?: () => void }) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState<Item | null>(null)
  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commentSent, setCommentSent] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    fetch('/api/elibrary')
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const openItem = async (item: Item) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    const res = await fetch(`/api/elibrary?id=${item.id}`)
    const data = await res.json()
    setSelected(data)
    // Update view count locally
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, views: (i.views || 0) + 1 } : i))
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setCommentLoading(true)
    try {
      await fetch('/api/elibrary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: selected.id, user_name: commentName, comment: commentText })
      })
      setCommentSent(true)
      setCommentName('')
      setCommentText('')
      // Refresh comments
      const res = await fetch(`/api/elibrary?id=${selected.id}`)
      const data = await res.json()
      setSelected(data)
      setTimeout(() => setCommentSent(false), 3000)
    } catch (e) { console.error(e) }
    finally { setCommentLoading(false) }
  }

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))]
  const filtered = filter === 'All' ? items : items.filter(i => i.category === filter)

  // ===== DETAIL VIEW =====
  if (selected) {
    return (
      <div className="elib-detail">
        <button className="elib-detail__back" onClick={() => setSelected(null)}>← Back to E-Library</button>
        <div className="elib-detail__wrap">
          {/* Hero Image */}
          {selected.image_url && (
            <div className="elib-detail__img-wrap">
              <img src={selected.image_url} alt={selected.title} className="elib-detail__img" />
              <div className="elib-detail__img-overlay">
                <span className="elib-detail__cat">{CATEGORY_ICONS[selected.category] || '📖'} {selected.category}</span>
              </div>
            </div>
          )}
          <div className="elib-detail__body">
            <h1 className="elib-detail__title">{selected.title}</h1>
            <div className="elib-detail__meta">
              <span>👁️ {selected.views?.toLocaleString()} views</span>
              <span>📅 {new Date(selected.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span>✍️ Rai Afraz (Advocate)</span>
            </div>
            <div className="elib-detail__content"
              dangerouslySetInnerHTML={{ __html: renderContent(selected.content || '') }} />

            {/* CTA */}
            <div className="elib-detail__cta">
              <h3>Need Legal Help?</h3>
              <p>Contact Rai & Associates for expert legal advice.</p>
              <div className="elib-detail__cta-btns">
                <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="elib-cta-btn elib-cta-btn--wa">💬 WhatsApp</a>
                <a href="tel:+923044840937" className="elib-cta-btn elib-cta-btn--call">📞 Call Now</a>
              </div>
            </div>

            {/* Social Follow */}
            <div className="elib-detail__social">
              <h4>📲 Follow Us on Social Media</h4>
              <div className="elib-detail__social-links">
                {SOCIAL_LINKS.map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="elib-social-btn"
                    style={{ '--sc': s.color } as React.CSSProperties}>
                    <span>{s.icon}</span><span>{s.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="elib-detail__comments">
              <h4 className="elib-comments__title">💬 Comments ({selected.comments?.length || 0})</h4>
              {selected.comments && selected.comments.length > 0 ? (
                <div className="elib-comments__list">
                  {selected.comments.map(c => (
                    <div key={c.id} className="elib-comment">
                      <div className="elib-comment__avatar">{c.user_name.charAt(0).toUpperCase()}</div>
                      <div className="elib-comment__body">
                        <div className="elib-comment__name">{c.user_name}</div>
                        <div className="elib-comment__date">{new Date(c.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        <p className="elib-comment__text">{c.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="elib-comments__empty">No comments yet. Be the first to comment!</p>
              )}

              {/* Leave a Comment */}
              <div className="elib-comments__form-wrap">
                <h5 className="elib-comments__form-title">Leave a Comment</h5>
                {commentSent ? (
                  <div className="elib-comments__success">✅ Comment posted successfully!</div>
                ) : (
                  <form onSubmit={handleComment} className="elib-comments__form">
                    <div className="elib-form__group">
                      <label>Your Name *</label>
                      <input required placeholder="Enter your name" value={commentName}
                        onChange={e => setCommentName(e.target.value)} />
                    </div>
                    <div className="elib-form__group">
                      <label>Your Comment *</label>
                      <textarea required rows={4} placeholder="Write your comment or question here..."
                        value={commentText} onChange={e => setCommentText(e.target.value)} />
                    </div>
                    <button type="submit" className="elib-comments__submit" disabled={commentLoading}>
                      {commentLoading ? 'Posting...' : '📝 Post Comment'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ===== LIST VIEW =====
  return (
    <div className="elib-page">
      <div className="elib-header">
        <div className="elib-header__inner">
          {onBack && <button className="elib-detail__back" onClick={onBack}>← Back to Home</button>}
          <div className="elib-header__label">Legal Knowledge Hub</div>
          <h1 className="elib-header__title">📚 E-Library</h1>
          <p className="elib-header__sub">Free legal resources, acts, and guides — humanized for everyone in Pakistan</p>
        </div>
      </div>

      <div className="elib-container">
        {/* Filters */}
        <div className="elib-filters">
          {categories.map(cat => (
            <button key={cat} className={`elib-filter ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}>
              {CATEGORY_ICONS[cat] || '📖'} {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="elib-grid">
            {[1,2,3,4,5,6].map(i => <div key={i} className="elib-skeleton" />)}
          </div>
        ) : (
          <div className="elib-grid">
            {filtered.map(item => (
              <div key={item.id} className="elib-card" onClick={() => openItem(item)}>
                <div className="elib-card__img-wrap">
                  <img src={item.image_url} alt={item.title} className="elib-card__img"
                    onError={e => { (e.target as HTMLImageElement).src = '/images/legal-bg.png' }} />
                  <div className="elib-card__cat">{CATEGORY_ICONS[item.category] || '📖'} {item.category}</div>
                </div>
                <div className="elib-card__body">
                  <h3 className="elib-card__title">{item.title}</h3>
                  <p className="elib-card__desc">{item.description}</p>
                  <div className="elib-card__footer">
                    <span className="elib-card__views">👁️ {item.views?.toLocaleString() || 0} views</span>
                    <button className="elib-card__read">Click to View →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="elib-empty">No resources in this category yet.</div>
        )}
      </div>
    </div>
  )
}
