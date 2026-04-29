import { useState, useEffect } from 'react'

interface Post {
  id: number
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  author: string
  published: boolean
  created_at: string
}

const SOCIAL_LINKS = [
  { icon: '📘', label: 'Facebook (R&A)', href: 'https://www.facebook.com/61577203114572', color: '#1877f2' },
  { icon: '📘', label: 'Facebook (Rai Afraz)', href: 'https://www.facebook.com/raiafraz10', color: '#1877f2' },
  { icon: '🎵', label: 'TikTok', href: 'https://www.tiktok.com/@rai_associates', color: '#010101' },
  { icon: '📸', label: 'Instagram', href: 'https://www.instagram.com/rai_associates10', color: '#e1306c' },
  { icon: '▶️', label: 'YouTube', href: 'https://www.youtube.com/@raiandassociates', color: '#ff0000' },
  { icon: '💬', label: 'WhatsApp', href: 'https://wa.me/923164371096', color: '#25d366' },
]

function renderContent(text: string) {
  if (!text) return ''
  return text
    .split('\n\n')
    .map((para, i) => {
      const html = para
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br/>')
      return `<p key="${i}">${html}</p>`
    })
    .join('')
}

export default function BlogPost({ slug, onBack }: { slug: string; onBack: () => void }) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/blog?slug=${slug}`)
      .then(r => r.json())
      .then(d => { setPost(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="blog-post-loading">Loading...</div>
  if (!post) return <div className="blog-post-loading">Post not found.</div>

  return (
    <div className="blog-post-page">
      <button className="blog-post-back" onClick={onBack}>← Back to Legal Insights</button>
      <div className="blog-post-wrap">
        <div className="blog-post-cat">{post.category}</div>
        <h1 className="blog-post-title">{post.title}</h1>
        <div className="blog-post-meta">
          <span>✍️ {post.author}</span>
          <span>📅 {new Date(post.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <div className="blog-post-body" dangerouslySetInnerHTML={{ __html: renderContent(post.content) }} />
        <div className="blog-post-follow">
          <div className="blog-post-follow__header">
            <span className="blog-post-follow__icon">📲</span>
            <h3 className="blog-post-follow__title">Follow Us</h3>
          </div>
          <p className="blog-post-follow__sub">Stay updated with latest legal insights & news from Rai & Associates</p>
          <div className="blog-post-follow__links">
            {SOCIAL_LINKS.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                className="blog-post-follow__btn" style={{ '--sc': s.color } as React.CSSProperties}>
                <span className="blog-post-follow__btn-icon">{s.icon}</span>
                <span className="blog-post-follow__btn-label">{s.label}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="blog-post-cta">
          <h3>Need Legal Advice?</h3>
          <p>Contact Rai & Associates for a free consultation.</p>
          <div className="blog-post-cta__btns">
            <a href="tel:+923044840937" className="blog-post-cta-btn">📞 Call: +92 304 484 0937</a>
            <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="blog-post-cta-btn blog-post-cta-btn--wa">💬 WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  )
}
