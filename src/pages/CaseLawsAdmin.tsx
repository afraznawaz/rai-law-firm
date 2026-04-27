import { useState, useEffect, useRef } from 'react'
import supabase from '../lib/supabase'

interface CaseLaw {
  id: number
  title: string
  court: string
  parties: string
  date: string
  judges: string
  outcome: string
  category: string
  description: string
  file_url: string
  file_type: string
  published: boolean
  created_at: string
}

const EMPTY: Partial<CaseLaw> = {
  title: '', court: '', parties: '', date: '', judges: '',
  outcome: '', category: 'Tax Law', description: '', file_url: '', file_type: '', published: true
}

const CATS = ['Tax Law', 'Civil Litigation', 'Criminal Law', 'Family Law', 'Corporate Law', 'Constitutional Law', 'Revenue Law', 'Cybercrime & FIA', 'Environmental Law', 'Intellectual Property']

export default function CaseLawsAdmin() {
  const [items, setItems] = useState<CaseLaw[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'list'|'new'|'edit'>('list')
  const [form, setForm] = useState<any>({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [deleteId, setDeleteId] = useState<number|null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadProgress('Uploading...')
    try {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ fileName: file.name, fileType: file.type, fileData: base64, bucket: 'case-files' })
        })
        const data = await res.json()
        if (data.url) {
          setForm((f: any) => ({ ...f, file_url: data.url, file_type: file.type }))
          setUploadProgress(`✅ Uploaded: ${file.name}`)
        } else {
          setUploadProgress('❌ Upload failed: ' + (data.error || 'Unknown error'))
        }
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (err: any) {
      setUploadProgress('❌ Error: ' + err.message)
      setUploading(false)
    }
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

  const openEdit = (item: CaseLaw) => { setForm({ ...item }); setView('edit') }
  const openNew = () => { setForm({ ...EMPTY }); setUploadProgress(''); setView('new') }

  const getFileIcon = (type: string) => {
    if (type?.includes('pdf')) return '📄'
    if (type?.includes('word') || type?.includes('document')) return '📝'
    if (type?.includes('image')) return '🖼️'
    return '📎'
  }

  return (
    <div className="adm-tab-content">
      {view === 'list' && (
        <>
          <div className="adm-header">
            <div><h1 className="adm-header__title">Case Laws</h1><p className="adm-header__sub">{items.length} case{items.length !== 1 ? 's' : ''} total</p></div>
            <button className="adm-btn adm-btn--gold" onClick={openNew}>+ Add Case Law</button>
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
                      <span>🏛️ {item.court}</span>
                      <span>📅 {item.date}</span>
                      {item.file_url && <span>{getFileIcon(item.file_type)} File attached</span>}
                    </div>
                    <p className="adm-post-card__excerpt">{item.parties}</p>
                  </div>
                  <div className="adm-post-card__actions">
                    <button className="adm-btn adm-btn--sm adm-btn--outline" onClick={() => openEdit(item)}>✏️ Edit</button>
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
                  <label>Case Title / Reference No. *</label>
                  <input required placeholder="e.g. STR No. 115558 of 2017" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div className="adm-form__row2">
                  <div className="adm-form__group">
                    <label>Court *</label>
                    <input required placeholder="e.g. Lahore High Court" value={form.court} onChange={e => setForm({...form, court: e.target.value})} />
                  </div>
                  <div className="adm-form__group">
                    <label>Date</label>
                    <input placeholder="e.g. 09.09.2024" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                  </div>
                </div>
                <div className="adm-form__group">
                  <label>Parties (Appellant vs Respondent)</label>
                  <input placeholder="e.g. Commissioner Inland Revenue vs. M/s ABC Company" value={form.parties} onChange={e => setForm({...form, parties: e.target.value})} />
                </div>
                <div className="adm-form__group">
                  <label>Judges / Bench</label>
                  <input placeholder="e.g. Justice Malik Javid Iqbal Wains" value={form.judges} onChange={e => setForm({...form, judges: e.target.value})} />
                </div>
                <div className="adm-form__group">
                  <label>Outcome / Holding</label>
                  <input placeholder="e.g. Disposed of in favour of respondent-taxpayer" value={form.outcome} onChange={e => setForm({...form, outcome: e.target.value})} />
                </div>
                <div className="adm-form__group">
                  <label>Description / Summary</label>
                  <textarea rows={4} placeholder="Brief description of the case and its significance..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>

                {/* FILE UPLOAD */}
                <div className="adm-upload-box">
                  <h4 className="adm-upload-box__title">📎 Attach Case File</h4>
                  <p className="adm-upload-box__hint">Upload PDF, Word document, or image of the judgment</p>
                  <div className="adm-upload-box__types">
                    <span>📄 PDF</span><span>📝 Word (.doc/.docx)</span><span>🖼️ Image (JPG/PNG)</span>
                  </div>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp" onChange={handleFileUpload} className="adm-upload-box__input" />
                  <button type="button" className="adm-btn adm-btn--outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                    {uploading ? '⏳ Uploading...' : '📁 Choose File'}
                  </button>
                  {uploadProgress && <div className="adm-upload-box__progress">{uploadProgress}</div>}
                  {form.file_url && (
                    <div className="adm-upload-box__preview">
                      <span>{getFileIcon(form.file_type)} File ready: </span>
                      <a href={form.file_url} target="_blank" rel="noopener noreferrer">View / Download</a>
                      <button type="button" className="adm-upload-box__remove" onClick={() => setForm({...form, file_url: '', file_type: ''})}>✕ Remove</button>
                    </div>
                  )}
                  <div className="adm-form__group" style={{marginTop: '12px'}}>
                    <label>Or paste file URL directly</label>
                    <input placeholder="https://..." value={form.file_url} onChange={e => setForm({...form, file_url: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="adm-editor__sidebar">
                <div className="adm-editor__panel">
                  <h3>Settings</h3>
                  <div className="adm-form__group">
                    <label>Category *</label>
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
                    {saving ? 'Saving...' : view === 'new' ? '🚀 Add Case Law' : '💾 Save Changes'}
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
            <h3>Delete Case Law?</h3>
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
