import { useState, useEffect } from 'react'
import ELibraryPost from './ELibraryPost'
import '../../src/elibrary.css'

interface ELibPost {
  id: number
  title: string
  slug: string
  category: string
  excerpt: string
  image_url: string
  views: number
  author: string
  created_at: string
}

const CATEGORIES = ['All', 'Legal Technology', 'Legal Profession', 'Criminal Law', 'Constitutional Law', 'Corporate Law', 'Revenue Law']

const SOCIAL_LINKS = [
  { icon: '📘', label: 'Facebook', href: 'https://www.facebook.com/61577203114572', color: '#1877f2' },
  { icon: '🎵', label: 'TikTok', href: 'https://www.tiktok.com/@rai_associates', color: '#010101' },
  { icon: '📸', label: 'Instagram', href: 'https://www.instagram.com/rai_associates10', color: '#e1306c' },
  { icon: '▶️', label: 'YouTube', href: 'https://www.youtube.com/@raiandassociates', color: '#ff0000' },
  { icon: '💬', label: 'WhatsApp', href: 'https://wa.me/923164371096', color: '#25d366' },
]

export default function ELibrary({ onBack }: { onBack: () => void }) {
  const [posts, setPosts] = useState<ELibPost[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/elibrary')
      .then(r => r.json())
      .then(d => { setPosts(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (openSlug) return <ELibraryPost slug={openSlug} onBack={() => setOpenSlug(null)} />

  const filtered = posts.filter(p => {
    const matchCat = filter === 'All' || p.category === filter
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.excerpt.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="elib-root">
      {/* Header */}
      <div className="elib-header">
        <button className="elib-back" onClick={onBack}>← Back to Website</button>
        <div className="elib-header__content">
          <div className="elib-header__badge">📚 Legal Knowledge Hub</div>
          <h1 className="elib-header__title">E-Library</h1>
          <p className="elib-header__sub">Expert legal articles, guides & resources by Rai & Associates</p>
          <div className="elib-header__search">
            <span className="elib-header__search-icon">🔍</span>
            <input
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="elib-filters">
        <div className="elib-filters__inner">
          {CATEGORIES.map(cat => (
            <button key={cat} className={`elib-filter ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>{cat}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="elib-container">
        {loading ? (
          <div className="elib-grid">
            {[1,2,3,4,5,6].map(i => <div key={i} className="elib-skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="elib-empty">No articles found. Try a different search or category.</div>
        ) : (
          <div className="elib-grid">
            {filtered.map(post => (
              <div key={post.id} className="elib-card">
                <div className="elib-card__img-wrap">
                  <img src={post.image_url} alt={post.title} className="elib-card__img"
                    onError={e => { (e.target as HTMLImageElement).src = '/images/legal-bg.png' }} />
                  <div className="elib-card__cat">{post.category}</div>
                  <div className="elib-card__views">👁 {post.views.toLocaleString()} views</div>
                </div>
                <div className="elib-card__body">
                  <h3 className="elib-card__title">{post.title}</h3>
                  <p className="elib-card__excerpt">{post.excerpt}</p>
                  <div className="elib-card__meta">
                    <span>✍️ {post.author}</span>
                    <span>📅 {new Date(post.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <button className="elib-card__btn" onClick={() => setOpenSlug(post.slug)}>Click to View →</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Follow us on social */}
        <div className="elib-social">
          <h3 className="elib-social__title">📲 Follow Us on Social Media</h3>
          <div className="elib-social__links">
            {SOCIAL_LINKS.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                className="elib-social__btn" style={{ '--sc': s.color } as React.CSSProperties}>
                <span className="elib-social__icon">{s.icon}</span>
                <span>{s.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
