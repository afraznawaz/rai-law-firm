import '../admin.css'
import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

const BLOG_CATS = ['Tax Law','Cybercrime & FIA','Intellectual Property','Corporate Law','Civil Litigation','Criminal Law','Family Law','Environmental Law','Revenue Law','Constitutional Law','Case Law','General Legal Advice']
const LIB_CATS = ['Constitutional Law','Criminal Law','Civil Litigation','Tax Law','Family Law','Corporate Law','Revenue Law','Cybercrime & FIA','Intellectual Property','Labour Law','General']
const EMPTY_POST = { title:'', slug:'', category:'Tax Law', excerpt:'', content:'', author:'Rai Afraz (Advocate)', published:true, document_url:'' }
const EMPTY_LIB = { title:'', category:'Constitutional Law', year:'', summary:'', content:'', document_url:'' }

type Section = 'blog' | 'elibrary' | 'messages' | 'google'

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [section, setSection] = useState<Section>('blog')
  const [posts, setPosts] = useState<any[]>([])
  const [googleSyncMsg, setGoogleSyncMsg] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [googleReviews, setGoogleReviews] = useState<any[]>([])
  const [placeId, setPlaceId] = useState('ChIJ...')
  const [apiKey, setApiKey] = useState('')
  const [manualReview, setManualReview] = useState({ author_name: '', rating: 5, text: '', relative_time: 'Recently' })
  const [postsLoading, setPostsLoading] = useState(false)
  const [blogView, setBlogView] = useState<'list'|'new'|'edit'>('list')
  const [editPost, setEditPost] = useState<any>(EMPTY_POST)
  const [blogSaving, setBlogSaving] = useState(false)
  const [blogMsg, setBlogMsg] = useState('')
  const [deleteBlogId, setDeleteBlogId] = useState<number|null>(null)
  const [blogUploading, setBlogUploading] = useState(false)
  const [books, setBooks] = useState<any[]>([])
  const [booksLoading, setBooksLoading] = useState(false)
  const [libView, setLibView] = useState<'list'|'new'|'edit'>('list')
  const [editBook, setEditBook] = useState<any>(EMPTY_LIB)
  const [libSaving, setLibSaving] = useState(false)
  const [libMsg, setLibMsg] = useState('')
  const [deleteLibId, setDeleteLibId] = useState<number|null>(null)
  const [libUploading, setLibUploading] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [msgsLoading, setMsgsLoading] = useState(false)
  const [openMsg, setOpenMsg] = useState<any>(null)
  const [deleteMsgId, setDeleteMsgId] = useState<number|null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { if (!user) return; fetchPosts(); fetchBooks(); fetchMessages(); fetchGoogleReviews() }, [user])

  const fetchGoogleReviews = async () => {
    const res = await fetch('/api/google-reviews')
    const d = await res.json()
    setGoogleReviews(Array.isArray(d.reviews) ? d.reviews : [])
  }

  const handleSync = async () => {
    setSyncing(true); setGoogleSyncMsg('')
    try {
      const token = await getToken()
      const res = await fetch('/api/google-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'sync' })
      })
      const d = await res.json()
      if (d.error) setGoogleSyncMsg(`❌ ${d.error} ${d.setup_required ? '— Please add API key in Vercel env vars' : ''}`)
      else setGoogleSyncMsg(`✅ Synced! ${d.new_inserted} new reviews added. Total: ${d.total_from_google}`)
      fetchGoogleReviews()
    } catch(e: any) { setGoogleSyncMsg('❌ ' + e.message) }
    setSyncing(false)
  }

  const handleManualReview = async (e: React.FormEvent) => {
    e.preventDefault(); setSyncing(true); setGoogleSyncMsg('')
    try {
      const token = await getToken()
      const res = await fetch('/api/google-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action: 'manual_add', ...manualReview })
      })
      if (res.ok) { setGoogleSyncMsg('✅ Review added to website!'); setManualReview({ author_name: '', rating: 5, text: '', relative_time: 'Recently' }); fetchGoogleReviews() }
      else setGoogleSyncMsg('❌ Error adding review')
    } catch(e: any) { setGoogleSyncMsg('❌ ' + e.message) }
    setSyncing(false)
  }

  const getToken = async () => { const { data: { session } } = await supabase.auth.getSession(); return session?.access_token || '' }

  const fetchPosts = async () => { setPostsLoading(true); const token = await getToken(); const res = await fetch('/api/blog?admin=1', { headers: { Authorization: `Bearer ${token}` } }); const d = await res.json(); setPosts(Array.isArray(d) ? d : []); setPostsLoading(false) }
  const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').trim()

  const uploadDoc = async (file: File, type: 'blog' | 'lib') => {
    if (!file) return
    const setUploading = type === 'blog' ? setBlogUploading : setLibUploading
    setUploading(true)
    try {
      const fileName = `${Date.now()}-${file.name.replace(/\s+/g,'-')}`
      const { data, error } = await supabase.storage.from('documents').upload(fileName, file, { contentType: file.type, upsert: false })
      if (!error) {
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
        const url = urlData.publicUrl
        if (type === 'blog') setEditPost((p: any) => ({ ...p, document_url: url }))
        else setEditBook((b: any) => ({ ...b, document_url: url }))
      } else {
        if (file.size > 5 * 1024 * 1024) { alert('File too large. Please create the "documents" bucket in Supabase Storage first.'); return }
        const reader = new FileReader()
        reader.onload = (e) => { const url = e.target?.result as string; if (type === 'blog') setEditPost((p: any) => ({ ...p, document_url: url })); else setEditBook((b: any) => ({ ...b, document_url: url })) }
        reader.readAsDataURL(file)
      }
    } catch (err: any) { alert('Upload error: ' + err.message) } finally { setUploading(false) }
  }

  const savePost = async (e: React.FormEvent) => { e.preventDefault(); setBlogSaving(true); setBlogMsg(''); const token = await getToken(); const method = blogView === 'new' ? 'POST' : 'PUT'; const res = await fetch('/api/blog', { method, headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(editPost) }); if (res.ok) { setBlogMsg('✅ Saved!'); await fetchPosts(); setTimeout(() => { setBlogMsg(''); setBlogView('list') }, 1500) } else setBlogMsg('❌ Error saving'); setBlogSaving(false) }
  const deletePost = async (id: number) => { const token = await getToken(); await fetch('/api/blog', { method:'DELETE', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ id }) }); setDeleteBlogId(null); await fetchPosts() }
  const fetchBooks = async () => { setBooksLoading(true); const res = await fetch('/api/elibrary'); const d = await res.json(); setBooks(Array.isArray(d) ? d : []); setBooksLoading(false) }
  const saveBook = async (e: React.FormEvent) => { e.preventDefault(); setLibSaving(true); setLibMsg(''); const token = await getToken(); const method = libView === 'new' ? 'POST' : 'PUT'; const res = await fetch('/api/elibrary', { method, headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(editBook) }); if (res.ok) { setLibMsg('✅ Saved!'); await fetchBooks(); setTimeout(() => { setLibMsg(''); setLibView('list') }, 1500) } else setLibMsg('❌ Error saving'); setLibSaving(false) }
  const deleteBook = async (id: number) => { const token = await getToken(); await fetch('/api/elibrary', { method:'DELETE', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ id }) }); setDeleteLibId(null); await fetchBooks() }
  const fetchMessages = async () => { setMsgsLoading(true); const token = await getToken(); const res = await fetch('/api/messages', { headers:{ Authorization:`Bearer ${token}` } }); const d = await res.json(); setMessages(Array.isArray(d) ? d : []); setMsgsLoading(false) }
  const markRead = async (msg: any) => { const token = await getToken(); await fetch('/api/messages', { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ id: msg.id, read: true }) }); setOpenMsg({ ...msg, read: true }); await fetchMessages() }
  const deleteMsg = async (id: number) => { const token = await getToken(); await fetch('/api/messages', { method:'DELETE', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ id }) }); setDeleteMsgId(null); setOpenMsg(null); await fetchMessages() }
  const unread = messages.filter(m => !m.read).length

  if (!user) return (
    <div className="adm-login">
      <div className="adm-login__box">
        <div className="adm-login__logo"><img src="/uploads/upload_1.webp" alt="RAI & Associates" width="80" height="80" /></div>
        <h1 className="adm-login__title">Admin Panel</h1>
        <p className="adm-login__sub">RAI & Associates Law Firm</p>
        <form onSubmit={async e => { e.preventDefault(); setAuthLoading(true); setAuthError(''); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setAuthError(error.message); setAuthLoading(false) }} className="adm-login__form">
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
        <div className="adm-sidebar__logo"><img src="/uploads/upload_1.webp" alt="RAI & Associates" width="36" height="36" /><span>Admin Panel</span></div>
        <nav className="adm-sidebar__nav">
          <button className={`adm-sidebar__link ${section==='blog'?'active':''}`} onClick={() => { setSection('blog'); setBlogView('list') }}>📝 Blog Posts</button>
          <button className={`adm-sidebar__link ${section==='elibrary'?'active':''}`} onClick={() => { setSection('elibrary'); setLibView('list') }}>📚 E-Library</button>
          <button className={`adm-sidebar__link ${section==='messages'?'active':''}`} onClick={() => { setSection('messages'); setOpenMsg(null) }}>💬 Messages {unread > 0 && <span className="adm-badge">{unread}</span>}</button>
          <button className={`adm-sidebar__link ${section==='google'?'active':''}`} onClick={() => setSection('google')}>⭐ Google Reviews</button>
          <div className="adm-sidebar__divider" />
          <a href="/" className="adm-sidebar__link">🌐 View Website</a>
        </nav>
        <div className="adm-sidebar__user"><div className="adm-sidebar__user-email">{user.email}</div><button className="adm-sidebar__logout" onClick={() => supabase.auth.signOut()}>Sign Out</button></div>
      </aside>
      <main className="adm-main">
        {section === 'blog' && (
          <div>
            {blogView === 'list' && (<>
              <div className="adm-header"><div><h1 className="adm-header__title">📝 Blog Posts</h1><p className="adm-header__sub">{posts.length} total</p></div><button className="adm-btn adm-btn--gold" onClick={() => { setEditPost(EMPTY_POST); setBlogView('new') }}>+ New Post</button></div>
              {postsLoading ? <div className="adm-loading">Loading...</div> : <div className="adm-posts">{posts.map(p => (<div key={p.id} className="adm-post-card"><div className="adm-post-card__left"><span className={`adm-post-card__status ${p.published?'published':'draft'}`}>{p.published?'🟢 Published':'🟡 Draft'}</span><h3 className="adm-post-card__title">{p.title}</h3><div className="adm-post-card__meta"><span className="adm-post-card__cat">{p.category}</span><span>{new Date(p.created_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</span></div><p className="adm-post-card__excerpt">{p.excerpt?.substring(0,100)}...</p></div><div className="adm-post-card__actions"><button className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => { setEditPost({...p}); setBlogView('edit') }}>✏️ Edit</button><button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setDeleteBlogId(p.id)}>🗑️</button></div></div>))}</div>}
            </>)}
            {(blogView==='new'||blogView==='edit') && (<>
              <div className="adm-header"><div><h1 className="adm-header__title">{blogView==='new'?'New Post':'Edit Post'}</h1></div><button className="adm-btn adm-btn--outline" onClick={() => setBlogView('list')}>← Back</button></div>
              <form onSubmit={savePost} className="adm-editor"><div className="adm-editor__grid"><div className="adm-editor__main">
                <div className="adm-form__group"><label>Title *</label><input required value={editPost.title} onChange={e => setEditPost({...editPost, title:e.target.value, slug:slugify(e.target.value)})} placeholder="Post title..." /></div>
                <div className="adm-form__group"><label>Excerpt *</label><textarea rows={2} required value={editPost.excerpt} onChange={e => setEditPost({...editPost, excerpt:e.target.value})} placeholder="Short summary..." /></div>
                <div className="adm-form__group"><label>Full Content *</label><div className="adm-form__hint">Use **bold** for important text.</div><textarea rows={16} required value={editPost.content} onChange={e => setEditPost({...editPost, content:e.target.value})} placeholder="Write full article here..." /></div>
                <div className="adm-form__group adm-upload-box"><label>📎 Attach Document — Optional</label><div className="adm-upload-area"><input type="file" accept=".pdf,.doc,.docx" id="blog-doc-upload" style={{display:'none'}} onChange={e => e.target.files?.[0] && uploadDoc(e.target.files[0], 'blog')} /><label htmlFor="blog-doc-upload" className="adm-upload-btn">{blogUploading ? '⏳ Uploading...' : '📂 Choose File'}</label>{editPost.document_url && <div className="adm-upload-preview"><a href={editPost.document_url} target="_blank" rel="noopener noreferrer">📄 View Document</a><button type="button" onClick={() => setEditPost({...editPost, document_url:''})} className="adm-upload-remove">✕</button></div>}</div></div>
              </div><div className="adm-editor__sidebar"><div className="adm-editor__panel"><h3>Settings</h3>
                <div className="adm-form__group"><label>Status</label><select value={editPost.published?'published':'draft'} onChange={e => setEditPost({...editPost, published:e.target.value==='published'})}><option value="published">🟢 Published</option><option value="draft">🟡 Draft</option></select></div>
                <div className="adm-form__group"><label>Category *</label><select required value={editPost.category} onChange={e => setEditPost({...editPost, category:e.target.value})}>{BLOG_CATS.map(c => <option key={c}>{c}</option>)}</select></div>
                <div className="adm-form__group"><label>Author</label><input value={editPost.author} onChange={e => setEditPost({...editPost, author:e.target.value})} /></div>
                <div className="adm-form__group"><label>URL Slug</label><input value={editPost.slug} onChange={e => setEditPost({...editPost, slug:e.target.value})} /></div>
                {blogMsg && <div className="adm-save-msg">{blogMsg}</div>}
                <button type="submit" className="adm-btn adm-btn--gold adm-btn--full" disabled={blogSaving}>{blogSaving?'Saving...':blogView==='new'?'🚀 Publish':'💾 Save'}</button>
              </div></div></div></form>
            </>)}
          </div>
        )}
        {section === 'elibrary' && (
          <div>
            {libView === 'list' && (<>
              <div className="adm-header"><div><h1 className="adm-header__title">📚 E-Library</h1><p className="adm-header__sub">{books.length} documents</p></div><button className="adm-btn adm-btn--gold" onClick={() => { setEditBook(EMPTY_LIB); setLibView('new') }}>+ Add Document</button></div>
              {booksLoading ? <div className="adm-loading">Loading...</div> : <div className="adm-lib-grid">{books.map(b => (<div key={b.id} className="adm-lib-card"><div className="adm-lib-card__icon">📄</div><div className="adm-lib-card__info"><div className="adm-lib-card__cat">{b.category}</div><h3 className="adm-lib-card__title">{b.title}</h3><div className="adm-lib-card__year">{b.year}</div><p className="adm-lib-card__sum">{b.summary?.substring(0,80)}...</p></div><div className="adm-lib-card__actions"><button className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => { setEditBook({...b}); setLibView('edit') }}>✏️</button><button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setDeleteLibId(b.id)}>🗑️</button></div></div>))}</div>}
            </>)}
            {(libView==='new'||libView==='edit') && (<>
              <div className="adm-header"><div><h1 className="adm-header__title">{libView==='new'?'Add Document':'Edit Document'}</h1></div><button className="adm-btn adm-btn--outline" onClick={() => setLibView('list')}>← Back</button></div>
              <form onSubmit={saveBook} className="adm-editor"><div className="adm-editor__grid"><div className="adm-editor__main">
                <div className="adm-form__group"><label>Title *</label><input required value={editBook.title} onChange={e => setEditBook({...editBook, title:e.target.value})} placeholder="e.g. Pakistan Penal Code 1860" /></div>
                <div className="adm-form__group"><label>Summary *</label><textarea rows={3} required value={editBook.summary} onChange={e => setEditBook({...editBook, summary:e.target.value})} placeholder="Brief description..." /></div>
                <div className="adm-form__group"><label>Full Content</label><textarea rows={16} value={editBook.content} onChange={e => setEditBook({...editBook, content:e.target.value})} placeholder="Paste full legal text here..." /></div>
                <div className="adm-form__group adm-upload-box"><label>📎 Attach Document — Optional</label><div className="adm-upload-area"><input type="file" accept=".pdf,.doc,.docx" id="lib-doc-upload" style={{display:'none'}} onChange={e => e.target.files?.[0] && uploadDoc(e.target.files[0], 'lib')} /><label htmlFor="lib-doc-upload" className="adm-upload-btn">{libUploading ? '⏳ Uploading...' : '📂 Choose File'}</label>{editBook.document_url && <div className="adm-upload-preview"><a href={editBook.document_url} target="_blank" rel="noopener noreferrer">📄 View Document</a><button type="button" onClick={() => setEditBook({...editBook, document_url:''})} className="adm-upload-remove">✕</button></div>}</div></div>
              </div><div className="adm-editor__sidebar"><div className="adm-editor__panel"><h3>Details</h3>
                <div className="adm-form__group"><label>Category *</label><select required value={editBook.category} onChange={e => setEditBook({...editBook, category:e.target.value})}>{LIB_CATS.map(c => <option key={c}>{c}</option>)}</select></div>
                <div className="adm-form__group"><label>Year</label><input value={editBook.year} onChange={e => setEditBook({...editBook, year:e.target.value})} placeholder="e.g. 2001" /></div>
                {libMsg && <div className="adm-save-msg">{libMsg}</div>}
                <button type="submit" className="adm-btn adm-btn--gold adm-btn--full" disabled={libSaving}>{libSaving?'Saving...':libView==='new'?'📚 Add':'💾 Save'}</button>
              </div></div></div></form>
            </>)}
          </div>
        )}
        {section === 'messages' && (
          <div>
            <div className="adm-header"><div><h1 className="adm-header__title">💬 Messages</h1><p className="adm-header__sub">{messages.length} total · {unread} unread</p></div><button className="adm-btn adm-btn--outline" onClick={fetchMessages}>🔄 Refresh</button></div>
            {msgsLoading ? <div className="adm-loading">Loading...</div> : (
              <div className="adm-msgs-layout">
                <div className="adm-msgs-list">{messages.length === 0 && <div className="adm-msgs-empty">📭 No messages yet</div>}{messages.map(m => (<div key={m.id} className={`adm-msg-item ${!m.read?'unread':''} ${openMsg?.id===m.id?'active':''}`} onClick={() => { setOpenMsg(m); if (!m.read) markRead(m) }}><div className="adm-msg-item__top"><span className="adm-msg-item__name">{m.name}</span>{!m.read && <span className="adm-msg-item__dot" />}</div><div className="adm-msg-item__sub">{m.subject || 'General Inquiry'}</div><div className="adm-msg-item__preview">{m.message?.substring(0,60)}...</div><div className="adm-msg-item__date">{new Date(m.created_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</div></div>))}</div>
                <div className="adm-msg-detail">{!openMsg ? <div className="adm-msg-detail__empty"><div className="adm-msg-detail__empty-icon">💬</div><p>Select a message to read</p></div> : (<><div className="adm-msg-detail__header"><div><h2 className="adm-msg-detail__subject">{openMsg.subject || 'General Inquiry'}</h2><div className="adm-msg-detail__from">From: <strong>{openMsg.name}</strong></div></div><button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setDeleteMsgId(openMsg.id)}>🗑️ Delete</button></div><div className="adm-msg-detail__meta">{openMsg.phone && <span>📞 {openMsg.phone}</span>}{openMsg.email && <span>✉️ {openMsg.email}</span>}<span>🕐 {new Date(openMsg.created_at).toLocaleString('en-PK')}</span></div><div className="adm-msg-detail__body">{openMsg.message}</div><div className="adm-msg-detail__actions">{openMsg.phone && <a href={`tel:${openMsg.phone}`} className="adm-btn adm-btn--gold">📞 Call Back</a>}{openMsg.phone && <a href={`https://wa.me/92${openMsg.phone.replace(/^0/,'')}`} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn--outline">💬 WhatsApp</a>}{openMsg.email && <a href={`mailto:${openMsg.email}`} className="adm-btn adm-btn--outline">✉️ Email</a>}</div></>)}</div>
              </div>
            )}
          </div>
        )}

        {/* GOOGLE REVIEWS SECTION */}
        {section === 'google' && (
          <div>
            <div className="adm-header">
              <div><h1 className="adm-header__title">⭐ Google Reviews</h1><p className="adm-header__sub">Sync & manage your Google Business Profile reviews</p></div>
            </div>

            {/* Sync Panel */}
            <div className="adm-google-panel">
              <div className="adm-google-panel__header">
                <svg viewBox="0 0 24 24" width="32" height="32"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                <div>
                  <h3>Auto-Sync Google Reviews</h3>
                  <p>Fetch reviews directly from your Google Business Profile</p>
                </div>
              </div>
              <div className="adm-google-steps">
                <div className="adm-google-step"><span>1</span><div><strong>Get Google Places API Key</strong><p>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer">console.cloud.google.com</a> → Enable "Places API" → Create API Key</p></div></div>
                <div className="adm-google-step"><span>2</span><div><strong>Add to Vercel Environment Variables</strong><p>Vercel Dashboard → Your Project → Settings → Environment Variables → Add:<br/><code>GOOGLE_PLACES_API_KEY</code> = your key<br/><code>GOOGLE_PLACE_ID</code> = <code>ChIJN1t_tDeuEmsRUsoyG83frY4</code> (find yours below)</p></div></div>
                <div className="adm-google-step"><span>3</span><div><strong>Find Your Place ID</strong><p><a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank" rel="noopener noreferrer">Click here to find Place ID</a> → Search "Rai & Associates Law Firm Lahore"</p></div></div>
                <div className="adm-google-step"><span>4</span><div><strong>Click Sync</strong><p>After adding env vars and redeploying, click Sync to import all Google reviews automatically</p></div></div>
              </div>
              {googleSyncMsg && <div className="adm-save-msg" style={{marginBottom:'12px'}}>{googleSyncMsg}</div>}
              <button className="adm-btn adm-btn--gold" onClick={handleSync} disabled={syncing}>
                {syncing ? '🔄 Syncing...' : '🔄 Sync Google Reviews Now'}
              </button>
              <span style={{marginLeft:'12px', fontSize:'0.8rem', color:'#888'}}>{googleReviews.length} reviews currently on website</span>
            </div>

            {/* Manual Add */}
            <div className="adm-google-panel" style={{marginTop:'24px'}}>
              <h3 style={{marginBottom:'16px', fontFamily:'var(--font-serif)', color:'var(--green-dark)'}}>➕ Manually Add a Google Review</h3>
              <p style={{fontSize:'0.85rem', color:'#666', marginBottom:'16px'}}>If a client left a review on Google, you can manually add it here to display on website.</p>
              <form onSubmit={handleManualReview}>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                  <div className="adm-form__group"><label>Reviewer Name *</label><input required placeholder="e.g. Muhammad Ali" value={manualReview.author_name} onChange={e => setManualReview({...manualReview, author_name: e.target.value})} /></div>
                  <div className="adm-form__group"><label>Rating *</label><select value={manualReview.rating} onChange={e => setManualReview({...manualReview, rating: +e.target.value})}><option value={5}>★★★★★ (5)</option><option value={4}>★★★★☆ (4)</option><option value={3}>★★★☆☆ (3)</option><option value={2}>★★☆☆☆ (2)</option><option value={1}>★☆☆☆☆ (1)</option></select></div>
                </div>
                <div className="adm-form__group"><label>Review Text</label><textarea rows={3} placeholder="What the client wrote on Google..." value={manualReview.text} onChange={e => setManualReview({...manualReview, text: e.target.value})} /></div>
                <div className="adm-form__group"><label>Time (e.g. "2 weeks ago")</label><input placeholder="e.g. 3 days ago" value={manualReview.relative_time} onChange={e => setManualReview({...manualReview, relative_time: e.target.value})} /></div>
                <button type="submit" className="adm-btn adm-btn--gold" disabled={syncing}>Add Review to Website</button>
              </form>
            </div>

            {/* Current Google Reviews */}
            {googleReviews.length > 0 && (
              <div style={{marginTop:'24px'}}>
                <h3 style={{fontFamily:'var(--font-serif)', color:'var(--green-dark)', marginBottom:'16px'}}>Reviews on Website ({googleReviews.length})</h3>
                <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                  {googleReviews.map((r: any) => (
                    <div key={r.id} className="adm-post-card">
                      <div className="adm-post-card__left">
                        <div style={{color:'#f59e0b', marginBottom:'4px'}}>{'★'.repeat(r.rating)}</div>
                        <div className="adm-post-card__title">{r.author_name}</div>
                        <div className="adm-post-card__meta"><span>{r.relative_time}</span></div>
                        <p className="adm-post-card__excerpt">{r.text?.substring(0,120)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      {deleteBlogId && <div className="adm-modal-overlay" onClick={() => setDeleteBlogId(null)}><div className="adm-modal" onClick={e => e.stopPropagation()}><h3>Delete Post?</h3><p>Cannot be undone.</p><div className="adm-modal__actions"><button className="adm-btn adm-btn--outline" onClick={() => setDeleteBlogId(null)}>Cancel</button><button className="adm-btn adm-btn--danger" onClick={() => deletePost(deleteBlogId)}>Delete</button></div></div></div>}
      {deleteLibId && <div className="adm-modal-overlay" onClick={() => setDeleteLibId(null)}><div className="adm-modal" onClick={e => e.stopPropagation()}><h3>Delete Document?</h3><p>Cannot be undone.</p><div className="adm-modal__actions"><button className="adm-btn adm-btn--outline" onClick={() => setDeleteLibId(null)}>Cancel</button><button className="adm-btn adm-btn--danger" onClick={() => deleteBook(deleteLibId)}>Delete</button></div></div></div>}
      {deleteMsgId && <div className="adm-modal-overlay" onClick={() => setDeleteMsgId(null)}><div className="adm-modal" onClick={e => e.stopPropagation()}><h3>Delete Message?</h3><p>Cannot be undone.</p><div className="adm-modal__actions"><button className="adm-btn adm-btn--outline" onClick={() => setDeleteMsgId(null)}>Cancel</button><button className="adm-btn adm-btn--danger" onClick={() => deleteMsg(deleteMsgId)}>Delete</button></div></div></div>}
    </div>
  )
}
