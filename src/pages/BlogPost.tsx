import { useState, useEffect } from 'react'

interface Post {
  id: number; title: string; slug: string; category: string
  excerpt: string; content: string; author: string; published: boolean
  created_at: string; updated_at: string
}

function renderContent(text: string) {
  if (!text) return ''
  return text.split('\n\n').map((para) => {
    if (!para.trim()) return ''
    const html = para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
    return `<p>${html}</p>`
  }).join('')
}

export default function BlogPost({ slug, onBack }: { slug: string; onBack: () => void }) {
  const [post, setPost] = useState<Post | null>(null)
  const [related, setRelated] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/blog?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => {
        setPost(d)
        setLoading(false)
        if (d && d.slug) {
          document.title = `${d.title} | RAI & Associates Law Firm`
          fetch('/api/blog').then(r => r.json()).then(all => {
            if (Array.isArray(all)) setRelated(all.filter(p => p.category === d.category && p.slug !== d.slug).slice(0, 3))
          })
        }
      })
      .catch(() => setLoading(false))
    return () => { document.title = 'RAI & Associates Law Firm | Est. 1993 | Lahore' }
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
          <span>📅 {new Date(post.created_at).toLocaleDateString('en-PK', { day:'numeric', month:'long', year:'numeric' })}</span>
        </div>
        <p className="blog-post-excerpt">{post.excerpt}</p>
        <div className="blog-post-body" dangerouslySetInnerHTML={{ __html: renderContent(post.content) }} />

        {related.length > 0 && (
          <div className="blog-post-related">
            <h3>Related Articles</h3>
            <div className="blog-post-related__grid">
              {related.map(r => (
                <div key={r.id} className="blog-post-related__card" onClick={() => { window.scrollTo(0,0); onBack() }}>
                  <div className="blog-post-related__cat">{r.category}</div>
                  <div className="blog-post-related__title">{r.title}</div>
                  <div className="blog-post-related__read">Read Article →</div>
                </div>
              ))}
            </div>
          </div>
        )}

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
