import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

interface Post { id: number; title: string; slug: string; category: string; excerpt: string; content: string; author: string; published: boolean; created_at: string }
interface Booking { id: number; name: string; phone: string; case_type: string; booking_date: string; booking_time: string; status: string; notes: string; created_at: string }
interface Slot { id: number; slot_time: string; is_active: boolean }

const CATEGORIES = ['Tax Law', 'Cybercrime & FIA', 'Intellectual Property', 'Corporate Law', 'Civil Litigation', 'Criminal Law', 'Family Law', 'Environmental Law', 'Revenue Law', 'Constitutional Law', 'General Legal Advice']
const EMPTY_POST = { title: '', slug: '', category: 'Tax Law', excerpt: '', content: '', author: 'Rai Afraz (Advocate)', published: true }

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'assistant'>('posts')

  // Blog
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [view, setView] = useState<'list' | 'edit' | 'new'>('list')
  const [editPost, setEditPost] = useState<any>(EMPTY_POST)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Assistant
  const [bookings, setBookings] = useState<Booking[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [chatEnabled, setChatEnabled] = useState(true)
  const [assistantLoading, setAssistantLoading] = useState(false)
  const [bookingFilter, setBookingFilter] = useState('all')
  const [assistantTab, setAssistantTab] = useState<'bookings' | 'slots' | 'settings'>('bookings')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { if (user) { fetchPosts(); fetchAssistantData() } }, [user])

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  const fetchPosts = async () => {
    setPostsLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/blog?admin=1', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setPostsLoading(false) }
  }

  const fetchAssistantData = async () => {
    setAssistantLoading(true)
    try {
      const token = await getToken()
      const [bRes, sRes, cRes] = await Promise.all([
        fetch('/api/bookings', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/slots'),
        fetch('/api/chatbot-settings')
      ])
      const [bData, sData, cData] = await Promise.all([bRes.json(), sRes.json(), cRes.json()])
      setBookings(Array.isArray(bData) ? bData : [])
      setSlots(Array.isArray(sData) ? sData : [])
      setChatEnabled(cData.enabled ?? true)
    } catch (e) { console.error(e) }
    finally { setAssistantLoading(false) }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    setAuthLoading(false)
  }

  const generateSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaveMsg('')
    try {
      const token = await getToken()
      const method = view === 'new' ? 'POST' : 'PUT'
      const res = await fetch('/api/blog', { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(editPost) })
      if (!res.ok) throw new Error('Save failed')
      setSaveMsg('✅ Saved!')
      await fetchPosts()
      setTimeout(() => { setSaveMsg(''); setView('list') }, 1500)
    } catch (err: any) { setSaveMsg('❌ ' + err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    const token = await getToken()
    await fetch('/api/blog', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id }) })
    setDeleteId(null); await fetchPosts()
  }

  const updateBookingStatus = async (id: number, status: string) => {
    const token = await getToken()
    await fetch('/api/bookings', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, status }) })
    await fetchAssistantData()
  }

  const deleteBooking = async (id: number) => {
    const token = await getToken()
    await fetch('/api/bookings', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id }) })
    await fetchAssistantData()
  }

  const toggleSlot = async (id: number, is_active: boolean) => {
    const token = await getToken()
    await fetch('/api/slots', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, is_active: !is_active }) })
    await fetchAssistantData()
  }

  const toggleChatbot = async () => {
    const token = await getToken()
    await fetch('/api/chatbot-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ enabled: !chatEnabled }) })
    setChatEnabled(p => !p)
  }

  const exportCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Case Type', 'Date', 'Time', 'Status', 'Created At']
    const rows = bookings.map(b => [b.id, b.name, b.phone, b.case_type, b.booking_date, b.booking_time, b.status, new Date(b.created_at).toLocaleString()])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'bookings.csv'; a.click()
  }

  const filteredBookings = bookingFilter === 'all' ? bookings : bookings.filter(b => b.status === bookingFilter)
  const pendingCount = bookings.filter(b => b.status === 'pending').length

  if (!user) return (
    <div className="adm-login">
      <div className="adm-login__box">
        <div className="adm-login__logo"><img src="/uploads/upload_1.PNG" alt="RAI" /></div>
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

  return (
    <div className="adm-root">
      <aside className="adm-sidebar">
        <div className="adm-sidebar__logo"><img src="/uploads/upload_1.PNG" alt="RAI" /><span>Admin Panel</span></div>
        <nav className="adm-sidebar__nav">
          <button className={`adm-sidebar__link ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => { setActiveTab('posts'); setView('list') }}>📋 Blog Posts</button>
          <button className={`adm-sidebar__link ${activeTab === 'assistant' ? 'active' : ''}`} onClick={() => setActiveTab('assistant')}>
            ⚖️ Legal Assistant {pendingCount > 0 && <span className="adm-badge">{pendingCount}</span>}
          </button>
          <button className="adm-sidebar__link" onClick={() => { setActiveTab('posts'); setView('new') }}>✏️ New Post</button>
          <a href="/" className="adm-sidebar__link">🌐 View Website</a>
        </nav>
        <div className="adm-sidebar__user">
          <div className="adm-sidebar__user-email">{user.email}</div>
          <button className="adm-sidebar__logout" onClick={() => supabase.auth.signOut()}>Sign Out</button>
        </div>
      </aside>

      <main className="adm-main">
        {/* BLOG TAB */}
        {activeTab === 'posts' && view === 'list' && (
          <div>
            <div className="adm-header">
              <div><h1 className="adm-header__title">Legal Insights Blog</h1><p className="adm-header__sub">{posts.length} posts total</p></div>
              <button className="adm-btn adm-btn--gold" onClick={() => { setEditPost({ ...EMPTY_POST }); setView('new') }}>+ New Post</button>
            </div>
            {postsLoading ? <div className="adm-loading">Loading...</div> : (
              <div className="adm-posts">
                {posts.map(post => (
                  <div key={post.id} className="adm-post-card">
                    <div className="adm-post-card__left">
                      <span className={`adm-post-card__status ${post.published ? 'published' : 'draft'}`}>{post.published ? '🟢 Published' : '🟡 Draft'}</span>
                      <h3 className="adm-post-card__title">{post.title}</h3>
                      <div className="adm-post-card__meta"><span className="adm-post-card__cat">{post.category}</span><span>by {post.author}</span><span>{new Date(post.created_at).toLocaleDateString()}</span></div>
                      <p className="adm-post-card__excerpt">{post.excerpt?.substring(0, 100)}...</p>
                    </div>
                    <div className="adm-post-card__actions">
                      <button className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => { setEditPost({ ...post }); setView('edit') }}>✏️ Edit</button>
                      <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setDeleteId(post.id)}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'posts' && (view === 'edit' || view === 'new') && (
          <div>
            <div className="adm-header">
              <div><h1 className="adm-header__title">{view === 'new' ? 'New Post' : 'Edit Post'}</h1></div>
              <button className="adm-btn adm-btn--outline" onClick={() => setView('list')}>← Back</button>
            </div>
            <form onSubmit={handleSave} className="adm-editor">
              <div className="adm-editor__grid">
                <div className="adm-editor__main">
                  <div className="adm-form__group"><label>Title *</label><input required value={editPost.title} onChange={e => setEditPost({ ...editPost, title: e.target.value, slug: generateSlug(e.target.value) })} /></div>
                  <div className="adm-form__group"><label>Excerpt *</label><textarea rows={3} required value={editPost.excerpt} onChange={e => setEditPost({ ...editPost, excerpt: e.target.value })} /></div>
                  <div className="adm-form__group"><label>Content *</label><div className="adm-form__hint">Use **bold** for important text. Blank line = new paragraph.</div><textarea rows={18} required value={editPost.content} onChange={e => setEditPost({ ...editPost, content: e.target.value })} /></div>
                </div>
                <div className="adm-editor__sidebar">
                  <div className="adm-editor__panel">
                    <h3>Publish Settings</h3>
                    <div className="adm-form__group"><label>Status</label><select value={editPost.published ? 'published' : 'draft'} onChange={e => setEditPost({ ...editPost, published: e.target.value === 'published' })}><option value="published">🟢 Published</option><option value="draft">🟡 Draft</option></select></div>
                    <div className="adm-form__group"><label>Category</label><select value={editPost.category} onChange={e => setEditPost({ ...editPost, category: e.target.value })}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                    <div className="adm-form__group"><label>Author</label><input value={editPost.author} onChange={e => setEditPost({ ...editPost, author: e.target.value })} /></div>
                    <div className="adm-form__group"><label>Slug</label><input value={editPost.slug} onChange={e => setEditPost({ ...editPost, slug: e.target.value })} /><div className="adm-form__hint">Auto-generated</div></div>
                    {saveMsg && <div className="adm-save-msg">{saveMsg}</div>}
                    <button type="submit" className="adm-btn adm-btn--gold adm-btn--full" disabled={saving}>{saving ? 'Saving...' : view === 'new' ? '🚀 Publish' : '💾 Save'}</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* LEGAL ASSISTANT TAB */}
        {activeTab === 'assistant' && (
          <div>
            <div className="adm-header">
              <div><h1 className="adm-header__title">⚖️ Legal Assistant</h1><p className="adm-header__sub">Manage bookings, slots & chatbot</p></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="adm-btn adm-btn--outline" onClick={exportCSV}>📥 Export CSV</button>
                <button className="adm-btn adm-btn--gold" onClick={fetchAssistantData}>🔄 Refresh</button>
              </div>
            </div>

            {/* Sub tabs */}
            <div className="adm-subtabs">
              <button className={`adm-subtab ${assistantTab === 'bookings' ? 'active' : ''}`} onClick={() => setAssistantTab('bookings')}>📅 Bookings {pendingCount > 0 && <span className="adm-badge">{pendingCount}</span>}</button>
              <button className={`adm-subtab ${assistantTab === 'slots' ? 'active' : ''}`} onClick={() => setAssistantTab('slots')}>🕐 Time Slots</button>
              <button className={`adm-subtab ${assistantTab === 'settings' ? 'active' : ''}`} onClick={() => setAssistantTab('settings')}>⚙️ Settings</button>
            </div>

            {assistantLoading && <div className="adm-loading">Loading...</div>}

            {/* BOOKINGS */}
            {!assistantLoading && assistantTab === 'bookings' && (
              <div>
                <div className="adm-booking-filters">
                  {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
                    <button key={f} className={`adm-filter-btn ${bookingFilter === f ? 'active' : ''}`} onClick={() => setBookingFilter(f)}>
                      {f === 'all' ? `All (${bookings.length})` : f === 'pending' ? `⏳ Pending (${bookings.filter(b => b.status === 'pending').length})` : f === 'confirmed' ? `✅ Confirmed (${bookings.filter(b => b.status === 'confirmed').length})` : `❌ Cancelled (${bookings.filter(b => b.status === 'cancelled').length})`}
                    </button>
                  ))}
                </div>
                {filteredBookings.length === 0 ? <div className="adm-empty">No bookings found.</div> : (
                  <div className="adm-bookings-grid">
                    {filteredBookings.map(b => (
                      <div key={b.id} className={`adm-booking-card adm-booking-card--${b.status}`}>
                        <div className="adm-booking-card__top">
                          <div>
                            <div className="adm-booking-card__name">👤 {b.name}</div>
                            <div className="adm-booking-card__phone">📞 {b.phone}</div>
                          </div>
                          <span className={`adm-booking-card__status adm-status--${b.status}`}>
                            {b.status === 'pending' ? '⏳ Pending' : b.status === 'confirmed' ? '✅ Confirmed' : '❌ Cancelled'}
                          </span>
                        </div>
                        <div className="adm-booking-card__details">
                          <span>⚖️ {b.case_type}</span>
                          <span>📅 {b.booking_date}</span>
                          <span>🕐 {b.booking_time}</span>
                        </div>
                        <div className="adm-booking-card__time">Booked: {new Date(b.created_at).toLocaleString()}</div>
                        <div className="adm-booking-card__actions">
                          {b.status !== 'confirmed' && <button className="adm-btn adm-btn--sm" style={{ background: '#16a34a', color: 'white' }} onClick={() => updateBookingStatus(b.id, 'confirmed')}>✅ Confirm</button>}
                          {b.status !== 'cancelled' && <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => updateBookingStatus(b.id, 'cancelled')}>❌ Cancel</button>}
                          <button className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => deleteBooking(b.id)}>🗑️ Delete</button>
                          <a href={`tel:${b.phone}`} className="adm-btn adm-btn--sm" style={{ background: '#0d3d1e', color: '#c9a84c', textDecoration: 'none' }}>📞 Call</a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TIME SLOTS */}
            {!assistantLoading && assistantTab === 'slots' && (
              <div>
                <p style={{ color: 'var(--text-mid)', marginBottom: 20, fontSize: '0.9rem' }}>Toggle time slots on/off. Disabled slots will not be shown to clients.</p>
                <div className="adm-slots-grid">
                  {slots.map(slot => (
                    <div key={slot.id} className={`adm-slot ${slot.is_active ? 'active' : 'inactive'}`}>
                      <span className="adm-slot__time">{slot.slot_time}</span>
                      <button className={`adm-slot__toggle ${slot.is_active ? 'on' : 'off'}`} onClick={() => toggleSlot(slot.id, slot.is_active)}>
                        {slot.is_active ? '✅ ON' : '❌ OFF'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {!assistantLoading && assistantTab === 'settings' && (
              <div className="adm-settings">
                <div className="adm-settings__card">
                  <div className="adm-settings__row">
                    <div>
                      <div className="adm-settings__label">⚖️ Legal Assistant Chatbot</div>
                      <div className="adm-settings__desc">Enable or disable the chatbot on your website</div>
                    </div>
                    <button className={`adm-toggle ${chatEnabled ? 'on' : 'off'}`} onClick={toggleChatbot}>
                      <span className="adm-toggle__knob" />
                    </button>
                  </div>
                  <div className="adm-settings__status">
                    Status: <strong style={{ color: chatEnabled ? '#16a34a' : '#dc2626' }}>{chatEnabled ? '🟢 Active — Chatbot is visible on website' : '🔴 Disabled — Chatbot is hidden from website'}</strong>
                  </div>
                </div>
                <div className="adm-settings__card">
                  <div className="adm-settings__label">📊 Quick Stats</div>
                  <div className="adm-stats-grid">
                    <div className="adm-stat"><span className="adm-stat__num">{bookings.length}</span><span className="adm-stat__lbl">Total Bookings</span></div>
                    <div className="adm-stat"><span className="adm-stat__num">{bookings.filter(b => b.status === 'pending').length}</span><span className="adm-stat__lbl">Pending</span></div>
                    <div className="adm-stat"><span className="adm-stat__num">{bookings.filter(b => b.status === 'confirmed').length}</span><span className="adm-stat__lbl">Confirmed</span></div>
                    <div className="adm-stat"><span className="adm-stat__num">{slots.filter(s => s.is_active).length}</span><span className="adm-stat__lbl">Active Slots</span></div>
                  </div>
                </div>
                <div className="adm-settings__card">
                  <div className="adm-settings__label">📥 Export Client Data</div>
                  <div className="adm-settings__desc">Download all bookings as CSV file</div>
                  <button className="adm-btn adm-btn--gold" style={{ marginTop: 12 }} onClick={exportCSV}>📥 Download Bookings CSV</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {deleteId && (
        <div className="adm-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Post?</h3><p>This cannot be undone.</p>
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
