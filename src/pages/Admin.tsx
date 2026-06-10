import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

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

const CATEGORIES = [
  'Tax Law', 'Cybercrime & FIA', 'Intellectual Property', 'Corporate Law',
  'Civil Litigation', 'Criminal Law', 'Family Law', 'Environmental Law',
  'Revenue Law', 'Constitutional Law', 'General Legal Advice'
]

const EMPTY: Partial<Post> = {
  title: '', slug: '', category: 'Tax Law',
  excerpt: '', content: '', author: 'Rai Afraz (Advocate)', published: true
}

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authErr, setAuthErr] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'list' | 'new' | 'edit'>('list')
  const [form, setForm] = useState<Partial<Post>>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [delId, setDelId] = useState<number | null>(null)

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then((d: any) => setUser(d.data?.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_: any, s: any) => setUser(s?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { if (user) fetchPosts() }, [user])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/blog?admin=1', {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      })
      const data = await res.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthErr('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) {
        setAuthErr(error.message)
        setAuthLoading(false)
        return
      }
      // Explicitly set user on success — don't rely only on onAuthStateChange
      if (data?.user) {
        setUser(data.user)
      }
    } catch (err: any) {
      setAuthErr(err.message || 'Login failed. Please try again.')
    }
    setAuthLoading(false)
  }

  const logout = () => supabase.auth.signOut()

  const slug = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const method = view === 'new' ? 'POST' : 'PUT'
      const res = await fetch('/api/blog', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Save failed')
      setMsg('✅ Saved!')
      await fetchPosts()
      setTimeout(() => { setMsg(''); setView('list') }, 1500)
    } catch (err: any) { setMsg('❌ ' + err.message) }
    setSaving(false)
  }

  const del = async (id: number) => {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/blog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ id })
    })
    setDelId(null)
    fetchPosts()
  }

  // ── LOGIN SCREEN ──────────────────────────────────────────────────────────
  if (!user) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#0a2a12,#0d3d1e,#155a2e)', padding: '24px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '48px 40px',
        width: '100%', maxWidth: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', textAlign: 'center'
      }}>
        <img src="/uploads/upload_1.PNG" alt="RAI" style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 16 }} />
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.6rem', color: '#0d3d1e', marginBottom: 4 }}>Admin Login</h1>
        <p style={{ fontSize: '0.85rem', color: '#777', marginBottom: 28 }}>RAI & Associates — Blog CMS</p>
        <form onSubmit={login} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="afrazrai4457@gmail.com"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #ddd', borderRadius: 6, fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #ddd', borderRadius: 6, fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {authErr && <div style={{ background: '#fff0f0', border: '1px solid #fcc', color: '#c00', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: '0.85rem' }}>{authErr}</div>}
          <button type="submit" disabled={authLoading}
            style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg,#e8c96a,#c9a84c)', color: '#0d3d1e', fontWeight: 700, fontSize: '0.95rem', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {authLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <a href="/" style={{ display: 'block', marginTop: 20, fontSize: '0.85rem', color: '#777' }}>← Back to Website</a>
        <div style={{ marginTop: 20, padding: '12px', background: '#f8f5ef', borderRadius: 8, fontSize: '0.78rem', color: '#555' }}>
          <strong>Login:</strong><br />
          📧 afrazrai4457@gmail.com<br />
          🔑 RaiAfraz@1993
        </div>
      </div>
    </div>
  )

  // ── ADMIN PANEL ───────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Lato,sans-serif', background: '#f5f5f0' }}>

      {/* Sidebar */}
      <aside style={{ width: 220, background: '#0d3d1e', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/uploads/upload_1.PNG" alt="RAI" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <span style={{ fontFamily: 'Georgia,serif', color: '#c9a84c', fontWeight: 700 }}>Blog CMS</span>
        </div>
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[
            { label: '📋 All Posts', action: () => setView('list'), active: view === 'list' },
            { label: '✏️ New Post', action: () => { setForm({ ...EMPTY }); setView('new') }, active: view === 'new' },
          ].map((item, i) => (
            <button key={i} onClick={item.action} style={{
              padding: '10px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: item.active ? 'rgba(201,168,76,0.2)' : 'transparent',
              color: item.active ? '#c9a84c' : 'rgba(255,255,255,0.75)',
              textAlign: 'left', fontSize: '0.88rem', fontWeight: 500
            }}>{item.label}</button>
          ))}
          <a href="/" style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', textDecoration: 'none' }}>🌐 View Website</a>
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, wordBreak: 'break-all' }}>{user.email}</div>
          <button onClick={logout} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>

        {/* LIST VIEW */}
        {view === 'list' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
              <div>
                <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', color: '#0d3d1e', margin: 0 }}>Legal Insights</h1>
                <p style={{ color: '#777', fontSize: '0.85rem', marginTop: 4 }}>{posts.length} posts total</p>
              </div>
              <button onClick={() => { setForm({ ...EMPTY }); setView('new') }}
                style={{ padding: '10px 20px', background: 'linear-gradient(135deg,#e8c96a,#c9a84c)', color: '#0d3d1e', fontWeight: 700, border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                + New Post
              </button>
            </div>
            {loading ? <p style={{ color: '#777' }}>Loading posts...</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {posts.map(p => (
                  <div key={p.id} style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e8e8e0' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: p.published ? '#16a34a' : '#ca8a04', display: 'block', marginBottom: 4 }}>
                        {p.published ? '🟢 Published' : '🟡 Draft'}
                      </span>
                      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '1rem', color: '#0d3d1e', margin: '0 0 6px' }}>{p.title}</h3>
                      <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', color: '#777', flexWrap: 'wrap', marginBottom: 8 }}>
                        <span style={{ background: 'rgba(13,61,30,0.08)', color: '#155a2e', padding: '2px 8px', borderRadius: 8, fontWeight: 700 }}>{p.category}</span>
                        <span>{p.author}</span>
                        <span>{new Date(p.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: '#666', margin: 0, lineHeight: 1.5 }}>{p.excerpt?.substring(0, 120)}...</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                      <button onClick={() => { setForm({ ...p }); setView('edit') }}
                        style={{ padding: '6px 14px', borderRadius: 6, border: '1.5px solid #d4c08a', background: 'transparent', color: '#555', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => setDelId(p.id)}
                        style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EDIT / NEW VIEW */}
        {(view === 'edit' || view === 'new') && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
              <div>
                <h1 style={{ fontFamily: 'Georgia,serif', fontSize: '1.8rem', color: '#0d3d1e', margin: 0 }}>{view === 'new' ? 'New Post' : 'Edit Post'}</h1>
                <p style={{ color: '#777', fontSize: '0.85rem', marginTop: 4 }}>Fill in the details below</p>
              </div>
              <button onClick={() => setView('list')}
                style={{ padding: '9px 18px', border: '1.5px solid #d4c08a', background: 'transparent', borderRadius: 6, cursor: 'pointer', color: '#555', fontWeight: 600 }}>
                ← Back
              </button>
            </div>
            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
                {/* Left */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { label: 'Post Title *', key: 'title', type: 'input', placeholder: 'e.g. Understanding Tax Law in Pakistan' },
                    { label: 'Short Summary / Excerpt *', key: 'excerpt', type: 'textarea', rows: 3, placeholder: 'A brief 1-2 sentence summary shown on blog list...' },
                    { label: 'Full Article Content *', key: 'content', type: 'textarea', rows: 20, placeholder: 'Write your full article here...\n\nUse **bold** for important terms.\n\nSeparate sections with blank lines.' },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6, color: '#1a1a1a' }}>{f.label}</label>
                      {f.type === 'input' ? (
                        <input required value={(form as any)[f.key] || ''} placeholder={f.placeholder}
                          onChange={e => setForm({ ...form, [f.key]: e.target.value, ...(f.key === 'title' ? { slug: slug(e.target.value) } : {}) })}
                          style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #ddd', borderRadius: 6, fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' }} />
                      ) : (
                        <textarea required rows={f.rows} value={(form as any)[f.key] || ''} placeholder={f.placeholder}
                          onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                          style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #ddd', borderRadius: 6, fontSize: '0.9rem', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box', fontFamily: 'inherit' }} />
                      )}
                    </div>
                  ))}
                </div>
                {/* Right panel */}
                <div style={{ background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #e8e8e0' }}>
                  <h3 style={{ fontFamily: 'Georgia,serif', color: '#0d3d1e', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #eee', fontSize: '1rem' }}>Publish Settings</h3>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Status</label>
                    <select value={form.published ? 'published' : 'draft'}
                      onChange={e => setForm({ ...form, published: e.target.value === 'published' })}
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 6, fontSize: '0.92rem', outline: 'none' }}>
                      <option value="published">🟢 Published</option>
                      <option value="draft">🟡 Draft</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Category *</label>
                    <select required value={form.category || 'Tax Law'}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 6, fontSize: '0.92rem', outline: 'none' }}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>Author</label>
                    <input value={form.author || ''} onChange={e => setForm({ ...form, author: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 6, fontSize: '0.92rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 700, display: 'block', marginBottom: 6 }}>URL Slug</label>
                    <input value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #ddd', borderRadius: 6, fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', color: '#777' }} />
                    <div style={{ fontSize: '0.72rem', color: '#999', marginTop: 4 }}>Auto-generated from title</div>
                  </div>
                  {msg && <div style={{ padding: '10px 14px', borderRadius: 6, fontSize: '0.85rem', marginBottom: 12, background: '#f0faf4', color: '#0d3d1e', border: '1px solid #c6e8d0' }}>{msg}</div>}
                  <button type="submit" disabled={saving}
                    style={{ width: '100%', padding: '12px', background: saving ? '#ccc' : 'linear-gradient(135deg,#e8c96a,#c9a84c)', color: '#0d3d1e', fontWeight: 700, border: 'none', borderRadius: 6, cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.95rem' }}>
                    {saving ? 'Saving...' : view === 'new' ? '🚀 Publish Post' : '💾 Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Delete Modal */}
      {delId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
          onClick={() => setDelId(null)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, maxWidth: 360, width: '90%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Georgia,serif', color: '#0d3d1e', marginBottom: 8 }}>Delete Post?</h3>
            <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 24 }}>This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setDelId(null)}
                style={{ padding: '9px 20px', border: '1.5px solid #d4c08a', background: 'transparent', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={() => del(delId)}
                style={{ padding: '9px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
