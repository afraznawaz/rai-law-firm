import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

interface Post {
  id: number
  title: string
  slug: string
  category: string
  content: string
  excerpt: string
  image_url: string
  views: number
  author: string
  created_at: string
}

interface Comment {
  id: number
  user_name: string
  user_email: string
  body: string
  created_at: string
}

const SOCIAL_LINKS = [
  { icon: '📘', label: 'Facebook', href: 'https://www.facebook.com/61577203114572', color: '#1877f2' },
  { icon: '🎵', label: 'TikTok', href: 'https://www.tiktok.com/@rai_associates', color: '#010101' },
  { icon: '📸', label: 'Instagram', href: 'https://www.instagram.com/rai_associates10', color: '#e1306c' },
  { icon: '▶️', label: 'YouTube', href: 'https://www.youtube.com/@raiandassociates', color: '#ff0000' },
  { icon: '💬', label: 'WhatsApp', href: 'https://wa.me/923164371096', color: '#25d366' },
]

function renderContent(text: string) {
  if (!text) return ''
  return text.split('\n\n').map((para, i) => {
    if (para.startsWith('**') && para.endsWith('**') && para.split('\n').length === 1) {
      return `<h3 class="elib-post__h3">${para.replace(/\*\*/g, '')}</h3>`
    }
    const html = para
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>')
    return `<p>${html}</p>`
  }).join('')
}

export default function ELibraryPost({ slug, onBack }: { slug: string; onBack: () => void }) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentBody, setCommentBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [commentMsg, setCommentMsg] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then((d: any) => { const s = d.data?.session; setUser(s?.user ?? null) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: any, session: any) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    fetch(`/api/elibrary?slug=${slug}`)
      .then(r => r.json())
      .then(d => { setPost(d); setLoading(false); if (d?.id) fetchComments(d.id) })
      .catch(() => setLoading(false))
  }, [slug])

  const fetchComments = async (postId: number) => {
    const res = await fetch(`/api/elibrary-comments?post_id=${postId}`)
    const data = await res.json()
    setComments(Array.isArray(data) ? data : [])
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) { setCommentMsg('❌ Please log in to post a comment.'); return }
    if (!commentBody.trim()) return
    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/elibrary-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ post_id: post!.id, body: commentBody })
      })
      if (res.ok) {
        setCommentBody('')
        setCommentMsg('✅ Comment posted!')
        fetchComments(post!.id)
        setTimeout(() => setCommentMsg(''), 3000)
      } else {
        const err = await res.json()
        setCommentMsg('❌ ' + err.error)
      }
    } catch { setCommentMsg('❌ Something went wrong') }
    setSubmitting(false)
  }

  const handleLogin = async () => {
    const email = prompt('Enter your email:')
    const password = prompt('Enter your password:')
    if (!email || !password) return
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert('Login failed: ' + error.message)
  }

  if (loading) return <div className="elib-post-loading">Loading article...</div>
  if (!post) return <div className="elib-post-loading">Article not found.</div>

  return (
    <div className="elib-post-page">
      <div className="elib-post-container">
        <button className="elib-post-back" onClick={onBack}>← Back to E-Library</button>

        {/* Hero Image */}
        <div className="elib-post-hero">
          <img src={post.image_url} alt={post.title}
            onError={e => { (e.target as HTMLImageElement).src = '/images/legal-bg.png' }} />
          <div className="elib-post-hero__overlay">
            <span className="elib-post-hero__cat">{post.category}</span>
            <div className="elib-post-hero__views">👁 {post.views.toLocaleString()} views</div>
          </div>
        </div>

        {/* Article */}
        <div className="elib-post-wrap">
          <h1 className="elib-post-title">{post.title}</h1>
          <div className="elib-post-meta">
            <span>✍️ {post.author}</span>
            <span>📅 {new Date(post.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span>👁 {post.views.toLocaleString()} views</span>
          </div>
          <div className="elib-post-body" dangerouslySetInnerHTML={{ __html: renderContent(post.content) }} />

          {/* CTA */}
          <div className="elib-post-cta">
            <h3>Need Legal Advice on This Topic?</h3>
            <p>Contact Rai & Associates for a free consultation with our expert advocates.</p>
            <div className="elib-post-cta__btns">
              <a href="tel:+923044840937" className="elib-post-cta__btn elib-post-cta__btn--call">📞 Call: +92 304 484 0937</a>
              <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="elib-post-cta__btn elib-post-cta__btn--wa">💬 WhatsApp Us</a>
            </div>
          </div>

          {/* Follow Us on Social */}
          <div className="elib-post-social">
            <h3 className="elib-post-social__title">📲 Follow Us on Social Media</h3>
            <div className="elib-post-social__links">
              {SOCIAL_LINKS.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="elib-post-social__btn" style={{ '--sc': s.color } as React.CSSProperties}>
                  <span>{s.icon}</span><span>{s.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="elib-post-comments">
            <h3 className="elib-post-comments__title">💬 Comments ({comments.length})</h3>

            {comments.length === 0 ? (
              <p className="elib-post-comments__empty">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              <div className="elib-post-comments__list">
                {comments.map(c => (
                  <div key={c.id} className="elib-comment">
                    <div className="elib-comment__avatar">{c.user_name?.charAt(0).toUpperCase()}</div>
                    <div className="elib-comment__body">
                      <div className="elib-comment__header">
                        <span className="elib-comment__name">{c.user_name}</span>
                        <span className="elib-comment__date">{new Date(c.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <p className="elib-comment__text">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Leave a Comment */}
            <div className="elib-post-comment-form">
              <h4 className="elib-post-comment-form__title">Leave a Comment</h4>
              {!user ? (
                <div className="elib-post-comment-login">
                  <p>You must be logged in to post a comment.</p>
                  <button className="elib-post-comment-login__btn" onClick={handleLogin}>🔐 Log In to Comment</button>
                </div>
              ) : (
                <form onSubmit={handleComment}>
                  <div className="elib-post-comment-form__user">Commenting as: <strong>{user.email}</strong></div>
                  <textarea
                    rows={4}
                    placeholder="Share your thoughts or ask a legal question..."
                    value={commentBody}
                    onChange={e => setCommentBody(e.target.value)}
                    required
                  />
                  {commentMsg && <div className="elib-post-comment-form__msg">{commentMsg}</div>}
                  <button type="submit" disabled={submitting}>
                    {submitting ? 'Posting...' : '💬 Post Comment'}
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
