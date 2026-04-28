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
        <div className="blog-post-cta">
          <h3>Need Legal Advice?</h3>
          <p>Contact Rai & Associates for a free consultation.</p>
          <a href="tel:+923044840937" className="blog-post-cta-btn">📞 Call Now: +92 304 484 0937</a>
        </div>
      </div>
    </div>
  )
}
