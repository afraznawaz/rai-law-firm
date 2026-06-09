import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

interface Article {
  id: number
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  author: string
  cover_image: string
  views: number
  created_at: string
}

const SOCIAL_LINKS = [
  { icon: 'fb', label: 'Facebook', href: 'https://www.facebook.com/61577203114572', color: '#1877f2', svg: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
  { icon: 'ig', label: 'Instagram', href: 'https://www.instagram.com/rai_associates10', color: '#e1306c', svg: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
  { icon: 'yt', label: 'YouTube', href: 'https://www.youtube.com/@raiandassociates', color: '#ff0000', svg: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg> },
  { icon: 'wa', label: 'WhatsApp', href: 'https://wa.me/923164371096', color: '#25d366', svg: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> },
]

function renderContent(text: string) {
  if (!text) return ''
  return text.split('\n\n').map(para => {
    const html = para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
    return `<p>${html}</p>`
  }).join('')
}

export default function BlogArticles({ onBack }: { onBack: () => void }) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Article | null>(null)
  const [filter, setFilter] = useState('All')
  const [user, setUser] = useState<any>(null)
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState<any[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch('/api/blog-articles').then(r => r.json()).then(d => { setArticles(Array.isArray(d) ? d : []); setLoading(false) }).catch(() => setLoading(false))
    supabase.auth.getSession().then((d: any) => { const s = d.data?.session; setUser(s?.user ?? null) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_: any, s: any) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  const openArticle = async (article: Article) => {
    setSelected(article)
    // increment views
    fetch('/api/article-views', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ table: 'blog_articles', id: article.id }) })
    // load comments
    setCommentsLoading(true)
    const { data } = await supabase.from('article_comments').select('*').eq('article_id', article.id).eq('article_type', 'blog_article').order('created_at', { ascending: false })
    setComments(data || [])
    setCommentsLoading(false)
    window.scrollTo(0, 0)
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !comment.trim() || !selected) return
    setSubmitting(true)
    await supabase.from('article_comments').insert({ article_id: selected.id, article_type: 'blog_article', user_id: user.id, user_name: user.email?.split('@')[0] || 'User', comment: comment.trim() })
    setComment('')
    const { data } = await supabase.from('article_comments').select('*').eq('article_id', selected.id).eq('article_type', 'blog_article').order('created_at', { ascending: false })
    setComments(data || [])
    setSubmitting(false)
  }

  const categories = ['All', ...Array.from(new Set(articles.map(a => a.category)))]
  const filtered = filter === 'All' ? articles : articles.filter(a => a.category === filter)

  if (selected) {
    return (
      <div className="ba-detail">
        <div className="ba-detail__nav">
          <button className="ba-back" onClick={() => setSelected(null)}>← Back to Blog</button>
        </div>
        <div className="ba-detail__wrap">
          {selected.cover_image && <div className="ba-detail__img"><img src={selected.cover_image} alt={selected.title} onError={e => (e.target as HTMLImageElement).style.display = 'none'} /></div>}
          <div className="ba-detail__cat">{selected.category}</div>
          <h1 className="ba-detail__title">{selected.title}</h1>
          <div className="ba-detail__meta">
            <span>✍️ {selected.author}</span>
            <span>📅 {new Date(selected.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>👁️ {selected.views} views</span>
          </div>
          <div className="ba-detail__body" dangerouslySetInnerHTML={{ __html: renderContent(selected.content) }} />

          {/* Follow Us */}
          <div className="ba-detail__social">
            <h3>📲 Follow Us on Social Media</h3>
            <div className="ba-detail__social-links">
              {SOCIAL_LINKS.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="ba-social-btn" style={{ background: s.color }}>
                  {s.svg} <span>{s.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="ba-comments">
            <h3 className="ba-comments__title">💬 Comments</h3>
            {commentsLoading ? <p className="ba-comments__loading">Loading comments...</p> : (
              <>
                {comments.length === 0 && <p className="ba-comments__empty">No comments yet. Be the first to comment!</p>}
                {comments.map(c => (
                  <div key={c.id} className="ba-comment">
                    <div className="ba-comment__avatar">{c.user_name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="ba-comment__name">{c.user_name}</div>
                      <div className="ba-comment__date">{new Date(c.created_at).toLocaleDateString()}</div>
                      <div className="ba-comment__text">{c.comment}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
            <div className="ba-comment-form">
              <h4>Leave a Comment</h4>
              {user ? (
                <form onSubmit={handleComment}>
                  <textarea required rows={4} placeholder="Write your comment..." value={comment} onChange={e => setComment(e.target.value)} className="ba-comment-input" />
                  <button type="submit" className="ba-comment-btn" disabled={submitting}>{submitting ? 'Posting...' : 'Post Comment'}</button>
                </form>
              ) : (
                <div className="ba-comment-login">
                  <p>You must be logged in to post a comment.</p>
                  <a href="/lawyer-login" className="ba-comment-login-btn">Login as Lawyer</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ba-page">
      <div className="ba-hero">
        <div className="ba-hero__content">
          <div className="ba-hero__badge">Blogs</div>
          <h1 className="ba-hero__title">Blog & Legal Articles</h1>
          <p className="ba-hero__sub">In-depth legal articles, case studies, and expert insights from Rai & Associates</p>
        </div>
      </div>
      <div className="ba-container">
        <div className="ba-filters">
          {categories.map(cat => (
            <button key={cat} className={`ba-filter ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>{cat}</button>
          ))}
        </div>
        {loading ? (
          <div className="ba-grid">{[1,2,3,4,5,6].map(i => <div key={i} className="ba-skeleton" />)}</div>
        ) : (
          <div className="ba-grid">
            {filtered.map(article => (
              <div key={article.id} className="ba-card" onClick={() => openArticle(article)}>
                {article.cover_image && <div className="ba-card__img"><img src={article.cover_image} alt={article.title} onError={e => (e.target as HTMLImageElement).parentElement!.style.display='none'} /></div>}
                <div className="ba-card__body">
                  <span className="ba-card__cat">{article.category}</span>
                  <h3 className="ba-card__title">{article.title}</h3>
                  <p className="ba-card__excerpt">{article.excerpt?.substring(0, 120)}...</p>
                  <div className="ba-card__footer">
                    <span>✍️ {article.author}</span>
                    <span>👁️ {article.views} views</span>
                  </div>
                  <button className="ba-card__read">Read Article →</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && filtered.length === 0 && <div className="ba-empty">No articles found.</div>}
      </div>
    </div>
  )
}
