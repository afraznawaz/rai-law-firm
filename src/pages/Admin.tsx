import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'
import CaseLawsAdmin from './CaseLawsAdmin'
import CertificatesAdmin from './CertificatesAdmin'

interface Post {
  id: number; title: string; slug: string; category: string
  excerpt: string; content: string; author: string; published: boolean; created_at: string
}

const CATEGORIES = ['Tax Law', 'Cybercrime & FIA', 'Intellectual Property', 'Corporate Law', 'Civil Litigation', 'Criminal Law', 'Family Law', 'Environmental Law', 'Revenue Law', 'Constitutional Law', 'General Legal Advice']
const EMPTY_POST = { title: '', slug: '', category: 'Tax Law', excerpt: '', content: '', author: 'Rai Afraz (Advocate)', published: true }

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'blog'|'caselaws'|'certificates'>('blog')

  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'list'|'edit'|'new'>('list')
  const [editPost, setEditPost] = useState<any>(EMPTY_POST)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [deleteId, setDeleteId] = useState<number|null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { if (user) fetchPosts() }, [user])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/blog?admin=1', { headers: { Authorization: `Bearer ${session?.access_token}` } })
      const data = await res.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    setAuthLoading(false)
  }

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaveMsg('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const method = view === 'new' ? 'POST' : 'PUT'
      const res = await fetch('/api/blog', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify(editPost)
      })
      if (!res.ok) throw new Error('Save failed')
      setSaveMsg('✅ Saved successfully!')
      await fetchPosts()
      setTimeout(() => { setSaveMsg(''); setView('list') }, 1500)
    } catch (err: any) { setSaveMsg('❌ Error: ' + err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/blog', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ id }) })
      setDeleteId(null); await fetchPosts()
    } catch (e) { console.error(e) }
  }

  if (!user) {
    return (
      <div className="adm-login">
        <div className="adm-login__box">
          <div className="adm-login__logo"><img src="/uploads/upload_1.PNG" alt="RAI & Associates" /></div>
          <h1 className="adm-login__title">CMS Login</h1>
          <p className="adm-login__sub">RAI & Associates — Admin Panel</p>
          <form onSubmit={handleLogin} className="adm-login__form">
            <div className="adm-form__group"><label>Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" /></div>
            <div className="adm-form__group"><label>Password</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" /></div>
            {authError && <div className="adm-error">{authError}</div>}
            <button type="submit" className="adm-btn adm-btn--gold" disabled={authLoading}>{authLoading ? 'Signing in...' : 'Sign In'}</button>
          </form>
          <a href="/" className="adm-login__back">← Back to Website</a>
        </div>
      </div>
    )
  }

  return (
    <div className="adm-root">
      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar__logo">
          <img src="/uploads/upload_1.PNG" alt="RAI" />
          <span>Admin CMS</span>
        </div>
        <nav className="adm-sidebar__nav">
          <button className={`adm-sidebar__link ${activeTab === 'blog' ? 'active' : ''}`} onClick={() => { setActiveTab('blog'); setView('list') }}>📝 Blog Posts</button>
          <button className={`adm-sidebar__link ${activeTab === 'caselaws' ? 'active' : ''}`} onClick={() => setActiveTab('caselaws')}>⚖️ Case Laws</button>
          <button className={`adm-sidebar__link ${activeTab === 'certificates' ? 'active' : ''}`} onClick={() => setActiveTab('certificates')}>🏆 Certificates</button>
          <div className="adm-sidebar__divider" />
          <a href="/" className="adm-sidebar__link">🌐 View Website</a>
        </nav>
        <div className="adm-sidebar__user">
          <div className="adm-sidebar__user-email">{user.email}</div>
          <button className="adm-sidebar__logout" onClick={() => supabase.auth.signOut()}>Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="adm-main">

        {/* BLOG TAB */}
        {activeTab === 'blog' && (
          <div>
            {view === 'list' && (
              <div>
                <div className="adm-header">
                  <div><h1 className="adm-header__title">Blog Posts</h1><p className="adm-header__sub">{posts.length} post{posts.length !== 1 ? 's' : ''} total</p></div>
                  <button className="adm-btn adm-btn--gold" onClick={() => { setEditPost({...EMPTY_POST}); setView('new') }}>+ New Post</button>
                </div>
                {loading ? <div className="adm-loading">Loading...</div> : (
                  <div className="adm-posts">
                    {posts.map(post => (
                      <div key={post.id} className="adm-post-card">
                        <div className="adm-post-card__left">
                          <span className={`adm-post-card__status ${post.published ? 'published' : 'draft'}`}>{post.published ? '🟢 Published' : '🟡 Draft'}</span>
                          <h3 className="adm-post-card__title">{post.title}</h3>
                          <div className="adm-post-card__meta">
                            <span className="adm-post-card__cat">{post.category}</span>
                            <span>by {post.author}</span>
                            <span>{new Date(post.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <p className="adm-post-card__excerpt">{post.excerpt?.substring(0, 120)}...</p>
                        </div>
                        <div className="adm-post-card__actions">
                          <button className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => { setEditPost({...post}); setView('edit') }}>✏️ Edit</button>
                          <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setDeleteId(post.id)}>🗑️ Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(view === 'edit' || view === 'new') && (
              <div>
                <div className="adm-header">
                  <div><h1 className="adm-header__title">{view === 'new' ? 'New Post' : 'Edit Post'}</h1></div>
                  <button className="adm-btn adm-btn--outline" onClick={() => setView('list')}>← Back</button>
                </div>
                <form onSubmit={handleSave} className="adm-editor">
                  <div className="adm-editor__grid">
                    <div className="adm-editor__main">
                      <div className="adm-form__group">
                        <label>Post Title *</label>
                        <input required placeholder="e.g. Understanding Tax Law in Pakistan" value={editPost.title}
                          onChange={e => setEditPost({ ...editPost, title: e.target.value, slug: generateSlug(e.target.value) })} />
                      </div>
                      <div className="adm-form__group">
                        <label>Short Summary / Excerpt *</label>
                        <textarea rows={3} required placeholder="A brief 1-2 sentence summary..." value={editPost.excerpt}
                          onChange={e => setEditPost({ ...editPost, excerpt: e.target.value })} />
                      </div>
                      <div className="adm-form__group">
                        <label>Full Article Content *</label>
                        <div className="adm-form__hint">Use **bold text** with double asterisks. Separate paragraphs with a blank line.</div>
                        <textarea rows={18} required placeholder="Write your full article here..." value={editPost.content}
                          onChange={e => setEditPost({ ...editPost, content: e.target.value })} />
                      </div>
                    </div>
                    <div className="adm-editor__sidebar">
                      <div className="adm-editor__panel">
                        <h3>Publish Settings</h3>
                        <div className="adm-form__group">
                          <label>Status</label>
                          <select value={editPost.published ? 'published' : 'draft'} onChange={e => setEditPost({ ...editPost, published: e.target.value === 'published' })}>
                            <option value="published">🟢 Published</option>
                            <option value="draft">🟡 Draft</option>
                          </select>
                        </div>
                        <div className="adm-form__group">
                          <label>Category *</label>
                          <select required value={editPost.category} onChange={e => setEditPost({ ...editPost, category: e.target.value })}>
                            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="adm-form__group">
                          <label>Author</label>
                          <input value={editPost.author} onChange={e => setEditPost({ ...editPost, author: e.target.value })} />
                        </div>
                        <div className="adm-form__group">
                          <label>URL Slug</label>
                          <input value={editPost.slug} onChange={e => setEditPost({ ...editPost, slug: e.target.value })} />
                          <div className="adm-form__hint">Auto-generated from title</div>
                        </div>
                        {saveMsg && <div className="adm-save-msg">{saveMsg}</div>}
                        <button type="submit" className="adm-btn adm-btn--gold adm-btn--full" disabled={saving}>
                          {saving ? 'Saving...' : view === 'new' ? '🚀 Publish Post' : '💾 Save Changes'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* CASE LAWS TAB */}
        {activeTab === 'caselaws' && <CaseLawsAdmin />}

        {/* CERTIFICATES TAB */}
        {activeTab === 'certificates' && <CertificatesAdmin />}
      </main>

      {/* Delete modal */}
      {deleteId && (
        <div className="adm-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Post?</h3>
            <p>This action cannot be undone.</p>
            <div className="adm-modal__actions">
              <button className="adm-btn adm-btn--outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="adm-btn adm-btn--danger" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
