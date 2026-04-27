import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

interface Post {
  id: number; title: string; slug: string; category: string
  excerpt: string; content: string; author: string; published: boolean; created_at: string
}
interface Certificate {
  id: number; title: string; description: string
  file_url: string; file_type: string; file_name: string; created_at: string
}

const CATEGORIES = ['Tax Law','Cybercrime & FIA','Intellectual Property','Corporate Law','Civil Litigation','Criminal Law','Family Law','Environmental Law','Revenue Law','Constitutional Law','General Legal Advice']
const EMPTY_POST = { title:'', slug:'', category:'Tax Law', excerpt:'', content:'', author:'Rai Afraz (Advocate)', published:true }

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts'|'certificates'>('posts')
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'list'|'edit'|'new'>('list')
  const [editPost, setEditPost] = useState<any>(EMPTY_POST)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [deleteId, setDeleteId] = useState<number|null>(null)
  // Certificates
  const [certs, setCerts] = useState<Certificate[]>([])
  const [certsLoading, setCertsLoading] = useState(false)
  const [certForm, setCertForm] = useState({ title:'', description:'' })
  const [certFile, setCertFile] = useState<File|null>(null)
  const [certUploading, setCertUploading] = useState(false)
  const [certMsg, setCertMsg] = useState('')
  const [deleteCertId, setDeleteCertId] = useState<number|null>(null)
  // Blog image upload
  const [uploadingImg, setUploadingImg] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { if (user) { fetchPosts(); fetchCerts() } }, [user])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/blog?admin=1', { headers: { Authorization: `Bearer ${session?.access_token}` } })
      const data = await res.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch(e){} finally { setLoading(false) }
  }

  const fetchCerts = async () => {
    setCertsLoading(true)
    try {
      const res = await fetch('/api/certificates')
      const data = await res.json()
      setCerts(Array.isArray(data) ? data : [])
    } catch(e){} finally { setCertsLoading(false) }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    setAuthLoading(false)
  }

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim()

  // Upload file to Supabase storage via API
  const uploadFile = async (file: File): Promise<{url:string, fileName:string, fileType:string} | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token}` },
        body: formData
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Upload failed')
      }
      return await res.json()
    } catch(err: any) {
      console.error('Upload error:', err)
      throw err
    }
  }

  // Insert image URL into content textarea
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    try {
      const result = await uploadFile(file)
      if (result) {
        setEditPost((prev: any) => ({ ...prev, content: prev.content + `\n\n![${file.name}](${result.url})` }))
        setSaveMsg('✅ Image uploaded!')
        setTimeout(() => setSaveMsg(''), 2000)
      }
    } catch(err: any) {
      setSaveMsg('❌ Upload failed: ' + err.message)
    } finally { setUploadingImg(false); e.target.value = '' }
  }

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
      setSaveMsg('✅ Saved!')
      await fetchPosts()
      setTimeout(() => { setSaveMsg(''); setView('list') }, 1500)
    } catch(err: any) { setSaveMsg('❌ ' + err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/blog', { method:'DELETE', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${session?.access_token}` }, body: JSON.stringify({ id }) })
      setDeleteId(null); await fetchPosts()
    } catch(e){}
  }

  // Certificate upload
  const handleCertUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!certFile) { setCertMsg('❌ Please select a file'); return }
    if (!certForm.title) { setCertMsg('❌ Please enter a title'); return }
    setCertUploading(true); setCertMsg('')
    try {
      const result = await uploadFile(certFile)
      if (!result) throw new Error('Upload returned no result')
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ title: certForm.title, description: certForm.description, file_url: result.url, file_type: result.fileType, file_name: result.fileName })
      })
      if (!res.ok) throw new Error('Save failed')
      setCertMsg('✅ Certificate uploaded successfully!')
      setCertForm({ title:'', description:'' }); setCertFile(null)
      await fetchCerts()
      setTimeout(() => setCertMsg(''), 3000)
    } catch(err: any) { setCertMsg('❌ ' + err.message) }
    finally { setCertUploading(false) }
  }

  const handleDeleteCert = async (id: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/certificates', { method:'DELETE', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${session?.access_token}` }, body: JSON.stringify({ id }) })
      setDeleteCertId(null); await fetchCerts()
    } catch(e){}
  }

  if (!user) return (
    <div className="adm-login">
      <div className="adm-login__box">
        <div className="adm-login__logo"><img src="/uploads/upload_1.PNG" alt="RAI & Associates" /></div>
        <h1 className="adm-login__title">CMS Login</h1>
        <p className="adm-login__sub">RAI & Associates — Blog Admin</p>
        <form onSubmit={handleLogin} className="adm-login__form">
          <div className="adm-form__group"><label>Email</label><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" /></div>
          <div className="adm-form__group"><label>Password</label><input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" /></div>
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
        <div className="adm-sidebar__logo">
          <img src="/uploads/upload_1.PNG" alt="RAI" />
          <span>Blog CMS</span>
        </div>
        <nav className="adm-sidebar__nav">
          <button className={`adm-sidebar__link ${activeTab==='posts'&&view==='list'?'active':''}`} onClick={()=>{setActiveTab('posts');setView('list')}}>📋 All Posts</button>
          <button className={`adm-sidebar__link ${view==='new'?'active':''}`} onClick={()=>{setActiveTab('posts');setView('new');setEditPost({...EMPTY_POST})}}>✏️ New Post</button>
          <button className={`adm-sidebar__link ${activeTab==='certificates'?'active':''}`} onClick={()=>setActiveTab('certificates')}>🏆 Certificates</button>
          <a href="/" className="adm-sidebar__link">🌐 View Website</a>
        </nav>
        <div className="adm-sidebar__user">
          <div className="adm-sidebar__user-email">{user.email}</div>
          <button className="adm-sidebar__logout" onClick={()=>supabase.auth.signOut()}>Sign Out</button>
        </div>
      </aside>

      <main className="adm-main">

        {/* ===== POSTS TAB ===== */}
        {activeTab==='posts' && view==='list' && (
          <div>
            <div className="adm-header">
              <div><h1 className="adm-header__title">Legal Insights</h1><p className="adm-header__sub">{posts.length} posts total</p></div>
              <button className="adm-btn adm-btn--gold" onClick={()=>{setEditPost({...EMPTY_POST});setView('new')}}>+ New Post</button>
            </div>
            {loading ? <div className="adm-loading">Loading...</div> : (
              <div className="adm-posts">
                {posts.map(post=>(
                  <div key={post.id} className="adm-post-card">
                    <div className="adm-post-card__left">
                      <span className={`adm-post-card__status ${post.published?'published':'draft'}`}>{post.published?'🟢 Published':'🟡 Draft'}</span>
                      <h3 className="adm-post-card__title">{post.title}</h3>
                      <div className="adm-post-card__meta">
                        <span className="adm-post-card__cat">{post.category}</span>
                        <span>{post.author}</span>
                        <span>{new Date(post.created_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</span>
                      </div>
                      <p className="adm-post-card__excerpt">{post.excerpt?.substring(0,120)}...</p>
                    </div>
                    <div className="adm-post-card__actions">
                      <button className="adm-btn adm-btn--sm adm-btn--outline" onClick={()=>{setEditPost({...post});setView('edit')}}>✏️ Edit</button>
                      <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={()=>setDeleteId(post.id)}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab==='posts' && (view==='edit'||view==='new') && (
          <div>
            <div className="adm-header">
              <div><h1 className="adm-header__title">{view==='new'?'New Post':'Edit Post'}</h1></div>
              <button className="adm-btn adm-btn--outline" onClick={()=>setView('list')}>← Back</button>
            </div>
            <form onSubmit={handleSave} className="adm-editor">
              <div className="adm-editor__grid">
                <div className="adm-editor__main">
                  <div className="adm-form__group">
                    <label>Post Title *</label>
                    <input required placeholder="Article title..." value={editPost.title}
                      onChange={e=>setEditPost({...editPost,title:e.target.value,slug:generateSlug(e.target.value)})}/>
                  </div>
                  <div className="adm-form__group">
                    <label>Short Summary *</label>
                    <textarea rows={3} required placeholder="Brief summary..." value={editPost.excerpt}
                      onChange={e=>setEditPost({...editPost,excerpt:e.target.value})}/>
                  </div>
                  <div className="adm-form__group">
                    <label>Full Article Content *</label>
                    <div className="adm-upload-img">
                      <label className="adm-upload-img__btn">
                        {uploadingImg ? '⏳ Uploading...' : '📷 Insert Image'}
                        <input type="file" accept="image/*" style={{display:'none'}} onChange={handleImageUpload} disabled={uploadingImg}/>
                      </label>
                      <span className="adm-form__hint">Use **bold** for formatting. Images auto-inserted at cursor end.</span>
                    </div>
                    <textarea rows={18} required placeholder="Write full article here..." value={editPost.content}
                      onChange={e=>setEditPost({...editPost,content:e.target.value})}/>
                  </div>
                </div>
                <div className="adm-editor__sidebar">
                  <div className="adm-editor__panel">
                    <h3>Publish Settings</h3>
                    <div className="adm-form__group">
                      <label>Status</label>
                      <select value={editPost.published?'published':'draft'} onChange={e=>setEditPost({...editPost,published:e.target.value==='published'})}>
                        <option value="published">🟢 Published</option>
                        <option value="draft">🟡 Draft</option>
                      </select>
                    </div>
                    <div className="adm-form__group">
                      <label>Category *</label>
                      <select required value={editPost.category} onChange={e=>setEditPost({...editPost,category:e.target.value})}>
                        {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="adm-form__group">
                      <label>Author</label>
                      <input value={editPost.author} onChange={e=>setEditPost({...editPost,author:e.target.value})}/>
                    </div>
                    <div className="adm-form__group">
                      <label>URL Slug</label>
                      <input value={editPost.slug} onChange={e=>setEditPost({...editPost,slug:e.target.value})}/>
                      <div className="adm-form__hint">Auto-generated from title</div>
                    </div>
                    {saveMsg && <div className="adm-save-msg">{saveMsg}</div>}
                    <button type="submit" className="adm-btn adm-btn--gold adm-btn--full" disabled={saving}>
                      {saving?'Saving...':view==='new'?'🚀 Publish Post':'💾 Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ===== CERTIFICATES TAB ===== */}
        {activeTab==='certificates' && (
          <div>
            <div className="adm-header">
              <div><h1 className="adm-header__title">Certificates & Documents</h1><p className="adm-header__sub">Upload bar certificates, case laws, PDFs</p></div>
            </div>

            {/* Upload Form */}
            <div className="adm-cert-upload">
              <h3>📤 Upload New Certificate / Document</h3>
              <form onSubmit={handleCertUpload}>
                <div className="adm-form__row">
                  <div className="adm-form__group">
                    <label>Title *</label>
                    <input required placeholder="e.g. Punjab Bar Certificate 2024" value={certForm.title}
                      onChange={e=>setCertForm({...certForm,title:e.target.value})}/>
                  </div>
                  <div className="adm-form__group">
                    <label>Description</label>
                    <input placeholder="Optional description..." value={certForm.description}
                      onChange={e=>setCertForm({...certForm,description:e.target.value})}/>
                  </div>
                </div>
                <div className="adm-form__group">
                  <label>Select File * (Image or PDF, max 10MB)</label>
                  <div className="adm-file-drop" onClick={()=>document.getElementById('cert-file-input')?.click()}>
                    {certFile ? (
                      <div className="adm-file-drop__selected">
                        <span>{certFile.type.includes('pdf') ? '📄' : '🖼️'} {certFile.name}</span>
                        <span className="adm-file-drop__size">({(certFile.size/1024/1024).toFixed(2)} MB)</span>
                        <button type="button" onClick={e=>{e.stopPropagation();setCertFile(null)}} className="adm-file-drop__remove">✕</button>
                      </div>
                    ) : (
                      <div className="adm-file-drop__placeholder">
                        <span className="adm-file-drop__icon">📁</span>
                        <span>Click to select file</span>
                        <span className="adm-form__hint">JPG, PNG, PDF supported</span>
                      </div>
                    )}
                    <input id="cert-file-input" type="file" accept="image/*,.pdf,application/pdf"
                      style={{display:'none'}} onChange={e=>setCertFile(e.target.files?.[0]||null)}/>
                  </div>
                </div>
                {certMsg && <div className={`adm-save-msg ${certMsg.includes('❌')?'adm-save-msg--error':''}`}>{certMsg}</div>}
                <button type="submit" className="adm-btn adm-btn--gold" disabled={certUploading||!certFile}>
                  {certUploading ? '⏳ Uploading...' : '📤 Upload Certificate'}
                </button>
              </form>
            </div>

            {/* Certificates List */}
            <div className="adm-cert-list">
              <h3>📋 Uploaded Certificates ({certs.length})</h3>
              {certsLoading ? <div className="adm-loading">Loading...</div> : (
                <div className="adm-certs-grid">
                  {certs.length === 0 && <p className="adm-loading">No certificates uploaded yet.</p>}
                  {certs.map(cert=>(
                    <div key={cert.id} className="adm-cert-card">
                      <div className="adm-cert-card__preview">
                        {cert.file_type?.includes('pdf') ? (
                          <div className="adm-cert-card__pdf">📄<span>PDF</span></div>
                        ) : (
                          <img src={cert.file_url} alt={cert.title} className="adm-cert-card__img"/>
                        )}
                      </div>
                      <div className="adm-cert-card__info">
                        <div className="adm-cert-card__title">{cert.title}</div>
                        {cert.description && <div className="adm-cert-card__desc">{cert.description}</div>}
                        <div className="adm-cert-card__meta">{new Date(cert.created_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</div>
                      </div>
                      <div className="adm-cert-card__actions">
                        <a href={cert.file_url} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn--sm adm-btn--outline">👁️ View</a>
                        <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={()=>setDeleteCertId(cert.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Delete Post Modal */}
      {deleteId && (
        <div className="adm-modal-overlay" onClick={()=>setDeleteId(null)}>
          <div className="adm-modal" onClick={e=>e.stopPropagation()}>
            <h3>Delete Post?</h3><p>This cannot be undone.</p>
            <div className="adm-modal__actions">
              <button className="adm-btn adm-btn--outline" onClick={()=>setDeleteId(null)}>Cancel</button>
              <button className="adm-btn adm-btn--danger" onClick={()=>handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Cert Modal */}
      {deleteCertId && (
        <div className="adm-modal-overlay" onClick={()=>setDeleteCertId(null)}>
          <div className="adm-modal" onClick={e=>e.stopPropagation()}>
            <h3>Delete Certificate?</h3><p>This cannot be undone.</p>
            <div className="adm-modal__actions">
              <button className="adm-btn adm-btn--outline" onClick={()=>setDeleteCertId(null)}>Cancel</button>
              <button className="adm-btn adm-btn--danger" onClick={()=>handleDeleteCert(deleteCertId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
