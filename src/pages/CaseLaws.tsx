import { useState, useEffect } from 'react'
import supabase from '../lib/supabase'

interface CaseLaw {
  id: number
  title: string
  citation: string
  court: string
  year: number
  summary: string
  file_url: string
  category: string
  created_at: string
}

const COURTS = ['Supreme Court of Pakistan', 'Lahore High Court', 'Islamabad High Court', 'Peshawar High Court', 'Sindh High Court', 'Balochistan High Court', 'Appellate Tribunal Inland Revenue', 'Federal Tax Ombudsman', 'Other']
const CATEGORIES = ['Tax Law', 'Criminal Law', 'Civil Law', 'Family Law', 'Constitutional Law', 'Corporate Law', 'Revenue Law', 'Cybercrime', 'Environmental Law', 'Other']

export default function CaseLaws({ onBack }: { onBack: () => void }) {
  const [cases, setCases] = useState<CaseLaw[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ title: '', citation: '', court: 'Lahore High Court', year: new Date().getFullYear(), summary: '', file_url: '', category: 'Tax Law' })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [openCase, setOpenCase] = useState<CaseLaw | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    fetchCases()
  }, [])

  const fetchCases = async () => {
    setLoading(true)
    const res = await fetch('/api/caselaws')
    const data = await res.json()
    setCases(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/caselaws', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify(form) })
    setForm({ title: '', citation: '', court: 'Lahore High Court', year: new Date().getFullYear(), summary: '', file_url: '', category: 'Tax Law' })
    setShowForm(false); setSaving(false); fetchCases()
  }

  const handleDelete = async (id: number) => {
    const { data: { session } } = await supabase.auth.getSession()
    await fetch('/api/caselaws', { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` }, body: JSON.stringify({ id }) })
    setDeleteId(null); fetchCases()
  }

  const getGDriveEmbed = (url: string) => {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`
    return url
  }

  const allCategories = ['All', ...CATEGORIES]
  const filtered = cases.filter(c => {
    const matchCat = filter === 'All' || c.category === filter
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.citation?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="cl-page">
      <div className="cl-hero">
        <button className="cert-back" onClick={onBack}>← Back</button>
        <div className="cl-hero__content">
          <div className="cl-hero__icon">⚖️</div>
          <h1 className="cl-hero__title">Case Laws & Judgments</h1>
          <p className="cl-hero__sub">Important legal precedents and judgments relevant to our practice areas</p>
        </div>
      </div>
      <div className="cert-container">
        {user && <div className="cert-admin-bar"><button className="cert-add-btn" onClick={() => setShowForm(!showForm)}>{showForm ? '✕ Cancel' : '+ Add Case Law'}</button></div>}
        {showForm && user && (
          <form className="cert-form" onSubmit={handleAdd}>
            <h3>Add New Case Law</h3>
            <div className="cert-form__grid">
              <div className="cert-form__group cert-form__group--full"><label>Case Title *</label><input required placeholder="e.g. Commissioner vs. XYZ Corporation" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div className="cert-form__group"><label>Citation</label><input placeholder="e.g. 2023 PTD 123" value={form.citation} onChange={e => setForm({ ...form, citation: e.target.value })} /></div>
              <div className="cert-form__group"><label>Year</label><input type="number" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })} /></div>
              <div className="cert-form__group"><label>Court</label><select value={form.court} onChange={e => setForm({ ...form, court: e.target.value })}>{COURTS.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="cert-form__group"><label>Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="cert-form__group cert-form__group--full"><label>Google Drive Link (PDF)</label><input placeholder="https://drive.google.com/file/d/..." value={form.file_url} onChange={e => setForm({ ...form, file_url: e.target.value })} /></div>
              <div className="cert-form__group cert-form__group--full"><label>Case Summary *</label><textarea required rows={4} placeholder="Brief summary..." value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} /></div>
            </div>
            <button type="submit" className="cert-save-btn" disabled={saving}>{saving ? 'Saving...' : 'Save Case Law'}</button>
          </form>
        )}
        <div className="cl-toolbar">
          <input className="cl-search" placeholder="🔍 Search cases..." value={search} onChange={e => setSearch(e.target.value)} />
          <div className="cl-filters">{allCategories.map(cat => (<button key={cat} className={`ra-blog__filter ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>{cat}</button>))}</div>
        </div>
        {loading ? <div className="cert-loading">{[1,2,3].map(i => <div key={i} className="cert-skeleton" />)}</div> : filtered.length === 0 ? <div className="cert-empty"><div className="cert-empty__icon">⚖️</div><p>{cases.length === 0 ? 'Case laws will appear here once added.' : 'No cases found.'}</p></div> : (
          <div className="cl-grid">
            {filtered.map(c => (
              <div key={c.id} className="cl-card" onClick={() => setOpenCase(c)}>
                <div className="cl-card__top"><span className="cl-card__cat">{c.category}</span><span className="cl-card__year">{c.year}</span></div>
                <h3 className="cl-card__title">{c.title}</h3>
                {c.citation && <div className="cl-card__citation">📌 {c.citation}</div>}
                <div className="cl-card__court">🏛️ {c.court}</div>
                <p className="cl-card__summary">{c.summary?.substring(0, 140)}...</p>
                <div className="cl-card__footer"><button className="cl-card__read">Read More →</button>{user && <button className="cert-card__del" onClick={e => { e.stopPropagation(); setDeleteId(c.id) }}>🗑️</button>}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {openCase && (
        <div className="cl-modal-overlay" onClick={() => setOpenCase(null)}>
          <div className="cl-modal" onClick={e => e.stopPropagation()}>
            <button className="cl-modal__close" onClick={() => setOpenCase(null)}>✕</button>
            <div className="cl-modal__cat">{openCase.category}</div>
            <h2 className="cl-modal__title">{openCase.title}</h2>
            <div className="cl-modal__meta">{openCase.citation && <span>📌 {openCase.citation}</span>}<span>🏛️ {openCase.court}</span><span>📅 {openCase.year}</span></div>
            <div className="cl-modal__summary">{openCase.summary}</div>
            {openCase.file_url && <div className="cl-modal__preview"><iframe src={getGDriveEmbed(openCase.file_url)} className="cl-modal__iframe" title={openCase.title} allowFullScreen /></div>}
            {openCase.file_url && <a href={openCase.file_url} target="_blank" rel="noopener noreferrer" className="cert-card__view" style={{marginTop:'12px',display:'inline-block'}}>🔍 View Full Document</a>}
          </div>
        </div>
      )}
      {deleteId && <div className="adm-modal-overlay" onClick={() => setDeleteId(null)}><div className="adm-modal" onClick={e => e.stopPropagation()}><h3>Delete Case Law?</h3><p>Cannot be undone.</p><div className="adm-modal__actions"><button className="adm-btn adm-btn--outline" onClick={() => setDeleteId(null)}>Cancel</button><button className="adm-btn adm-btn--danger" onClick={() => handleDelete(deleteId)}>Delete</button></div></div></div>}
    </div>
  )
}
