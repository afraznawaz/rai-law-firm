import { useState, useEffect, useRef } from 'react'
import supabase from '../lib/supabase'

interface CaseLaw {
  id: number
  title: string
  court: string
  year: string
  category: string
  summary: string
  outcome: string
  file_url: string
  file_type: string
  published: boolean
  created_at: string
}

const EMPTY: any = {
  title: '', court: '', year: '', category: 'Tax Law',
  summary: '', outcome: 'Won', file_url: '', file_type: '', published: true
}

const CATS = ['Tax Law', 'Cybercrime & FIA', 'Intellectual Property', 'Corporate Law', 'Civil Litigation', 'Criminal Law', 'Family Law', 'Environmental Law', 'Revenue Law', 'Constitutional Law']
const COURTS = ['Lahore High Court', 'Supreme Court of Pakistan', 'Appellate Tribunal Inland Revenue', 'Banking Court', 'Family Court', 'Sessions Court', 'District Court', 'Other']

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

export default function CaseLawsAdmin() {
  const [items, setItems] = useState<CaseLaw[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list'|'new'|'edit'>('list')
  const [form, setForm] = useState<any>({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [deleteId, setDeleteId] = useState<number|null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchItems = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/caselaws?admin=1', { headers: { Authorization: `Bearer ${session?.access_token}` } })
    const data = await res.json()
    setItems(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const handleUpload = async (file: File) => {
    setUploading(true)
    setUploadMsg(`⏳ Uploading ${file.name}...`)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const result = await uploadFile(file, 'case-files', session?.access_token || '')
      setForm((f: any) => ({ ...f, file_url: result.url, file_type: result.type }))
      setUploadMsg(`✅ File uploaded: ${file.name}`)
    } catch (err: any) {
      setUploadMsg(`❌ Upload failed: ${err.message}`)
    } finally { setUploading(false) }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const method = view === 'new' ? 'POST' : 'PUT'
      const res = await fetch('/api/caselaws', {
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
    await fetch('/api/caselaws', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ id }) })
    setDeleteId(null); fetchItems()
  }

  return (
    <div className="adm-tab-content">
      {view === 'list' && (
        <>
          <div className="adm-header">
            <div><h1 className="adm-header__title">Case Laws</h1><p className="adm-header__sub">{items.length} case{items.length !== 1 ? 's' : ''} total</p></div>
            <button className="adm-btn adm-btn--gold" onClick={() => { setForm({...EMPTY}); setUploadMsg(''); setView('new') }}>+ Add Case</button>
          </div>
          {loading ? <div className="adm-loading">Loading...</div> : (
            <div className="adm-posts">
              {items.map(item => (
                <div key={item.id} className="adm-post-card">
                  <div className="adm-post-card__left">
                    <span className={`adm-post-card__status ${item.published ? 'published' : 'draft'}`}>{item.published ? '🟢 Published' : '🟡 Hidden'}</span>
                    <h3 className="adm-post-card__title">{item.title}</h3>
                    <div className="adm-post-card__meta">
                      <span className="adm-post-card__cat">{item.category}</span>
                      <span>{item.court}</span>
                      <span>{item.year}</span>
                      <span className={`adm-outcome adm-outcome--${item.outcome?.toLowerCase()}`}>{item.outcome === 'Won' ? '✅ Won' : item.outcome === 'Lost' ? '❌ Lost' : '⚖️ Settled'}</span>
                      {item.file_url && <span className="adm-post-card__cat" style={{background:'#fee2e2',color:'#dc2626'}}>📄 File attached</span>}
                    </div>
                    <p className="adm-post-card__excerpt">{item.summary?.substring(0,120)}...</p>
                  </div>
                  <div className="adm-post-card__actions">
                    <button className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => { setForm({...item}); setUploadMsg(''); setView('edit') }}>✏️ Edit</button>
                    <button className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setDeleteId(item.id)}>🗑️ Delete</button>
                  </div>
                </div>
              ))}
              {items.length === 0 && <div className="adm-empty">No case laws yet. Add your first one!</div>}
            </div>
          )}
        </>
      )}

      {(view === 'new' || view === 'edit') && (
        <>
          <div className="adm-header">
            <div><h1 className="adm-header__title">{view === 'new' ? 'Add Case Law' : 'Edit Case Law'}</h1></div>
            <button className="adm-btn adm-btn--outline" onClick={() => setView('list')}>← Back</button>
          </div>
          <form onSubmit={handleSave} className="adm-editor">
            <div className="adm-editor__grid">
              <div className="adm-editor__main">
                <div className="adm-form__group">
                  <label>Case Title *</label>
                  <input required placeholder="e.g. XYZ Ltd vs FBR — Income Tax Appeal" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div className="adm-form__row2">
                  <div className="adm-form__group">
                    <label>Court / Tribunal *</label>
                    <select value={form.court} onChange={e => setForm({...form, court: e.target.value})}>
                      {COURTS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="adm-form__group">
                    <label>Year</label>
                    <input placeholder="e.g. 2024" value={form.year} onChange={e => setForm({...form, year: e.target.value})} />
                  </div>
                </div>
                <div className="adm-form__group">
                  <label>Case Summary *</label>
                  <textarea required rows={5} placeholder="Describe the case, legal issues involved, and how it was resolved..." value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} />
                </div>

                {uploadMsg && (
                  <div className={`adm-upload-msg ${uploadMsg.includes('❌') ? 'error' : uploadMsg.includes('✅') ? 'success' : ''}`}>
                    {uploadMsg}
                  </div>
                )}

                {/* FILE UPLOAD */}
                <div className="adm-upload-box">
                  <h4 className="adm-upload-box__title">📎 Attach Case File</h4>
                  <p className="adm-upload-box__hint">Upload PDF, Word document, or image of the judgment/order</p>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" style={{display:'none'}}
                    onChange={e => { const f = e.target.files?.[0]; if(f) handleUpload(f) }} />
                  <button type="button" className="adm-btn adm-btn--outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? '⏳ Uploading...' : '📎 Choose File (PDF, Word, Image)'}
                  </button>
                  {form.file_url && (
                    <div className="adm-upload-box__file-preview">
                      <span>📄 File uploaded</span>
                      <a href={form.file_url} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn--sm adm-btn--outline">View File</a>
                      <button type="button" className="adm-btn adm-btn--sm adm-btn--danger" onClick={() => setForm({...form, file_url: '', file_type: ''})}>Remove</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="adm-editor__sidebar">
                <div className="adm-editor__panel">
                  <h3>Case Details</h3>
                  <div className="adm-form__group">
                    <label>Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      {CATS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="adm-form__group">
                    <label>Outcome</label>
                    <select value={form.outcome} onChange={e => setForm({...form, outcome: e.target.value})}>
                      <option value="Won">✅ Won</option>
                      <option value="Lost">❌ Lost</option>
                      <option value="Settled">⚖️ Settled</option>
                      <option value="Pending">⏳ Pending</option>
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
                    {saving ? 'Saving...' : view === 'new' ? '🚀 Add Case' : '💾 Save Changes'}
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
            <h3>Delete Case?</h3>
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
