import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

interface Post {
  id: number; title: string; slug: string; category: string
  excerpt: string; content: string; author: string; published: boolean; created_at: string
  video_links?: string; documents?: string
}
interface Booking {
  id: number; name: string; phone: string; email: string; case_type: string
  preferred_date: string; preferred_time: string; message: string; status: string; created_at: string
}
interface TimeSlot {
  id: number; day: string; time_slot: string; is_available: boolean
}

const CATEGORIES = ['Tax Law','Cybercrime & FIA','Intellectual Property','Corporate Law','Civil Litigation','Criminal Law','Family Law','Environmental Law','Revenue Law','Constitutional Law','Case Law','General Legal Advice']
const EMPTY_POST = { title:'', slug:'', category:'Tax Law', excerpt:'', content:'', author:'Rai Afraz (Advocate)', published:true, video_links: [] as string[], documents: [] as {name:string,url:string,type:string,size:number}[] }
const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const TIME_OPTIONS = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM']

type View = 'list'|'edit'|'new'|'bookings'|'slots'|'notifications'|'leads'|'chatbot'|'export'

export default function Admin() {
  const [user, setUser]             = useState<any>(null)
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [authError, setAuthError]   = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const [posts, setPosts]           = useState<Post[]>([])
  const [bookings, setBookings]     = useState<Booking[]>([])
  const [slots, setSlots]           = useState<TimeSlot[]>([])
  const [loading, setLoading]       = useState(false)
  const [view, setView]             = useState<View>('list')
  const [editPost, setEditPost]     = useState<any>(EMPTY_POST)
  const [saving, setSaving]         = useState(false)
  const [saveMsg, setSaveMsg]       = useState('')
  const [deleteId, setDeleteId]     = useState<number|null>(null)
  const [bookingFilter, setBookingFilter] = useState('all')
  const [chatEnabled, setChatEnabled]     = useState(true)
  const [welcomeMsg, setWelcomeMsg]       = useState('Hello! Welcome to R&A Law Firm. I am Advocate Noor, your virtual legal assistant. How can I assist you today?')
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [newSlotDay, setNewSlotDay]       = useState('Monday')
  const [newSlotTime, setNewSlotTime]     = useState('09:00 AM')
  const [bookingMenuOpen, setBookingMenuOpen] = useState(false)
  const [uploading, setUploading]         = useState(false)
  const [uploadMsg, setUploadMsg]         = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { if (user) { fetchPosts(); fetchBookings(); fetchSettings(); fetchSlots() } }, [user])

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/blog?admin=1', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch(e) {}
    setLoading(false)
  }

  const fetchBookings = async () => {
    try {
      const token = await getToken()
      const res = await fetch('/api/bookings', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setBookings(Array.isArray(data) ? data : [])
    } catch(e) {}
  }

  const fetchSlots = async () => {
    try {
      const res = await fetch('/api/slots')
      const data = await res.json()
      setSlots(Array.isArray(data) ? data : [])
    } catch(e) {}
  }

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/chatbot-settings')
      const d = await res.json()
      setChatEnabled(d.enabled !== false)
      if (d.welcome_message) setWelcomeMsg(d.welcome_message)
    } catch(e) {}
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    setAuthLoading(false)
  }

  const generateSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    setUploadMsg('')
    try {
      const token = await getToken()
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        })
        if (!res.ok) {
          const err = await res.json()
          setUploadMsg('❌ ' + (err.error || 'Upload failed'))
          continue
        }
        const doc = await res.json()
        setEditPost((prev: any) => ({
          ...prev,
          documents: [...(prev.documents || []), doc]
        }))
        setUploadMsg('✅ ' + file.name + ' uploaded!')
      }
    } catch(err: any) {
      setUploadMsg('❌ Error: ' + err.message)
    }
    setUploading(false)
    e.target.value = ''
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaveMsg('')
    try {
      const token = await getToken()
      const method = view === 'new' ? 'POST' : 'PUT'
      const payload = { ...editPost, video_links: JSON.stringify(editPost.video_links || []), documents: JSON.stringify(editPost.documents || []) }
      const res = await fetch('/api/blog', { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('Save failed')
      setSaveMsg('✅ Saved!')
      await fetchPosts()
      setTimeout(() => { setSaveMsg(''); setView('list') }, 1500)
    } catch(err: any) { setSaveMsg('❌ Error: ' + err.message) }
    setSaving(false)
  }

  const handleDelete = async (id: number) => {
    try {
      const token = await getToken()
      await fetch('/api/blog', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id }) })
      setDeleteId(null); await fetchPosts()
    } catch(e) {}
  }

  const handleBookingStatus = async (id: number, status: string) => {
    try {
      const token = await getToken()
      await fetch('/api/bookings', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, status }) })
      await fetchBookings()
    } catch(e) {}
  }

  const handleDeleteBooking = async (id: number) => {
    try {
      const token = await getToken()
      await fetch('/api/bookings', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id }) })
      await fetchBookings()
    } catch(e) {}
  }

  const handleSaveSettings = async () => {
    try {
      const token = await getToken()
      await fetch('/api/chatbot-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ enabled: chatEnabled, welcome_message: welcomeMsg }) })
      setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 2000)
    } catch(e) {}
  }

  const handleAddSlot = async () => {
    try {
      const token = await getToken()
      await fetch('/api/slots', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ day: newSlotDay, time_slot: newSlotTime, is_available: true }) })
      await fetchSlots()
    } catch(e) {}
  }

  const handleToggleSlot = async (id: number, is_available: boolean) => {
    try {
      const token = await getToken()
      await fetch('/api/slots', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id, is_available: !is_available }) })
      await fetchSlots()
    } catch(e) {}
  }

  const handleDeleteSlot = async (id: number) => {
    try {
      const token = await getToken()
      await fetch('/api/slots', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ id }) })
      await fetchSlots()
    } catch(e) {}
  }

  const exportBookingsCSV = () => {
    const rows = [['ID','Name','Phone','Email','Case Type','Date','Time','Status','Created']]
    bookings.forEach(b => rows.push([String(b.id), b.name, b.phone, b.email||'', b.case_type, b.preferred_date, b.preferred_time, b.status, new Date(b.created_at).toLocaleDateString()]))
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'bookings.csv'; a.click()
  }

  const exportLeadsCSV = () => {
    const rows = [['Name','Phone','Email','Case Type','Date','Time','Message','Status']]
    bookings.forEach(b => rows.push([b.name, b.phone, b.email||'', b.case_type||'', b.preferred_date, b.preferred_time, b.message||'', b.status]))
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'client-leads.csv'; a.click()
  }

  const filteredBookings = bookingFilter === 'all' ? bookings : bookings.filter(b => b.status === bookingFilter)
  const pendingCount = bookings.filter(b => b.status === 'pending').length
  const isBookingView = ['bookings','slots','notifications','leads','chatbot','export'].includes(view)

  const navTo = (v: View) => { setView(v); setBookingMenuOpen(false) }

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
      {/* SIDEBAR */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar__logo">
          <img src="/uploads/upload_1.PNG" alt="RAI" />
          <span>Admin Panel</span>
        </div>
        <nav className="adm-sidebar__nav">

          {/* Blog Posts */}
          <div className="adm-sidebar__section-label">CONTENT</div>
          <button className={`adm-sidebar__link ${view==='list'?'active':''}`} onClick={() => navTo('list')}>📋 Blog Posts</button>
          <button className={`adm-sidebar__link ${view==='new'?'active':''}`} onClick={() => { setEditPost({...EMPTY_POST}); navTo('new') }}>✏️ New Post</button>

          {/* Bookings Menu */}
          <div className="adm-sidebar__section-label" style={{marginTop:'12px'}}>BOOKINGS</div>
          <button
            className={`adm-sidebar__link adm-sidebar__link--parent ${isBookingView?'active':''}`}
            onClick={() => setBookingMenuOpen(!bookingMenuOpen)}
          >
            📅 Bookings
            {pendingCount > 0 && <span className="adm-sidebar__badge">{pendingCount}</span>}
            <span className="adm-sidebar__arrow">{bookingMenuOpen ? '▾' : '▸'}</span>
          </button>

          {bookingMenuOpen && (
            <div className="adm-sidebar__submenu">
              <button className={`adm-sidebar__sublink ${view==='bookings'?'active':''}`} onClick={() => navTo('bookings')}>
                📂 Manage Bookings
              </button>
              <button className={`adm-sidebar__sublink ${view==='slots'?'active':''}`} onClick={() => navTo('slots')}>
                🕐 Time Slots
              </button>
              <button className={`adm-sidebar__sublink ${view==='notifications'?'active':''}`} onClick={() => navTo('notifications')}>
                🔔 Notifications
              </button>
              <button className={`adm-sidebar__sublink ${view==='leads'?'active':''}`} onClick={() => navTo('leads')}>
                👥 Client Leads
              </button>
              <button className={`adm-sidebar__sublink ${view==='chatbot'?'active':''}`} onClick={() => navTo('chatbot')}>
                🤖 Chatbot
              </button>
              <button className={`adm-sidebar__sublink ${view==='export'?'active':''}`} onClick={() => navTo('export')}>
                ⬇️ Export List
              </button>
            </div>
          )}

          <div className="adm-sidebar__section-label" style={{marginTop:'12px'}}>SITE</div>
          <a href="/" className="adm-sidebar__link">🌐 View Website</a>
        </nav>
        <div className="adm-sidebar__user">
          <div className="adm-sidebar__user-email">{user.email}</div>
          <button className="adm-sidebar__logout" onClick={() => supabase.auth.signOut()}>Sign Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="adm-main">

        {/* ── BLOG LIST ── */}
        {view === 'list' && (
          <div>
            <div className="adm-header">
              <div><h1 className="adm-header__title">Legal Insights</h1><p className="adm-header__sub">{posts.length} posts total</p></div>
              <button className="adm-btn adm-btn--gold" onClick={() => { setEditPost({...EMPTY_POST}); setView('new') }}>+ New Post</button>
            </div>
            {loading ? <div className="adm-loading">Loading...</div> : (
              <div className="adm-posts">
                {posts.map(post => (
                  <div key={post.id} className="adm-post-card">
                    <div className="adm-post-card__left">
                      <span className={`adm-post-card__status ${post.published?'published':'draft'}`}>{post.published ? '🟢 Published' : '🟡 Draft'}</span>
                      <h3 className="adm-post-card__title">{post.title}</h3>
                      <div className="adm-post-card__meta">
                        <span className="adm-post-card__cat">{post.category}</span>
                        <span>by {post.author}</span>
                        <span>{new Date(post.created_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</span>
                      </div>
                      <p className="adm-post-card__excerpt">{post.excerpt?.substring(0,120)}...</p>
                    </div>
                    <div className="adm-post-card__actions">
                      <button className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => {
                        let vl: string[] = []
                        try { vl = post.video_links ? JSON.parse(post.video_links) : [] } catch {}
                          let docs: any[] = []
                        try { docs = post.documents ? (typeof post.documents === 'string' ? JSON.parse(post.documents) : post.documents) : [] } catch {}
                        setEditPost({...post, video_links: vl, documents: docs})
                        setView('edit')
                      }}>✏️ Edit</button>
                      <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setDeleteId(post.id)}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BLOG EDITOR ── */}
        {(view === 'edit' || view === 'new') && (
          <div>
            <div className="adm-header">
              <div><h1 className="adm-header__title">{view==='new'?'New Post':'Edit Post'}</h1></div>
              <button className="adm-btn adm-btn--outline" onClick={() => setView('list')}>← Back</button>
            </div>
            <form onSubmit={handleSave} className="adm-editor">
              <div className="adm-editor__grid">
                <div className="adm-editor__main">
                  <div className="adm-form__group"><label>Post Title *</label><input required placeholder="Title..." value={editPost.title} onChange={e => setEditPost({...editPost, title: e.target.value, slug: generateSlug(e.target.value)})} /></div>
                  <div className="adm-form__group"><label>Short Summary *</label><textarea rows={3} required placeholder="Brief summary..." value={editPost.excerpt} onChange={e => setEditPost({...editPost, excerpt: e.target.value})} /></div>
                  <div className="adm-form__group">
                    <label>Full Article Content *</label>
                    <div className="adm-form__hint">Use **bold** for important terms. Separate paragraphs with blank lines.</div>
                    <textarea rows={18} required placeholder="Write full article here..." value={editPost.content} onChange={e => setEditPost({...editPost, content: e.target.value})} />
                  </div>

                  {/* FILE UPLOADS */}
                  <div className="adm-upload-section">
                    <div className="adm-upload-section__header">
                      <h3 className="adm-upload-section__title">📎 Attach Documents</h3>
                      <span className="adm-upload-section__sub">PDF, Word (.doc/.docx), Images (JPG, PNG, GIF) — Max 10MB each</span>
                    </div>
                    <label className="adm-upload-btn">
                      <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp" onChange={handleFileUpload} style={{display:'none'}} />
                      {uploading ? '⏳ Uploading...' : '📁 Choose Files to Upload'}
                    </label>
                    {uploadMsg && <div className="adm-upload-msg">{uploadMsg}</div>}
                    {(editPost.documents || []).length > 0 && (
                      <div className="adm-docs-list">
                        {(editPost.documents || []).map((doc: any, i: number) => (
                          <div key={i} className="adm-doc-item">
                            <span className="adm-doc-item__icon">
                              {doc.type === 'pdf' ? '📄' : doc.type === 'doc' || doc.type === 'docx' ? '📝' : '🖼️'}
                            </span>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="adm-doc-item__name">{doc.name}</a>
                            <span className="adm-doc-item__size">{doc.size ? (doc.size / 1024).toFixed(1) + ' KB' : ''}</span>
                            <button type="button" className="adm-doc-item__remove"
                              onClick={() => setEditPost((prev: any) => ({...prev, documents: (prev.documents||[]).filter((_: any, j: number) => j !== i)}))}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* VIDEO LINKS */}
                  <div className="adm-video-section">
                    <div className="adm-video-section__header">
                      <h3 className="adm-video-section__title">🎥 Video Links</h3>
                      <span className="adm-video-section__sub">YouTube, Facebook, Instagram, TikTok, Vimeo supported</span>
                    </div>
                    {(editPost.video_links || []).map((url: string, i: number) => (
                      <div key={i} className="adm-video-row">
                        <div className="adm-video-row__platform">
                          {url.includes('youtube') || url.includes('youtu.be') ? '▶ YouTube' :
                           url.includes('facebook') || url.includes('fb.watch') ? '📘 Facebook' :
                           url.includes('instagram') ? '📸 Instagram' :
                           url.includes('tiktok') ? '🎵 TikTok' :
                           url.includes('vimeo') ? '🎬 Vimeo' : '🎥 Video'}
                        </div>
                        <input
                          placeholder="Paste video URL here..."
                          value={url}
                          onChange={e => {
                            const updated = [...(editPost.video_links || [])]
                            updated[i] = e.target.value
                            setEditPost({...editPost, video_links: updated})
                          }}
                          className="adm-video-row__input"
                        />
                        <button type="button" className="adm-video-row__remove"
                          onClick={() => {
                            const updated = (editPost.video_links || []).filter((_: string, j: number) => j !== i)
                            setEditPost({...editPost, video_links: updated})
                          }}>✕</button>
                      </div>
                    ))}
                    <button type="button" className="adm-video-add"
                      onClick={() => setEditPost({...editPost, video_links: [...(editPost.video_links || []), '']})}>
                      + Add Video Link
                    </button>
                    <div className="adm-form__hint" style={{marginTop:'8px'}}>Paste any YouTube, Facebook, Instagram, TikTok, or Vimeo URL. Videos will be embedded automatically in the blog post.</div>
                  </div>
                </div>
                <div className="adm-editor__sidebar">
                  <div className="adm-editor__panel">
                    <h3>Publish Settings</h3>
                    <div className="adm-form__group"><label>Status</label><select value={editPost.published?'published':'draft'} onChange={e => setEditPost({...editPost, published: e.target.value==='published'})}><option value="published">🟢 Published</option><option value="draft">🟡 Draft</option></select></div>
                    <div className="adm-form__group"><label>Category *</label><select required value={editPost.category} onChange={e => setEditPost({...editPost, category: e.target.value})}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                    <div className="adm-form__group"><label>Author</label><input value={editPost.author} onChange={e => setEditPost({...editPost, author: e.target.value})} /></div>
                    <div className="adm-form__group"><label>URL Slug</label><input value={editPost.slug} onChange={e => setEditPost({...editPost, slug: e.target.value})} /><div className="adm-form__hint">Auto-generated from title</div></div>
                    {saveMsg && <div className="adm-save-msg">{saveMsg}</div>}
                    <button type="submit" className="adm-btn adm-btn--gold adm-btn--full" disabled={saving}>{saving ? 'Saving...' : view==='new' ? '🚀 Publish Post' : '💾 Save Changes'}</button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ── MANAGE BOOKINGS ── */}
        {view === 'bookings' && (
          <div>
            <div className="adm-header">
              <div><h1 className="adm-header__title">📂 Manage Bookings</h1><p className="adm-header__sub">{bookings.length} total bookings</p></div>
              <button className="adm-btn adm-btn--outline" onClick={exportBookingsCSV}>⬇️ Export CSV</button>
            </div>
            <div className="adm-booking-stats">
              <div className="adm-booking-stat"><span className="adm-booking-stat__num">{bookings.length}</span><span>Total</span></div>
              <div className="adm-booking-stat"><span className="adm-booking-stat__num" style={{color:'#16a34a'}}>{bookings.filter(b=>b.status==='confirmed').length}</span><span>Confirmed</span></div>
              <div className="adm-booking-stat"><span className="adm-booking-stat__num" style={{color:'#ca8a04'}}>{bookings.filter(b=>b.status==='pending').length}</span><span>Pending</span></div>
              <div className="adm-booking-stat"><span className="adm-booking-stat__num" style={{color:'#2563eb'}}>{bookings.filter(b=>b.status==='completed').length}</span><span>Completed</span></div>
              <div className="adm-booking-stat"><span className="adm-booking-stat__num" style={{color:'#dc2626'}}>{bookings.filter(b=>b.status==='cancelled').length}</span><span>Cancelled</span></div>
            </div>
            <div className="adm-booking-filters">
              {['all','confirmed','pending','completed','cancelled'].map(f => (
                <button key={f} className={`adm-btn adm-btn--sm ${bookingFilter===f?'adm-btn--gold':'adm-btn--outline'}`} onClick={() => setBookingFilter(f)}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>
              ))}
            </div>
            <div className="adm-bookings-list">
              {filteredBookings.length === 0 ? (
                <div className="adm-loading">No bookings found.</div>
              ) : filteredBookings.map(b => (
                <div key={b.id} className="adm-booking-card">
                  <div className="adm-booking-card__left">
                    <div className="adm-booking-card__name">{b.name}</div>
                    <div className="adm-booking-card__meta">
                      <a href={`tel:${b.phone}`}>📞 {b.phone}</a>
                      {b.email && <a href={`mailto:${b.email}`}>✉️ {b.email}</a>}
                      <span>⚖️ {b.case_type}</span>
                      <span>📅 {b.preferred_date} at {b.preferred_time}</span>
                    </div>
                    {b.message && <p className="adm-booking-card__msg">"{b.message}"</p>}
                    <div className="adm-booking-card__footer">
                      <span className={`adm-booking-card__status ${b.status}`}>{b.status}</span>
                      <span className="adm-booking-card__date">{new Date(b.created_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</span>
                    </div>
                  </div>
                  <div className="adm-booking-card__actions">
                    <a href={`https://wa.me/92${b.phone.replace(/^0/,'')}`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn--sm" style={{background:'#25d366',color:'white'}}>💬 WA</a>
                    <a href={`tel:${b.phone}`} className="adm-btn adm-btn--sm adm-btn--outline">📞 Call</a>
                    {b.status !== 'completed' && <button className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => handleBookingStatus(b.id,'completed')} style={{color:'#16a34a',borderColor:'#16a34a'}}>✓ Done</button>}
                    {b.status !== 'cancelled' && <button className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => handleBookingStatus(b.id,'cancelled')} style={{color:'#dc2626',borderColor:'#dc2626'}}>✗ Cancel</button>}
                    <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => handleDeleteBooking(b.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TIME SLOTS ── */}
        {view === 'slots' && (
          <div>
            <div className="adm-header">
              <div><h1 className="adm-header__title">🕐 Set Available Time Slots</h1><p className="adm-header__sub">Control which days & times clients can book</p></div>
            </div>
            <div className="adm-settings-card">
              <h3>Add New Time Slot</h3>
              <div className="adm-slots-add">
                <div className="adm-form__group">
                  <label>Day</label>
                  <select value={newSlotDay} onChange={e => setNewSlotDay(e.target.value)}>
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="adm-form__group">
                  <label>Time</label>
                  <select value={newSlotTime} onChange={e => setNewSlotTime(e.target.value)}>
                    {TIME_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <button className="adm-btn adm-btn--gold" onClick={handleAddSlot}>+ Add Slot</button>
              </div>
            </div>
            <div className="adm-settings-card" style={{marginTop:'20px'}}>
              <h3>Current Time Slots</h3>
              {DAYS.map(day => {
                const daySlots = slots.filter(s => s.day === day)
                if (daySlots.length === 0) return null
                return (
                  <div key={day} className="adm-slots-day">
                    <div className="adm-slots-day__name">{day}</div>
                    <div className="adm-slots-day__times">
                      {daySlots.map(slot => (
                        <div key={slot.id} className={`adm-slot-chip ${slot.is_available ? 'available' : 'unavailable'}`}>
                          <span>{slot.time_slot}</span>
                          <button onClick={() => handleToggleSlot(slot.id, slot.is_available)} title={slot.is_available ? 'Disable' : 'Enable'}>
                            {slot.is_available ? '✓' : '✗'}
                          </button>
                          <button onClick={() => handleDeleteSlot(slot.id)} title="Delete" style={{color:'#dc2626'}}>🗑️</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {slots.length === 0 && <p style={{color:'#888', fontSize:'0.9rem'}}>No slots added yet. Add slots above.</p>}
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {view === 'notifications' && (
          <div>
            <div className="adm-header">
              <div><h1 className="adm-header__title">🔔 Booking Notifications</h1><p className="adm-header__sub">Recent booking activity</p></div>
            </div>
            <div className="adm-notif-list">
              {bookings.length === 0 ? (
                <div className="adm-loading">No bookings yet.</div>
              ) : bookings.slice(0, 20).map(b => (
                <div key={b.id} className={`adm-notif-card adm-notif-card--${b.status}`}>
                  <div className="adm-notif-card__icon">
                    {b.status === 'confirmed' ? '✅' : b.status === 'pending' ? '⏳' : b.status === 'completed' ? '🏆' : '❌'}
                  </div>
                  <div className="adm-notif-card__body">
                    <div className="adm-notif-card__title">
                      <strong>{b.name}</strong> booked a consultation
                    </div>
                    <div className="adm-notif-card__detail">
                      📞 {b.phone} · ⚖️ {b.case_type} · 📅 {b.preferred_date} at {b.preferred_time}
                    </div>
                    <div className="adm-notif-card__time">
                      {new Date(b.created_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                    </div>
                  </div>
                  <div className="adm-notif-card__actions">
                    <a href={`https://wa.me/92${b.phone.replace(/^0/,'')}`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn--sm" style={{background:'#25d366',color:'white'}}>💬</a>
                    <a href={`tel:${b.phone}`} className="adm-btn adm-btn--sm adm-btn--outline">📞</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CLIENT LEADS ── */}
        {view === 'leads' && (
          <div>
            <div className="adm-header">
              <div><h1 className="adm-header__title">👥 View Client Leads</h1><p className="adm-header__sub">{bookings.length} total leads</p></div>
              <button className="adm-btn adm-btn--gold" onClick={exportLeadsCSV}>⬇️ Export Leads CSV</button>
            </div>
            <div className="adm-leads-grid">
              {bookings.map(b => (
                <div key={b.id} className="adm-lead-card">
                  <div className="adm-lead-card__avatar">{b.name.charAt(0).toUpperCase()}</div>
                  <div className="adm-lead-card__info">
                    <div className="adm-lead-card__name">{b.name}</div>
                    <div className="adm-lead-card__case">{b.case_type}</div>
                    <div className="adm-lead-card__contact">
                      <a href={`tel:${b.phone}`}>📞 {b.phone}</a>
                      {b.email && <a href={`mailto:${b.email}`}>✉️ {b.email}</a>}
                    </div>
                    <div className="adm-lead-card__date">📅 {b.preferred_date} · {b.preferred_time}</div>
                    {b.message && <div className="adm-lead-card__msg">"{b.message?.substring(0,80)}..."</div>}
                  </div>
                  <div className="adm-lead-card__actions">
                    <a href={`https://wa.me/92${b.phone.replace(/^0/,'')}`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn--sm" style={{background:'#25d366',color:'white'}}>💬 WhatsApp</a>
                    <span className={`adm-booking-card__status ${b.status}`}>{b.status}</span>
                  </div>
                </div>
              ))}
              {bookings.length === 0 && <div className="adm-loading">No leads yet.</div>}
            </div>
          </div>
        )}

        {/* ── CHATBOT ── */}
        {view === 'chatbot' && (
          <div>
            <div className="adm-header">
              <div><h1 className="adm-header__title">🤖 Enable / Disable Chatbot</h1><p className="adm-header__sub">Manage Advocate Noor AI assistant</p></div>
            </div>
            <div className="adm-settings-card">
              <h3>Chatbot Status</h3>
              <div className="adm-settings-toggle">
                <span style={{fontSize:'1rem', fontWeight:600}}>Advocate Noor Chatbot</span>
                <label className="adm-toggle">
                  <input type="checkbox" checked={chatEnabled} onChange={e => setChatEnabled(e.target.checked)} />
                  <span className="adm-toggle__slider" />
                </label>
                <span className={chatEnabled ? 'adm-toggle__label--on' : 'adm-toggle__label--off'} style={{fontWeight:700, fontSize:'1rem'}}>
                  {chatEnabled ? '🟢 Enabled' : '🔴 Disabled'}
                </span>
              </div>
              <div className="adm-form__group" style={{marginTop:'24px'}}>
                <label>Welcome Message</label>
                <textarea rows={4} value={welcomeMsg} onChange={e => setWelcomeMsg(e.target.value)} />
                <div className="adm-form__hint">First message users see when they open the chat.</div>
              </div>
              {settingsSaved && <div className="adm-save-msg">✅ Settings saved!</div>}
              <button className="adm-btn adm-btn--gold" onClick={handleSaveSettings}>💾 Save Settings</button>
            </div>
          </div>
        )}

        {/* ── EXPORT ── */}
        {view === 'export' && (
          <div>
            <div className="adm-header">
              <div><h1 className="adm-header__title">⬇️ Export Client List</h1><p className="adm-header__sub">Download your client data</p></div>
            </div>
            <div className="adm-export-grid">
              <div className="adm-export-card">
                <div className="adm-export-card__icon">📅</div>
                <h3>All Bookings</h3>
                <p>Export complete bookings list with status, dates, contact details.</p>
                <div className="adm-export-card__count">{bookings.length} records</div>
                <button className="adm-btn adm-btn--gold adm-btn--full" onClick={exportBookingsCSV}>⬇️ Download Bookings CSV</button>
              </div>
              <div className="adm-export-card">
                <div className="adm-export-card__icon">👥</div>
                <h3>Client Leads</h3>
                <p>Export client leads with contact info, case type and messages.</p>
                <div className="adm-export-card__count">{bookings.length} leads</div>
                <button className="adm-btn adm-btn--gold adm-btn--full" onClick={exportLeadsCSV}>⬇️ Download Leads CSV</button>
              </div>
              <div className="adm-export-card">
                <div className="adm-export-card__icon">📝</div>
                <h3>Blog Posts</h3>
                <p>Export all published blog articles with categories and content.</p>
                <div className="adm-export-card__count">{posts.length} articles</div>
                <button className="adm-btn adm-btn--gold adm-btn--full" onClick={() => {
                  const rows = [['ID','Title','Category','Author','Published','Date']]
                  posts.forEach(p => rows.push([String(p.id), p.title, p.category, p.author, String(p.published), new Date(p.created_at).toLocaleDateString()]))
                  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'blog-posts.csv'; a.click()
                }}>⬇️ Download Posts CSV</button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Delete Modal */}
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
