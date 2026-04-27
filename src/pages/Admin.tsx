import { useState, useEffect, useRef } from 'react'
import supabase from '../lib/supabase'

interface Post {
  id: number; title: string; slug: string; category: string
  excerpt: string; content: string; author: string; published: boolean; created_at: string
}
interface CaseLaw {
  id: number; title: string; court: string; citation: string
  category: string; description: string; file_url: string
  file_type: string; file_name: string; created_at: string
}

const CATEGORIES = ['Tax Law','Cybercrime & FIA','Intellectual Property','Corporate Law','Civil Litigation','Criminal Law','Family Law','Environmental Law','Revenue Law','Constitutional Law','General Legal Advice']
const COURTS = ['Supreme Court of Pakistan','Lahore High Court','Islamabad High Court','Peshawar High Court','Sindh High Court','Balochistan High Court','Federal Shariat Court','Appellate Tribunal Inland Revenue','Banking Court','Family Court','District Court']
const EMPTY_POST = { title:'', slug:'', category:'Tax Law', excerpt:'', content:'', author:'Rai Afraz (Advocate)', published:true }

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts'|'caselaws'>('posts')

  // Posts
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'list'|'edit'|'new'>('list')
  const [editPost, setEditPost] = useState<any>(EMPTY_POST)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [deleteId, setDeleteId] = useState<number|null>(null)
  const [uploadingImg, setUploadingImg] = useState(false)

  // Case Laws
  const [caseLaws, setCaseLaws] = useState<CaseLaw[]>([])
  const [clLoading, setClLoading] = useState(false)
  const [clForm, setClForm] = useState({ title:'', court:'Lahore High Court', citation:'', category:'Tax Law', description:'' })
  const [clFile, setClFile] = useState<File|null>(null)
  const [clUploading, setClUploading] = useState(false)
  const [clMsg, setClMsg] = useState('')
  const [deleteClId, setDeleteClId] = useState<number|null>(null)
  const [clFilter, setClFilter] = useState('All')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { if (user) { fetchPosts(); fetchCaseLaws() } }, [user])

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/blog?admin=1', { headers: { Authorization: `Bearer ${session?.access_token}` } })
      const data = await res.json()
      setPosts(Array.isArray(data) ? data : [])
    } catch(e){} finally { setLoading(false) }
  }

  const fetchCaseLaws = async () => {
    setClLoading(true)
    try {
      const res = await fetch('/api/caselaws')
      const data = await res.json()
      setCaseLaws(Array.isArray(data) ? data : [])
    } catch(e){} finally { setClLoading(false) }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthLoading(true); setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    setAuthLoading(false)
  }

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim()

  const uploadFileToStorage = async (file: File, folder: string = 'uploads') => {
    const { data: { session } } = await supabase.auth.getSession()
    const ext = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`
    const { error } = await supabase.storage.from('documents').upload(fileName, file, { contentType: file.type, upsert: false })
    if (error) throw error
    const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName)
    return { url: publicUrl, fileName: file.name, fileType: file.type }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploadingImg(true)
    try {
      const result = await uploadFileToStorage(file, 'blog-images')
      setEditPost((prev: any) => ({ ...prev, content: prev.content + `\n\n![${file.name}](${result.url})` }))
      setSaveMsg('✅ Image uploaded!')
      setTimeout(() => setSaveMsg(''), 2000)
    } catch(err: any) { setSaveMsg('❌ ' + err.message) }
    finally { setUploadingImg(false); e.target.value = '' }
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

  // Case Law upload
  const handleCLUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clFile) { setClMsg('❌ Please select a file'); return }
    if (!clForm.title) { setClMsg('❌ Please enter a title'); return }
    setClUploading(true); setClMsg('')
    try {
      const result = await uploadFileToStorage(clFile, 'caselaws')
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/caselaws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ ...clForm, file_url: result.url, file_type: result.fileType, file_name: result.fileName })
      })
      if (!res.ok) throw new Error('Upload failed')
      setClMsg('✅ Case Law uploaded successfully!')
      setClForm({ title:'', court:'Lahore High Court', citation:'', category:'Tax Law', description:'' })
      setClFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      await fetchCaseLaws()
      setTimeout(() => setClMsg(''), 3000)
    } catch(err: any) { setClMsg('❌ ' + err.message) }
    finally { setClUploading(false) }
  }

  const handleDeleteCL = async (id: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/caselaws', { method:'DELETE', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${session?.access_token}` }, body: JSON.stringify({ id }) })
      setDeleteClId(null); await fetchCaseLaws()
    } catch(e){}
  }

  const getFileIcon = (fileType: string) => {
    if (!fileType) return '📄'
    if (fileType.includes('pdf')) return '📕'
    if (fileType.includes('word') || fileType.includes('docx') || fileType.includes('doc')) return '📘'
    if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg')) return '🖼️'
    return '📄'
  }

  const filteredCL = clFilter === 'All' ? caseLaws : caseLaws.filter(c => c.category === clFilter)

  if (!user) return (
    <div className="adm-login">
      <div className="adm-login__box">
        <div className="adm-login__logo"><img src="/uploads/upload_1.PNG" alt="RAI & Associates" /></div>
        <h1 className="adm-login__title">CMS Login</h1>
        <p className="adm-login__sub">RAI & Associates — Admin Panel</p>
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
      {/* SIDEBAR */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar__logo">
          <img src="/uploads/upload_1.PNG" alt="RAI" />
          <span>Admin CMS</span>
        </div>
        <nav className="adm-sidebar__nav">
          <div className="adm-sidebar__section">📝 Blog</div>
          <button className={`adm-sidebar__link ${activeTab==='posts'&&view==='list'?'active':''}`} onClick={()=>{setActiveTab('posts');setView('list')}}>📋 All Posts ({posts.length})</button>
          <button className={`adm-sidebar__link ${activeTab==='posts'&&view==='new'?'active':''}`} onClick={()=>{setActiveTab('posts');setView('new');setEditPost({...EMPTY_POST})}}>✏️ New Post</button>
          <div className="adm-sidebar__section" style={{marginTop:'12px'}}>⚖️ Case Laws</div>
          <button className={`adm-sidebar__link ${activeTab==='caselaws'?'active':''}`} onClick={()=>setActiveTab('caselaws')}>📚 All Case Laws ({caseLaws.length})</button>
          <a href="/" className="adm-sidebar__link" style={{marginTop:'16px'}}>🌐 View Website</a>
        </nav>
        <div className="adm-sidebar__user">
          <div className="adm-sidebar__user-email">{user.email}</div>
          <button className="adm-sidebar__logout" onClick={()=>supabase.auth.signOut()}>Sign Out</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="adm-main">

        {/* ===== POSTS ===== */}
        {activeTab==='posts' && view==='list' && (
          <div>
            <div className="adm-header">
              <div><h1 className="adm-header__title">Legal Insights Blog</h1><p className="adm-header__sub">{posts.length} articles total</p></div>
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
                    <textarea rows={3} required placeholder="Brief summary shown on blog list..." value={editPost.excerpt}
                      onChange={e=>setEditPost({...editPost,excerpt:e.target.value})}/>
                  </div>
                  <div className="adm-form__group">
                    <label>Full Article Content *</label>
                    <div className="adm-upload-img">
                      <label className="adm-upload-img__btn">
                        {uploadingImg ? '⏳ Uploading...' : '📷 Insert Image'}
                        <input type="file" accept="image/*" style={{display:'none'}} onChange={handleImageUpload} disabled={uploadingImg}/>
                      </label>
                      <span className="adm-form__hint">Use **bold** for formatting.</span>
                    </div>
                    <textarea rows={18} required placeholder="Write full article..." value={editPost.content}
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
                      {saving?'Saving...':view==='new'?'🚀 Publish':'💾 Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ===== CASE LAWS ===== */}
        {activeTab==='caselaws' && (
          <div>
            <div className="adm-header">
              <div>
                <h1 className="adm-header__title">⚖️ Case Laws</h1>
                <p className="adm-header__sub">{caseLaws.length} case laws uploaded — PDF, Word, PNG supported</p>
              </div>
            </div>

            {/* Upload Form */}
            <div className="adm-cl-upload">
              <h3>📤 Upload New Case Law</h3>
              <form onSubmit={handleCLUpload}>
                <div className="adm-form__row">
                  <div className="adm-form__group">
                    <label>Case Title *</label>
                    <input required placeholder="e.g. Commissioner vs XYZ Ltd 2023" value={clForm.title}
                      onChange={e=>setClForm({...clForm,title:e.target.value})}/>
                  </div>
                  <div className="adm-form__group">
                    <label>Citation</label>
                    <input placeholder="e.g. 2023 PTD 456" value={clForm.citation}
                      onChange={e=>setClForm({...clForm,citation:e.target.value})}/>
                  </div>
                </div>
                <div className="adm-form__row">
                  <div className="adm-form__group">
                    <label>Court *</label>
                    <select value={clForm.court} onChange={e=>setClForm({...clForm,court:e.target.value})}>
                      {COURTS.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="adm-form__group">
                    <label>Category *</label>
                    <select value={clForm.category} onChange={e=>setClForm({...clForm,category:e.target.value})}>
                      {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="adm-form__group">
                  <label>Brief Description</label>
                  <textarea rows={2} placeholder="Key points or summary of this case law..." value={clForm.description}
                    onChange={e=>setClForm({...clForm,description:e.target.value})}/>
                </div>

                {/* File Upload Area */}
                <div className="adm-form__group">
                  <label>Upload File * (PDF, Word .docx, PNG, JPG — max 20MB)</label>
                  <div className="adm-cl-dropzone" onClick={()=>fileInputRef.current?.click()}>
                    {clFile ? (
                      <div className="adm-cl-dropzone__selected">
                        <span className="adm-cl-dropzone__icon">
                          {clFile.type.includes('pdf') ? '📕' : clFile.type.includes('word') || clFile.name.endsWith('.docx') || clFile.name.endsWith('.doc') ? '📘' : '🖼️'}
                        </span>
                        <div className="adm-cl-dropzone__info">
                          <span className="adm-cl-dropzone__name">{clFile.name}</span>
                          <span className="adm-cl-dropzone__size">{(clFile.size/1024/1024).toFixed(2)} MB</span>
                        </div>
                        <button type="button" className="adm-cl-dropzone__remove" onClick={e=>{e.stopPropagation();setClFile(null);if(fileInputRef.current)fileInputRef.current.value=''}}>✕ Remove</button>
                      </div>
                    ) : (
                      <div className="adm-cl-dropzone__empty">
                        <div className="adm-cl-dropzone__formats">
                          <span>📕 PDF</span>
                          <span>📘 Word</span>
                          <span>🖼️ PNG/JPG</span>
                        </div>
                        <p>Click to browse or drag & drop your file here</p>
                        <span className="adm-form__hint">Supports: .pdf, .doc, .docx, .png, .jpg, .jpeg</span>
                      </div>
                    )}
                    <input ref={fileInputRef} type="file"
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                      style={{display:'none'}}
                      onChange={e=>setClFile(e.target.files?.[0]||null)}/>
                  </div>
                </div>

                {clMsg && <div className={`adm-save-msg ${clMsg.includes('❌')?'adm-save-msg--error':''}`}>{clMsg}</div>}
                <button type="submit" className="adm-btn adm-btn--gold" disabled={clUploading||!clFile}>
                  {clUploading ? '⏳ Uploading...' : '📤 Upload Case Law'}
                </button>
              </form>
            </div>

            {/* Filter */}
            <div className="adm-cl-filters">
              <span className="adm-cl-filters__label">Filter:</span>
              {['All', ...CATEGORIES].map(cat=>(
                <button key={cat} className={`adm-cl-filter ${clFilter===cat?'active':''}`} onClick={()=>setClFilter(cat)}>{cat}</button>
              ))}
            </div>

            {/* Case Laws List */}
            {clLoading ? <div className="adm-loading">Loading case laws...</div> : (
              <div className="adm-cl-list">
                {filteredCL.length === 0 && (
                  <div className="adm-cl-empty">
                    <div className="adm-cl-empty__icon">⚖️</div>
                    <p>No case laws uploaded yet.</p>
                    <p className="adm-form__hint">Upload your first case law above!</p>
                  </div>
                )}
                {filteredCL.map(cl=>(
                  <div key={cl.id} className="adm-cl-card">
                    <div className="adm-cl-card__icon">{getFileIcon(cl.file_type)}</div>
                    <div className="adm-cl-card__info">
                      <h4 className="adm-cl-card__title">{cl.title}</h4>
                      <div className="adm-cl-card__meta">
                        {cl.court && <span className="adm-cl-card__court">🏛️ {cl.court}</span>}
                        {cl.citation && <span className="adm-cl-card__citation">📎 {cl.citation}</span>}
                        <span className="adm-cl-card__cat">{cl.category}</span>
                        <span className="adm-cl-card__date">{new Date(cl.created_at).toLocaleDateString('en-PK',{day:'numeric',month:'short',year:'numeric'})}</span>
                      </div>
                      {cl.description && <p className="adm-cl-card__desc">{cl.description}</p>}
                      <div className="adm-cl-card__file">
                        <span>{getFileIcon(cl.file_type)} {cl.file_name}</span>
                      </div>
                    </div>
                    <div className="adm-cl-card__actions">
                      <a href={cl.file_url} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn--sm adm-btn--outline">👁️ View</a>
                      <a href={cl.file_url} download={cl.file_name} className="adm-btn adm-btn--sm adm-btn--outline">⬇️ Download</a>
                      <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={()=>setDeleteClId(cl.id)}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      {/* Delete Case Law Modal */}
      {deleteClId && (
        <div className="adm-modal-overlay" onClick={()=>setDeleteClId(null)}>
          <div className="adm-modal" onClick={e=>e.stopPropagation()}>
            <h3>Delete Case Law?</h3><p>This cannot be undone.</p>
            <div className="adm-modal__actions">
              <button className="adm-btn adm-btn--outline" onClick={()=>setDeleteClId(null)}>Cancel</button>
              <button className="adm-btn adm-btn--danger" onClick={()=>handleDeleteCL(deleteClId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
