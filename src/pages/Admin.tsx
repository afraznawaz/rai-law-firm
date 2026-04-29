import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

const BLOG_CATS = ['Tax Law','Cybercrime & FIA','Intellectual Property','Corporate Law','Civil Litigation','Criminal Law','Family Law','Environmental Law','Revenue Law','Constitutional Law','Case Law','General Legal Advice']
const LIB_CATS = ['Constitutional Law','Criminal Law','Civil Litigation','Tax Law','Family Law','Corporate Law','Revenue Law','Cybercrime & FIA','Intellectual Property','Labour Law','General']
const EMPTY_POST = { title:'', slug:'', category:'Tax Law', excerpt:'', content:'', author:'Rai Afraz (Advocate)', published:true, document_url:'' }
const EMPTY_LIB = { title:'', category:'Constitutional Law', year:'', summary:'', content:'', document_url:'' }

type Section = 'blog' | 'elibrary' | 'messages'

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [section, setSection] = useState<Section>('blog')
  const [posts, setPosts] = useState<any[]>([])
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

  useEffect(() => { if (!user) return; fetchPosts(); fetchBooks(); fetchMessages() }, [user])

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
        <div className="adm-login__logo"><img src="/uploads/upload_1.PNG" alt="RAI" /></div>
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
        <div className="adm-sidebar__logo"><img src="/uploads/upload_1.PNG" alt="RAI" /><span>Admin Panel</span></div>
        <nav className="adm-sidebar__nav">
          <button className={`adm-sidebar__link ${section==='blog'?'active':''}`} onClick={() => { setSection('blog'); setBlogView('list') }}>📝 Blog Posts</button>
          <button className={`adm-sidebar__link ${section==='elibrary'?'active':''}`} onClick={() => { setSection('elibrary'); setLibView('list') }}>📚 E-Library</button>
          <button className={`adm-sidebar__link ${section==='messages'?'active':''}`} onClick={() => { setSection('messages'); setOpenMsg(null) }}>💬 Messages {unread > 0 && <span className="adm-badge">{unread}</span>}</button>
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
      </main>
      {deleteBlogId && <div className="adm-modal-overlay" onClick={() => setDeleteBlogId(null)}><div className="adm-modal" onClick={e => e.stopPropagation()}><h3>Delete Post?</h3><p>Cannot be undone.</p><div className="adm-modal__actions"><button className="adm-btn adm-btn--outline" onClick={() => setDeleteBlogId(null)}>Cancel</button><button className="adm-btn adm-btn--danger" onClick={() => deletePost(deleteBlogId)}>Delete</button></div></div></div>}
      {deleteLibId && <div className="adm-modal-overlay" onClick={() => setDeleteLibId(null)}><div className="adm-modal" onClick={e => e.stopPropagation()}><h3>Delete Document?</h3><p>Cannot be undone.</p><div className="adm-modal__actions"><button className="adm-btn adm-btn--outline" onClick={() => setDeleteLibId(null)}>Cancel</button><button className="adm-btn adm-btn--danger" onClick={() => deleteBook(deleteLibId)}>Delete</button></div></div></div>}
      {deleteMsgId && <div className="adm-modal-overlay" onClick={() => setDeleteMsgId(null)}><div className="adm-modal" onClick={e => e.stopPropagation()}><h3>Delete Message?</h3><p>Cannot be undone.</p><div className="adm-modal__actions"><button className="adm-btn adm-btn--outline" onClick={() => setDeleteMsgId(null)}>Cancel</button><button className="adm-btn adm-btn--danger" onClick={() => deleteMsg(deleteMsgId)}>Delete</button></div></div></div>}
    </div>
  )
}
