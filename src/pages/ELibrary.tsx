import { useState, useEffect } from 'react'
import { FacebookIcon, TikTokIcon, InstagramIcon, YouTubeIcon, WhatsAppIcon } from '../components/SocialIcons'

interface LawItem {
  id: number
  title: string
  category: string
  year: string
  summary: string
  content: string
  created_at: string
}

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
}

function renderContent(text: string) {
  if (!text) return ''
  return text.split('\n\n').map((para, i) => {
    const html = para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
    return `<p>${html}</p>`
  }).join('')
}

export default function ELibrary({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<LawItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<LawItem | null>(null)

  useEffect(() => {
    fetch('/api/elibrary')
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const categories = ['All', ...Array.from(new Set(items.map(i => i.category)))]
  const filtered = items.filter(item => {
    const matchCat = filter === 'All' || item.category === filter
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.summary.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (selected) {
    return (
      <div className="elib-detail">
        <button className="elib-back" onClick={() => setSelected(null)}>← Back to E-Library</button>
        <div className="elib-detail__wrap">
          <div className="elib-detail__header">
            <div className="elib-detail__meta">
              <span className="elib-detail__cat">{CATEGORY_ICONS[selected.category] || '📜'} {selected.category}</span>
              <span className="elib-detail__year">{selected.year}</span>
            </div>
            <h1 className="elib-detail__title">{selected.title}</h1>
            <p className="elib-detail__summary">{selected.summary}</p>
          </div>
          <div className="elib-detail__body" dangerouslySetInnerHTML={{ __html: renderContent(selected.content) }} />
          {/* SOCIAL SHARE SECTION */}
          <div className="elib-social-section">
            <div className="elib-social-section__label">
              <span className="elib-social-section__icon">📲</span>
              <span>Follow Rai & Associates for Daily Legal Updates</span>
            </div>
            <div className="elib-social-section__links">
              <a href="https://www.facebook.com/61577203114572" target="_blank" rel="noopener noreferrer" className="elib-social-btn elib-social-btn--fb">
                <FacebookIcon size={18} />
                <span>Facebook (R&A)</span>
              </a>
              <a href="https://www.facebook.com/raiafraz10" target="_blank" rel="noopener noreferrer" className="elib-social-btn elib-social-btn--fb">
                <FacebookIcon size={18} />
                <span>Rai Afraz</span>
              </a>
              <a href="https://www.tiktok.com/@rai_associates" target="_blank" rel="noopener noreferrer" className="elib-social-btn elib-social-btn--tt">
                <TikTokIcon size={18} />
                <span>TikTok</span>
              </a>
              <a href="https://www.instagram.com/rai_associates10" target="_blank" rel="noopener noreferrer" className="elib-social-btn elib-social-btn--ig">
                <InstagramIcon size={18} />
                <span>Instagram</span>
              </a>
              <a href="https://www.youtube.com/@raiandassociates" target="_blank" rel="noopener noreferrer" className="elib-social-btn elib-social-btn--yt">
                <YouTubeIcon size={18} />
                <span>YouTube</span>
              </a>
              <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="elib-social-btn elib-social-btn--wa">
                <WhatsAppIcon size={18} />
                <span>WhatsApp</span>
              </a>
            </div>
            <div className="elib-social-section__share">
              <span>📤 Share this article:</span>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="elib-share-btn elib-share-btn--fb"><FacebookIcon size={16}/> Share</a>
              <a href={`https://wa.me/?text=${encodeURIComponent(selected.title + ' - Read on Rai & Associates: ' + window.location.href)}`} target="_blank" rel="noopener noreferrer" className="elib-share-btn elib-share-btn--wa"><WhatsAppIcon size={16}/> Share</a>
            </div>
          </div>

          <div className="elib-detail__cta">
            <h3>⚖️ Need Legal Advice on This Law?</h3>
            <p>Contact Rai & Associates for expert guidance and representation.</p>
            <div className="elib-detail__cta-btns">
              <a href="tel:+923044840937" className="elib-cta-btn elib-cta-btn--gold">📞 Call: +92 304 484 0937</a>
              <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="elib-cta-btn elib-cta-btn--green">💬 WhatsApp Us</a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="elib-page">
      <div className="elib-hero">
        <div className="elib-hero__content">
          <div className="elib-hero__badge">📚 Legal Knowledge Hub</div>
          <h1 className="elib-hero__title">E-Library</h1>
          <p className="elib-hero__sub">Pakistan's Laws, Acts & Ordinances — Explained in Simple Language</p>
          <div className="elib-search">
            <span className="elib-search__icon">🔍</span>
            <input
              className="elib-search__input"
              placeholder="Search laws, acts, ordinances..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="elib-body">
        <div className="elib-sidebar">
          <h3 className="elib-sidebar__title">Categories</h3>
          {categories.map(cat => (
            <button
              key={cat}
              className={`elib-sidebar__btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              <span>{CATEGORY_ICONS[cat] || '📜'}</span>
              <span>{cat}</span>
              <span className="elib-sidebar__count">
                {cat === 'All' ? items.length : items.filter(i => i.category === cat).length}
              </span>
            </button>
          ))}
        </div>

        <div className="elib-content">
          <div className="elib-content__header">
            <span className="elib-content__count">{filtered.length} law{filtered.length !== 1 ? 's' : ''} found</span>
            {search && <button className="elib-content__clear" onClick={() => setSearch('')}>× Clear search</button>}
          </div>

          {loading ? (
            <div className="elib-grid">
              {[1,2,3,4,5,6].map(i => <div key={i} className="elib-skeleton" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="elib-empty">
              <div className="elib-empty__icon">📜</div>
              <p>No laws found. Try a different search or category.</p>
            </div>
          ) : (
            <div className="elib-grid">
              {filtered.map(item => (
                <div key={item.id} className="elib-card" onClick={() => setSelected(item)}>
                  <div className="elib-card__top">
                    <span className="elib-card__icon">{CATEGORY_ICONS[item.category] || '📜'}</span>
                    <span className="elib-card__year">{item.year}</span>
                  </div>
                  <h3 className="elib-card__title">{item.title}</h3>
                  <p className="elib-card__summary">{item.summary}</p>
                  <div className="elib-card__footer">
                    <span className="elib-card__cat">{item.category}</span>
                    <span className="elib-card__read">Read More →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
