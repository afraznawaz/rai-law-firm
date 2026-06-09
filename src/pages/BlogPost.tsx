import { useState, useEffect } from 'react'

interface Comment {
  id: number
  user_name: string
  user_email: string
  comment: string
  created_at: string
}

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
  image_url?: string
  cover_image?: string
  views?: number
  comments?: Comment[]
}

const SOCIAL_LINKS = [
  { icon: 'f', label: 'Facebook (R&A)', href: 'https://www.facebook.com/61577203114572', color: '#1877f2', bg: '#1877f2' },
  { icon: 'in', label: 'Facebook (Rai Afraz)', href: 'https://www.facebook.com/raiafraz10', color: '#1877f2', bg: '#1877f2' },
  { icon: '▶', label: 'YouTube', href: 'https://www.youtube.com/@raiandassociates', color: '#ff0000', bg: '#ff0000' },
  { icon: '♪', label: 'TikTok', href: 'https://www.tiktok.com/@rai_associates', color: '#010101', bg: '#333' },
  { icon: '◉', label: 'Instagram', href: 'https://www.instagram.com/rai_associates10', color: '#e1306c', bg: '#e1306c' },
  { icon: '💬', label: 'WhatsApp', href: 'https://wa.me/923164371096', color: '#25d366', bg: '#25d366' },
]

function renderContent(text: string) {
  if (!text) return ''
  return text.split('\n\n').map((para, i) => {
    const html = para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')
    return `<p>${html}</p>`
  }).join('')
}

export default function BlogPost({ slug, onBack }: { slug: string; onBack: () => void }) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentName, setCommentName] = useState('')
  const [commentEmail, setCommentEmail] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commentSubmitted, setCommentSubmitted] = useState(false)
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/blog?slug=${slug}`)
      .then(r => r.json())
      .then(d => { setPost(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [slug])

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post) return
    setCommentLoading(true)
    try {
      await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'comment', post_id: post.id, user_name: commentName, user_email: commentEmail, comment: commentText })
      })
      setCommentSubmitted(true)
      setCommentName(''); setCommentEmail(''); setCommentText('')
      // Refresh post to show new comment
      const res = await fetch(`/api/blog?slug=${slug}`)
      const data = await res.json()
      setPost(data)
    } catch (e) { console.error(e) }
    finally { setCommentLoading(false) }
  }

  if (loading) return <div className="blog-post-loading"><div className="blog-post-spinner" /></div>
  if (!post || !post.title) return <div className="blog-post-loading">Post not found.</div>

  return (
    <div className="blog-post-page">
      <button className="blog-post-back" onClick={onBack}>← Back to Blogs</button>

      <article className="blog-post-wrap">
        {/* Hero Image */}
        {(post.cover_image || post.image_url) && (
          <div className="blog-post-hero">
            <img src={post.cover_image || post.image_url} alt={post.title} className="blog-post-hero__img" />
            <div className="blog-post-hero__overlay" />
            <div className="blog-post-hero__content">
              <span className="blog-post-cat">{post.category}</span>
              <h1 className="blog-post-title">{post.title}</h1>
            </div>
          </div>
        )}

        <div className="blog-post-body-wrap">
          {/* Meta bar */}
          <div className="blog-post-meta">
            <span>✍️ {post.author}</span>
            <span>📅 {new Date(post.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span className="blog-post-views">👁️ {post.views?.toLocaleString() || 0} views</span>
            <span>💬 {post.comments?.length || 0} comments</span>
          </div>

          {/* Content */}
          <div className="blog-post-body" dangerouslySetInnerHTML={{ __html: renderContent(post.content) }} />

          {/* Follow Us */}
          <div className="blog-post-follow">
            <h3 className="blog-post-follow__title">📲 Follow Us on Social Media</h3>
            <div className="blog-post-follow__links">
              <a href="https://www.facebook.com/61577203114572" target="_blank" rel="noopener noreferrer" className="bpf-btn bpf-btn--fb">📘 Facebook R&A</a>
              <a href="https://www.facebook.com/raiafraz10" target="_blank" rel="noopener noreferrer" className="bpf-btn bpf-btn--fb">📘 Rai Afraz</a>
              <a href="https://www.youtube.com/@raiandassociates" target="_blank" rel="noopener noreferrer" className="bpf-btn bpf-btn--yt">▶️ YouTube</a>
              <a href="https://www.tiktok.com/@rai_associates" target="_blank" rel="noopener noreferrer" className="bpf-btn bpf-btn--tt">🎵 TikTok</a>
              <a href="https://www.instagram.com/rai_associates10" target="_blank" rel="noopener noreferrer" className="bpf-btn bpf-btn--ig">📸 Instagram</a>
              <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="bpf-btn bpf-btn--wa">💬 WhatsApp</a>
            </div>
          </div>

          {/* CTA */}
          <div className="blog-post-cta">
            <h3>Need Legal Advice?</h3>
            <p>Contact Rai & Associates for a free consultation today.</p>
            <div className="blog-post-cta__btns">
              <a href="tel:+923044840937" className="blog-post-cta-btn">📞 Call: +92 304 484 0937</a>
              <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="blog-post-cta-btn blog-post-cta-btn--wa">💬 WhatsApp Us</a>
            </div>
          </div>

          {/* Comments Section */}
          <div className="blog-post-comments">
            <h3 className="blog-post-comments__title">💬 Comments ({post.comments?.length || 0})</h3>

            {/* Existing Comments */}
            {post.comments && post.comments.length > 0 ? (
              <div className="blog-post-comments__list">
                {post.comments.map(c => (
                  <div key={c.id} className="blog-comment">
                    <div className="blog-comment__avatar">{c.user_name.charAt(0).toUpperCase()}</div>
                    <div className="blog-comment__body">
                      <div className="blog-comment__header">
                        <span className="blog-comment__name">{c.user_name}</span>
                        <span className="blog-comment__date">{new Date(c.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <p className="blog-comment__text">{c.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="blog-post-comments__empty">No comments yet. Be the first to comment!</p>
            )}

            {/* Leave a Comment */}
            <div className="blog-post-comment-form">
              <h4 className="blog-post-comment-form__title">✏️ Leave a Comment</h4>
              {commentSubmitted ? (
                <div className="blog-post-comment-success">✅ Your comment has been submitted!</div>
              ) : (
                <form onSubmit={handleComment}>
                  <div className="bpcf-row">
                    <div className="bpcf-group">
                      <label>Name *</label>
                      <input required placeholder="Your name" value={commentName} onChange={e => setCommentName(e.target.value)} />
                    </div>
                    <div className="bpcf-group">
                      <label>Email (optional)</label>
                      <input type="email" placeholder="your@email.com" value={commentEmail} onChange={e => setCommentEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="bpcf-group">
                    <label>Comment *</label>
                    <textarea required rows={4} placeholder="Write your comment here..." value={commentText} onChange={e => setCommentText(e.target.value)} />
                  </div>
                  <button type="submit" className="bpcf-submit" disabled={commentLoading}>
                    {commentLoading ? 'Submitting...' : '💬 Post Comment'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
