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

interface Certificate {
  id: number
  title: string
  description: string
  file_url: string
  file_name: string
  file_type: string
  file_size: number
  created_at: string
}

const CATEGORIES = ['Tax Law', 'Cybercrime & FIA', 'Intellectual Property', 'Corporate Law', 'Civil Litigation', 'Criminal Law', 'Family Law', 'Environmental Law', 'Revenue Law', 'Constitutional Law', 'General Legal Advice']
const EMPTY_POST = { title: '', slug: '', category: 'Tax Law', excerpt: '', content: '', author: 'Rai Afraz (Advocate)', published: true }

export default function Admin() {
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'certificates'>('posts')

  // Blog state
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'list' | 'edit' | 'new'>('list')
  const [editPost, setEditPost] = useState<any>(EMPTY_POST)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Certificates state
  const [certs, setCerts] = useState<Certificate[]>([])
  const [certsLoading, setCertsLoading] = useState(false)
  const [certTitle, setCertTitle] = useState('')
  const [certDesc, setCertDesc] = useState('')
  const [certFile, setCertFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [deleteCertId, setDeleteCertId] = useState<number | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { if (user) { fetchPosts(); fetchCerts() } }, [user])

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
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const fetchCerts = async () => {
    setCertsLoading(true)
    try {
      const res = await fetch('/api/certificates')
      const data = await res.json()
      setCerts(Array.isArray(data) ? data : [])
    } catch (e) { console.error(e) }
    finally { setCertsLoading(false) }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true); setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    setAuthLoading(false)
  }

  const handleLogout = async () => await supabase.auth.signOut()

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setSaveMsg('')
    try {
      const token = await getToken()
      const method = view === 'new' ? 'POST' : 'PUT'
      const res = await fetch('/api/blog', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(editPost)
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Save failed') }
      setSaveMsg('✅ Saved!')
      await fetchPosts()
      setTimeout(() => { setSaveMsg(''); setView('list') }, 1500)
    } catch (err: any) { setSaveMsg('❌ ' + err.message) }
    finally { setSaving(false) }
  }

  const handleDeletePost = async (id: number) => {
    try {
      const token = await getToken()
      await fetch('/api/blog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id })
      })
      setDeleteId(null); await fetchPosts()
    } catch (e) { console.error(e) }
  }

  const handleUploadCert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!certFile || !certTitle) { setUploadMsg('❌ Title aur file dono zaroori hain'); return }

    // Validate file type
    const allowed = ['image/png', 'image/jpeg', 'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(certFile.type)) {
      setUploadMsg('❌ Sirf PNG, JPG, PDF, DOC, DOCX allowed hai'); return
    }
    if (certFile.size > 10 * 1024 * 1024) {
      setUploadMsg('❌ File size 10MB se kam honi chahiye'); return
    }

    setUploading(true); setUploadMsg(''); setUploadProgress(10)

    try {
      const token = await getToken()
      setUploadProgress(30)

      // Upload file via API
      const formData = new FormData()
      formData.append('file', certFile)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })

      setUploadProgress(70)

      if (!uploadRes.ok) {
        const err = await uploadRes.json()
        throw new Error(err.error || 'Upload failed')
      }

      const uploadData = await uploadRes.json()
      setUploadProgress(85)

      // Save record to DB
      const saveRes = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: certTitle,
          description: certDesc,
          file_url: uploadData.url,
          file_name: uploadData.name,
          file_type: uploadData.type,
          file_size: uploadData.size
        })
      })

      if (!saveRes.ok) {
        const err = await saveRes.json()
        throw new Error(err.error || 'Save failed')
      }

      setUploadProgress(100)
      setUploadMsg('✅ Certificate upload ho gaya!')
      setCertTitle(''); setCertDesc(''); setCertFile(null)
      const fileInput = document.getElementById('cert-file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      await fetchCerts()
      setTimeout(() => { setUploadMsg(''); setUploadProgress(0) }, 3000)
    } catch (err: any) {
      setUploadMsg('❌ ' + err.message)
      setUploadProgress(0)
    } finally { setUploading(false) }
  }

  const handleDeleteCert = async (cert: Certificate) => {
    try {
      const token = await getToken()
      // Extract file path from URL
      const urlParts = cert.file_url.split('/certificates/')
      const filePath = urlParts.length > 1 ? urlParts[1] : null
      await fetch('/api/certificates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: cert.id, file_path: filePath })
      })
      setDeleteCertId(null); await fetchCerts()
    } catch (e) { console.error(e) }
  }

  const formatSize = (bytes: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (type: string) => {
    if (!type) return '📄'
    if (type.includes('pdf')) return '📕'
    if (type.includes('word') || type.includes('doc')) return '📘'
    if (type.includes('image')) return '🖼️'
    return '📄'
  }

  if (!user) {
    return (
      <div className="adm-login">
        <div className="adm-login__box">
          <div className="adm-login__logo"><img src="/uploads/upload_1.PNG" alt="RAI & Associates" /></div>
          <h1 className="adm-login__title">CMS Login</h1>
          <p className="adm-login__sub">RAI & Associates — Blog Admin</p>
          <form onSubmit={handleLogin} className="adm-login__form">
            <div className="adm-form__group">
              <label>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
            </div>
            <div className="adm-form__group">
              <label>Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
            </div>
            {authError && <div className="adm-error">{authError}</div>}
            <button type="submit" className="adm-btn adm-btn--gold" disabled={authLoading}>
              {authLoading ? 'Signing in...' : 'Sign In'}
            </button>
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
          <span>CMS Panel</span>
        </div>
        <nav className="adm-sidebar__nav">
          <button className={`adm-sidebar__link ${activeTab === 'posts' && view === 'list' ? 'active' : ''}`}
            onClick={() => { setActiveTab('posts'); setView('list') }}>📋 Blog Posts</button>
          <button className={`adm-sidebar__link ${activeTab === 'posts' && view === 'new' ? 'active' : ''}`}
            onClick={() => { setActiveTab('posts'); setEditPost({ ...EMPTY_POST }); setView('new') }}>✏️ New Post</button>
          <button className={`adm-sidebar__link ${activeTab === 'certificates' ? 'active' : ''}`}
            onClick={() => setActiveTab('certificates')}>🏆 Certificates</button>
          <a href="/" className="adm-sidebar__link">🌐 View Website</a>
        </nav>
        <div className="adm-sidebar__user">
          <div className="adm-sidebar__user-email">{user.email}</div>
          <button className="adm-sidebar__logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main className="adm-main">

        {/* ===== BLOG POSTS ===== */}
        {activeTab === 'posts' && view === 'list' && (
          <div>
            <div className="adm-header">
              <div>
                <h1 className="adm-header__title">Legal Insights</h1>
                <p className="adm-header__sub">{posts.length} post{posts.length !== 1 ? 's' : ''} total</p>
              </div>
              <button className="adm-btn adm-btn--gold" onClick={() => { setEditPost({ ...EMPTY_POST }); setView('new') }}>+ New Post</button>
            </div>
            {loading ? <div className="adm-loading">Loading...</div> : (
              <div className="adm-posts">
                {posts.map(post => (
                  <div key={post.id} className="adm-post-card">
                    <div className="adm-post-card__left">
                      <span className={`adm-post-card__status ${post.published ? 'published' : 'draft'}`}>
                        {post.published ? '🟢 Published' : '🟡 Draft'}
                      </span>
                      <h3 className="adm-post-card__title">{post.title}</h3>
                      <div className="adm-post-card__meta">
                        <span className="adm-post-card__cat">{post.category}</span>
                        <span>by {post.author}</span>
                        <span>{new Date(post.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <p className="adm-post-card__excerpt">{post.excerpt?.substring(0, 120)}...</p>
                    </div>
                    <div className="adm-post-card__actions">
                      <button className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => { setEditPost({ ...post }); setActiveTab('posts'); setView('edit') }}>✏️ Edit</button>
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
              <div>
                <h1 className="adm-header__title">{view === 'new' ? 'New Post' : 'Edit Post'}</h1>
                <p className="adm-header__sub">Fill in the details below</p>
              </div>
              <button className="adm-btn adm-btn--outline" onClick={() => setView('list')}>← Back</button>
            </div>
            <form onSubmit={handleSavePost} className="adm-editor">
              <div className="adm-editor__grid">
                <div className="adm-editor__main">
                  <div className="adm-form__group">
                    <label>Post Title *</label>
                    <input required placeholder="e.g. Understanding Tax Law in Pakistan" value={editPost.title}
                      onChange={e => setEditPost({ ...editPost, title: e.target.value, slug: generateSlug(e.target.value) })} />
                  </div>
                  <div className="adm-form__group">
                    <label>Short Summary / Excerpt *</label>
                    <textarea rows={3} required placeholder="Brief 1-2 sentence summary..." value={editPost.excerpt}
                      onChange={e => setEditPost({ ...editPost, excerpt: e.target.value })} />
                  </div>
                  <div className="adm-form__group">
                    <label>Full Article Content *</label>
                    <div className="adm-form__hint">Tip: Use **bold text** with double asterisks. Separate paragraphs with blank lines.</div>
                    <textarea rows={18} required placeholder="Write your full article here..." value={editPost.content}
                      onChange={e => setEditPost({ ...editPost, content: e.target.value })} />
                  </div>
                </div>
                <div className="adm-editor__sidebar">
                  <div className="adm-editor__panel">
                    <h3>Publish Settings</h3>
                    <div className="adm-form__group">
                      <label>Status</label>
                      <select value={editPost.published ? 'published' : 'draft'}
                        onChange={e => setEditPost({ ...editPost, published: e.target.value === 'published' })}>
                        <option value="published">🟢 Published</option>
                        <option value="draft">🟡 Draft</option>
                      </select>
                    </div>
                    <div className="adm-form__group">
                      <label>Category *</label>
                      <select required value={editPost.category}
                        onChange={e => setEditPost({ ...editPost, category: e.target.value })}>
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

        {/* ===== CERTIFICATES ===== */}
        {activeTab === 'certificates' && (
          <div>
            <div className="adm-header">
              <div>
                <h1 className="adm-header__title">🏆 Certificates & Documents</h1>
                <p className="adm-header__sub">{certs.length} certificate{certs.length !== 1 ? 's' : ''} uploaded</p>
              </div>
            </div>

            {/* Upload Form */}
            <div className="adm-cert-upload">
              <h3 className="adm-cert-upload__title">Upload New Certificate</h3>
              <form onSubmit={handleUploadCert}>
                <div className="adm-editor__grid">
                  <div>
                    <div className="adm-form__group">
                      <label>Certificate Title *</label>
                      <input required placeholder="e.g. Punjab Bar Council Registration" value={certTitle}
                        onChange={e => setCertTitle(e.target.value)} />
                    </div>
                    <div className="adm-form__group">
                      <label>Description (optional)</label>
                      <textarea rows={2} placeholder="Brief description..." value={certDesc}
                        onChange={e => setCertDesc(e.target.value)} />
                    </div>
                    <div className="adm-form__group">
                      <label>Upload File * <span className="adm-form__hint" style={{display:'inline'}}>PNG, JPG, PDF, DOC, DOCX — Max 10MB</span></label>
                      <div className="adm-cert-dropzone" onClick={() => document.getElementById('cert-file')?.click()}>
                        <input id="cert-file" type="file" accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                          style={{ display: 'none' }}
                          onChange={e => setCertFile(e.target.files?.[0] || null)} />
                        {certFile ? (
                          <div className="adm-cert-dropzone__selected">
                            <span>{getFileIcon(certFile.type)}</span>
                            <div>
                              <div className="adm-cert-dropzone__name">{certFile.name}</div>
                              <div className="adm-cert-dropzone__size">{formatSize(certFile.size)}</div>
                            </div>
                            <button type="button" className="adm-cert-dropzone__remove"
                              onClick={e => { e.stopPropagation(); setCertFile(null) }}>✕</button>
                          </div>
                        ) : (
                          <div className="adm-cert-dropzone__empty">
                            <div className="adm-cert-dropzone__icon">📁</div>
                            <div>Click to select file</div>
                            <div className="adm-cert-dropzone__hint">PNG, JPG, PDF, DOC, DOCX</div>
                          </div>
                        )}
                      </div>
                    </div>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="adm-cert-progress">
                        <div className="adm-cert-progress__bar" style={{ width: uploadProgress + '%' }} />
                        <span>{uploadProgress}%</span>
                      </div>
                    )}
                    {uploadMsg && <div className="adm-save-msg">{uploadMsg}</div>}
                    <button type="submit" className="adm-btn adm-btn--gold" disabled={uploading || !certFile || !certTitle}>
                      {uploading ? '⏳ Uploading...' : '📤 Upload Certificate'}
                    </button>
                  </div>
                  <div className="adm-cert-info">
                    <h4>📌 Supported Formats</h4>
                    <div className="adm-cert-formats">
                      <div className="adm-cert-format"><span>🖼️</span><div><strong>PNG / JPG</strong><div>Certificate images, scanned documents</div></div></div>
                      <div className="adm-cert-format"><span>📕</span><div><strong>PDF</strong><div>Official certificates, legal documents</div></div></div>
                      <div className="adm-cert-format"><span>📘</span><div><strong>DOC / DOCX</strong><div>Word documents, agreements</div></div></div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Certificates List */}
            <div className="adm-cert-list">
              <h3 className="adm-cert-list__title">Uploaded Certificates ({certs.length})</h3>
              {certsLoading ? <div className="adm-loading">Loading...</div> : (
                certs.length === 0 ? (
                  <div className="adm-cert-empty">Koi certificate upload nahi hua abhi tak.</div>
                ) : (
                  <div className="adm-cert-grid">
                    {certs.map(cert => (
                      <div key={cert.id} className="adm-cert-card">
                        <div className="adm-cert-card__icon">{getFileIcon(cert.file_type)}</div>
                        <div className="adm-cert-card__info">
                          <div className="adm-cert-card__title">{cert.title}</div>
                          {cert.description && <div className="adm-cert-card__desc">{cert.description}</div>}
                          <div className="adm-cert-card__meta">
                            <span>{cert.file_name}</span>
                            {cert.file_size && <span>{formatSize(cert.file_size)}</span>}
                            <span>{new Date(cert.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <div className="adm-cert-card__actions">
                          <a href={cert.file_url} target="_blank" rel="noopener noreferrer"
                            className="adm-btn adm-btn--sm adm-btn--outline">👁️ View</a>
                          <button className="adm-btn adm-btn--sm adm-btn--danger"
                            onClick={() => setDeleteCertId(cert.id)}>🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </main>

      {/* Delete Post Modal */}
      {deleteId && (
        <div className="adm-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Post?</h3>
            <p>This action cannot be undone.</p>
            <div className="adm-modal__actions">
              <button className="adm-btn adm-btn--outline" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="adm-btn adm-btn--danger" onClick={() => handleDeletePost(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Cert Modal */}
      {deleteCertId && (
        <div className="adm-modal-overlay" onClick={() => setDeleteCertId(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Certificate?</h3>
            <p>File bhi delete ho jayega. Yeh action undo nahi ho sakta.</p>
            <div className="adm-modal__actions">
              <button className="adm-btn adm-btn--outline" onClick={() => setDeleteCertId(null)}>Cancel</button>
              <button className="adm-btn adm-btn--danger"
                onClick={() => { const c = certs.find(x => x.id === deleteCertId); if (c) handleDeleteCert(c) }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
