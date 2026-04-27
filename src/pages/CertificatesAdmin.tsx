import { useState, useEffect, useRef } from 'react'
import supabase from '../lib/supabase'

interface Certificate {
  id: number
  title: string
  issuer: string
  date: string
  description: string
  image_url: string
  file_url: string
  file_type: string
  category: string
  published: boolean
  created_at: string
}

const EMPTY: any = {
  title: '', issuer: '', date: '', description: '',
  image_url: '', file_url: '', file_type: '',
  category: 'Bar Membership', published: true
}

const CATS = ['Bar Membership', 'Court Appearance', 'Award', 'Training & Education', 'Professional Certification', 'Case Win', 'Other']

async function uploadFile(file: File, bucket: string, token: string): Promise<{url: string, type: string}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const base64 = ev.target?.result as string
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fileName: file.name, fileType: file.type, fileData: base64, bucket })
        })
        const data = await res.json()
        if (data.url) resolve({ url: data.url, type: file.type })
        else reject(new Error(data.error || 'Upload failed'))
      } catch (e) { reject(e) }
    }
    reader.onerror = () => reject(new Error('File read error'))
    reader.readAsDataURL(file)
  })
}

export default function CertificatesAdmin() {
  const [items, setItems] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list'|'new'|'edit'>('list')
  const [form, setForm] = useState<any>({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [deleteId, setDeleteId] = useState<number|null>(null)
  const [uploading, setUploading] = useState<'image'|'pdf'|null>(null)
  const [uploadMsg, setUploadMsg] = useState('')
  const imgRef = useRef<HTMLInputElement>(null)
  const pdfRef = useRef<HTMLInputElement>(null)

  const fetchItems = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/certificates?admin=1', { headers: { Authorization: `Bearer ${session?.access_token}` } })
    const data = await res.json()
    setItems(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const handleUpload = async (file: File, type: 'image' | 'pdf') => {
    setUploading(type)
    setUploadMsg(`⏳ Uploading ${type === 'pdf' ? 'PDF' : 'image'}...`)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const result = await uploadFile(file, 'certificates', session?.access_token || '')
      if (type === 'image') {
        setForm((f: any) => ({ ...f, image_url: result.url }))
        setUploadMsg(`✅ Image uploaded: ${file.name}`)
      } else {
        setForm((f: any) => ({ ...f, file_url: result.url, file_type: result.type }))
        setUploadMsg(`✅ PDF uploaded: ${file.name}`)
      }
    } catch (err: any) {
      setUploadMsg(`❌ Upload failed: ${err.message}`)
    } finally { setUploading(null) }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const method = view === 'new' ? 'POST' : 'PUT'
      const res = await fetch('/api/certificates', {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Save failed')
      setMsg('✅ Saved!')
      await fetchItems()
      setTimeout(() => { setMsg(''); setView('list') }, 1500)
    } catch (err: any) { setMsg('❌ ' + err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/certificates', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ id }) })
    setDeleteId(null); fetchItems()
  }

  return (
    <div className="adm-tab-content">
      {view === 'list' && (
        <>
          <div className="adm-header">
            <div><h1 className="adm-header__title">Certificates</h1><p className="adm-header__sub">{items.length} certificate{items.length !== 1 ? 's' : ''} total</p></div>
            <button className="adm-btn adm-btn--gold" onClick={() => { setForm({...EMPTY}); setUploadMsg(''); setView('new') }}>+ Add Certificate</button>
          </div>
          {loading ? <div className="adm-loading">Loading...</div> : (
            <div className="adm-certs-grid">
              {items.map(item => (
                <div key={item.id} className="adm-cert-card">
                  {item.image_url && !item.image_url.startsWith('data:') ? (
                    <div className="adm-cert-card__img"><img src={item.image_url} alt={item.title} /></div>
                  ) : item.file_url ? (
                    <div className="adm-cert-card__placeholder">📄</div>
                  ) : (
                    <div className="adm-cert-card__placeholder">🏆</div>
                  )}
                  <div className="adm-cert-card__body">
                    <span className={`adm-post-card__status ${item.published ? 'published' : 'draft'}`}>{item.published ? '🟢 Published' : '🟡 Hidden'}</span>
                    <h3 className="adm-cert-card__title">{item.title}</h3>
                    <p className="adm-cert-card__meta">{item.issuer} · {item.date}</p>
                    <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginTop:'4px'}}>
                      <span className="adm-post-card__cat">{item.category}</span>
                      {item.file_url && <span className="adm-post-card__cat" style={{background:'#fee2e2',color:'#dc2626'}}>📄 PDF</span>}
                      {item.image_url && <span className="adm-post-card__cat" style={{background:'#dcfce7',color:'#16a34a'}}>🖼️ Image</span>}
                    </div>
                  </div>
                  <div className="adm-cert-card__actions">
                    <button className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => { setForm({...item}); setUploadMsg(''); setView('edit') }}>✏️ Edit</button>
                    <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setDeleteId(item.id)}>🗑️</button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <div className="adm-empty">No certificates yet. Add your first one!</div>}
            </div>
          )}
        </>
      )}

      {(view === 'new' || view === 'edit') && (
        <>
          <div className="adm-header">
            <div><h1 className="adm-header__title">{view === 'new' ? 'Add Certificate' : 'Edit Certificate'}</h1></div>
            <button className="adm-btn adm-btn--outline" onClick={() => setView('list')}>← Back</button>
          </div>
          <form onSubmit={handleSave} className="adm-editor">
            <div className="adm-editor__grid">
              <div className="adm-editor__main">
                <div className="adm-form__group">
                  <label>Certificate Title *</label>
                  <input required placeholder="e.g. Lahore Tax Bar Association Membership" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div className="adm-form__row2">
                  <div className="adm-form__group">
                    <label>Issuing Authority</label>
                    <input placeholder="e.g. Punjab Bar Council" value={form.issuer} onChange={e => setForm({...form, issuer: e.target.value})} />
                  </div>
                  <div className="adm-form__group">
                    <label>Date / Year</label>
                    <input placeholder="e.g. 2024" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                  </div>
                </div>
                <div className="adm-form__group">
                  <label>Description</label>
                  <textarea rows={3} placeholder="Brief description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>

                {uploadMsg && (
                  <div className={`adm-upload-msg ${uploadMsg.includes('❌') ? 'error' : uploadMsg.includes('✅') ? 'success' : ''}`}>
                    {uploadMsg}
                  </div>
                )}

                {/* IMAGE UPLOAD */}
                <div className="adm-upload-box">
                  <h4 className="adm-upload-box__title">🖼️ Certificate Image</h4>
                  <p className="adm-upload-box__hint">Upload photo/scan of certificate (JPG, PNG, WebP)</p>
                  <input ref={imgRef} type="file" accept=".jpg,.jpeg,.png,.webp" style={{display:'none'}}
                    onChange={e => { const f = e.target.files?.[0]; if(f) handleUpload(f,'image') }} />
                  <button type="button" className="adm-btn adm-btn--outline" onClick={() => imgRef.current?.click()} disabled={uploading !== null}>
                    {uploading === 'image' ? '⏳ Uploading...' : '📁 Choose Image'}
                  </button>
                  {form.image_url && (
                    <div className="adm-upload-box__img-preview">
                      <img src={form.image_url} alt="Preview" />
                      <button type="button" className="adm-upload-box__remove" onClick={() => setForm({...form, image_url: ''})}>✕ Remove</button>
                    </div>
                  )}
                  <div className="adm-form__group" style={{marginTop:'10px'}}>
                    <label style={{fontSize:'0.75rem'}}>Or paste image URL</label>
                    <input placeholder="https://..." value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} />
                  </div>
                </div>

                {/* PDF UPLOAD */}
                <div className="adm-upload-box adm-upload-box--pdf">
                  <h4 className="adm-upload-box__title">📄 Certificate PDF</h4>
                  <p className="adm-upload-box__hint">Upload PDF file of the certificate (optional)</p>
                  <input ref={pdfRef} type="file" accept=".pdf,.doc,.docx" style={{display:'none'}}
                    onChange={e => { const f = e.target.files?.[0]; if(f) handleUpload(f,'pdf') }} />
                  <button type="button" className="adm-btn adm-btn--outline" onClick={() => pdfRef.current?.click()} disabled={uploading !== null}>
                    {uploading === 'pdf' ? '⏳ Uploading PDF...' : '📄 Choose PDF File'}
                  </button>
                  {form.file_url && (
                    <div className="adm-upload-box__file-preview">
                      <span>📄 PDF uploaded</span>
                      <a href={form.file_url} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn--sm adm-btn--outline">View PDF</a>
                      <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setForm({...form, file_url: '', file_type: ''})}>Remove</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="adm-editor__sidebar">
                <div className="adm-editor__panel">
                  <h3>Settings</h3>
                  <div className="adm-form__group">
                    <label>Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      {CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="adm-form__group">
                    <label>Status</label>
                    <select value={form.published ? 'published' : 'hidden'} onChange={e => setForm({...form, published: e.target.value === 'published'})}>
                      <option value="published">🟢 Published</option>
                      <option value="hidden">🟡 Hidden</option>
                    </select>
                  </div>
                  {msg && <div className="adm-save-msg">{msg}</div>}
                  <button type="submit" className="adm-btn adm-btn--gold adm-btn--full" disabled={saving}>
                    {saving ? 'Saving...' : view === 'new' ? '🚀 Add Certificate' : '💾 Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </>
      )}

      {deleteId && (
        <div className="adm-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3>Delete Certificate?</h3>
            <p>This cannot be undone.</p>
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
