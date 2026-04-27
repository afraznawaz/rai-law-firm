import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

interface Certificate {
  id: number
  title: string
  description: string
  file_url: string
  issued_by: string
  issued_date: string
  category: string
  created_at: string
}

export default function Certificates({ onBack }: { onBack: () => void }) {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', file_url: '', issued_by: '', issued_date: '', category: 'Bar Membership' })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const CATEGORIES = ['Bar Membership', 'Court Registration', 'Award', 'Training', 'Other']

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    fetchCerts()
  }, [])

  const fetchCerts = async () => {
    setLoading(true)
    const res = await fetch('/api/certificates')
    const data = await res.json()
    setCerts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify(form)
    })
    setForm({ title: '', description: '', file_url: '', issued_by: '', issued_date: '', category: 'Bar Membership' })
    setShowForm(false)
    setSaving(false)
    fetchCerts()
  }

  const handleDelete = async (id: number) => {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/certificates', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ id })
    })
    setDeleteId(null)
    fetchCerts()
  }

  const getGDriveEmbed = (url: string) => {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`
    return url
  }

  const getGDriveView = (url: string) => {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (match) return `https://drive.google.com/file/d/${match[1]}/view`
    return url
  }

  return (
    <div className="cert-page">
      <div className="cert-hero">
        <button className="cert-back" onClick={onBack}>← Back</button>
        <div className="cert-hero__content">
          <div className="cert-hero__icon">🏅</div>
          <h1 className="cert-hero__title">Certificates & Credentials</h1>
          <p className="cert-hero__sub">Official certifications, bar memberships and professional credentials of Rai Afraz (Advocate)</p>
        </div>
      </div>

      <div className="cert-container">
        {user && (
          <div className="cert-admin-bar">
            <button className="cert-add-btn" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ Cancel' : '+ Add Certificate'}
            </button>
          </div>
        )}

        {showForm && user && (
          <form className="cert-form" onSubmit={handleAdd}>
            <h3>Add New Certificate</h3>
            <div className="cert-form__grid">
              <div className="cert-form__group">
                <label>Certificate Title *</label>
                <input required placeholder="e.g. Punjab Bar Council Membership" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="cert-form__group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="cert-form__group">
                <label>Issued By</label>
                <input placeholder="e.g. Punjab Bar Council" value={form.issued_by} onChange={e => setForm({ ...form, issued_by: e.target.value })} />
              </div>
              <div className="cert-form__group">
                <label>Issue Date</label>
                <input placeholder="e.g. 2010" value={form.issued_date} onChange={e => setForm({ ...form, issued_date: e.target.value })} />
              </div>
              <div className="cert-form__group cert-form__group--full">
                <label>Google Drive Link *</label>
                <input required placeholder="https://drive.google.com/file/d/..." value={form.file_url} onChange={e => setForm({ ...form, file_url: e.target.value })} />
                <span className="cert-form__hint">Share karo: Drive → Right click → Share → Anyone with link</span>
              </div>
              <div className="cert-form__group cert-form__group--full">
                <label>Description</label>
                <textarea rows={2} placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <button type="submit" className="cert-save-btn" disabled={saving}>{saving ? 'Saving...' : 'Save Certificate'}</button>
          </form>
        )}

        {loading ? (
          <div className="cert-loading">
            {[1,2,3].map(i => <div key={i} className="cert-skeleton" />)}
          </div>
        ) : certs.length === 0 ? (
          <div className="cert-empty">
            <div className="cert-empty__icon">🏅</div>
            <p>Certificates will appear here once uploaded.</p>
            {user && <button className="cert-add-btn" onClick={() => setShowForm(true)}>+ Add First Certificate</button>}
          </div>
        ) : (
          <div className="cert-grid">
            {certs.map(cert => (
              <div key={cert.id} className="cert-card">
                <div className="cert-card__preview">
                  {cert.file_url ? (
                    <iframe src={getGDriveEmbed(cert.file_url)} className="cert-card__iframe" title={cert.title} allowFullScreen />
                  ) : (
                    <div className="cert-card__no-preview">📄</div>
                  )}
                </div>
                <div className="cert-card__info">
                  <div className="cert-card__cat">{cert.category}</div>
                  <h3 className="cert-card__title">{cert.title}</h3>
                  {cert.issued_by && <p className="cert-card__by">🏛️ {cert.issued_by}</p>}
                  {cert.issued_date && <p className="cert-card__date">📅 {cert.issued_date}</p>}
                  {cert.description && <p className="cert-card__desc">{cert.description}</p>}
                  <div className="cert-card__actions">
                    {cert.file_url && (
                      <a href={getGDriveView(cert.file_url)} target="_blank" rel="noopener noreferrer" className="cert-card__view">🔍 View Full</a>
                    )}
                    {user && <button className="cert-card__del" onClick={() => setDeleteId(cert.id)}>🗑️</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
