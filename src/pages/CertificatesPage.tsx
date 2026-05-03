import { useState, useEffect } from 'react'

interface Cert {
  id: number
  title: string
  description: string
  file_url: string
  issued_by: string
  issued_date: string
  category: string
  created_at: string
}

interface Props {
  onBack: () => void
}

export default function CertificatesPage({ onBack }: Props) {
  const [items, setItems] = useState<Cert[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Cert | null>(null)

  useEffect(() => {
    fetch('/api/certificates')
      .then(r => r.json())
      .then(d => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const isImage = (url: string) => url && (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.webp'))
  const isPdf = (url: string) => url && url.endsWith('.pdf')

  if (selected) {
    return (
      <div className="cert-detail">
        <button className="ne-back" onClick={() => setSelected(null)}>← Back to Certificates</button>
        <div className="cert-detail__wrap">
          {selected.file_url && isImage(selected.file_url) ? (
            <div className="cert-detail__img">
              <img src={selected.file_url} alt={selected.title} />
            </div>
          ) : selected.file_url && isPdf(selected.file_url) ? (
            <div className="cert-detail__pdf">
              <iframe src={selected.file_url} title={selected.title} />
            </div>
          ) : (
            <div className="cert-detail__placeholder">🏅</div>
          )}
          <div className="cert-detail__info">
            {selected.category && <div className="cert-detail__cat">{selected.category}</div>}
            <h1 className="cert-detail__title">{selected.title}</h1>
            {selected.issued_by && <div className="cert-detail__issuer">🏛️ {selected.issued_by}</div>}
            {selected.issued_date && <div className="cert-detail__date">📅 Issued: {selected.issued_date}</div>}
            <p className="cert-detail__desc">{selected.description}</p>
            {selected.file_url && (
              <a href={selected.file_url} target="_blank" rel="noopener noreferrer" className="cert-detail__download">
                {isPdf(selected.file_url) ? '📄 Open PDF' : '🖼️ View Full Certificate'}
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="cert-page">
      <div className="ne-header">
        <button className="ne-back" onClick={onBack}>← Back to Website</button>
        <div className="ne-header__text">
          <div className="ne-header__label">Professional Credentials</div>
          <h1 className="ne-header__title">Certificates & Memberships</h1>
          <p className="ne-header__sub">Official certifications and bar memberships of Rai Afraz (Advocate)</p>
        </div>
      </div>
      {loading ? (
        <div className="cert-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="ne-skeleton" />)}
        </div>
      ) : (
        <div className="cert-grid">
          {items.map(item => (
            <div key={item.id} className="cert-card" onClick={() => setSelected(item)}>
              <div className="cert-card__img">
                {item.file_url && isImage(item.file_url) ? (
                  <img src={item.file_url} alt={item.title} loading="lazy" />
                ) : item.file_url && isPdf(item.file_url) ? (
                  <div className="cert-card__pdf-icon">📄<span>PDF</span></div>
                ) : (
                  <div className="cert-card__pdf-icon">🏅</div>
                )}
                <div className="ne-card__overlay">
                  <span className="ne-card__view">Click to View →</span>
                </div>
              </div>
              <div className="cert-card__body">
                {item.category && <div className="cert-card__cat">{item.category}</div>}
                <h3 className="cert-card__title">{item.title}</h3>
                {item.issued_by && <div className="cert-card__issuer">{item.issued_by}</div>}
                {item.issued_date && <div className="cert-card__date">📅 {item.issued_date}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}