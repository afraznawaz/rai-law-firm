import { useState, useEffect } from 'react'

const CERT_ICONS: Record<string, string> = {
  'Punjab Bar Council': '🏛️',
  'Lahore Tax Bar': '⚖️',
  'Lahore High Court': '🏦',
  'District Court': '🏢',
  'Appellate Tribunal': '📋',
  'FIA': '🔍',
  'Harvard': '🎓',
  'Yale': '🏆',
  'International': '🌍',
  'Pakistan Bar': '💼',
  'IPO': '🌐',
  'default': '📜'
}

function getIcon(title: string) {
  for (const [key, icon] of Object.entries(CERT_ICONS)) {
    if (title.toLowerCase().includes(key.toLowerCase())) return icon
  }
  return CERT_ICONS['default']
}

// Static fallback certificates always shown
const STATIC_CERTS = [
  { id: 's1', title: 'Punjab Bar Council', num: 'Registration No. 144840', desc: 'Licensed Advocate — Punjab Bar Council, Pakistan. Authorized to practice law across all courts in Punjab.', icon: '🏛️' },
  { id: 's2', title: 'Lahore Tax Bar Association', num: 'Active Member', desc: 'Specialized member of the Lahore Tax Bar Association — Tax Law, FBR Disputes & Tribunal Practice.', icon: '⚖️' },
  { id: 's3', title: 'Lahore High Court', num: 'Enrolled Advocate', desc: 'Authorized to appear and argue before the Lahore High Court in civil, criminal, and constitutional matters.', icon: '🏦' },
  { id: 's4', title: 'District Courts Punjab', num: 'Enrolled Advocate', desc: 'Registered advocate before all District & Sessions Courts across Punjab.', icon: '🏢' },
  { id: 's5', title: 'Appellate Tribunal Inland Revenue', num: 'Authorized Representative', desc: 'Authorized to represent taxpayers before the ATIR — Pakistan\'s apex tax appellate tribunal.', icon: '📋' },
  { id: 's6', title: 'FIA Cybercrime Wing', num: 'Defense Counsel', desc: 'Experienced defense counsel in FIA cybercrime investigations and PECA 2016 cases.', icon: '🔍' },
  { id: 's7', title: 'IPO Pakistan — Trademark Agent', num: 'Registered Agent', desc: 'Registered Trademark & IP Agent with Intellectual Property Organization (IPO) Pakistan.', icon: '🌐' },
  { id: 's8', title: 'HarvardX — Harvard University', num: 'Verified Certificate', desc: 'HLS2X: Contract Law — From Trust to Promise to Contract. Issued August 20, 2024 by Harvard Law School.', icon: '🎓', special: 'harvard' },
  { id: 's9', title: 'Yale Law School — Online', num: 'Certificate of Completion', desc: 'Constitutional Law & Fundamental Rights — Yale Law School Online Continuing Legal Education Program.', icon: '🏆', special: 'stanford' },
  { id: 's10', title: 'Association of International Lawyers', num: 'Certified Member', desc: 'Certified Member of the Association of International Lawyers — Global Legal Network & International Law Practice.', icon: '🌍', special: 'intl' },
  { id: 's11', title: 'Pakistan Bar Council', num: 'Enrolled Advocate', desc: 'Enrolled with the Pakistan Bar Council — eligible to practice before the Supreme Court of Pakistan.', icon: '💼' },
  { id: 's12', title: 'R&A Law Firm', num: 'Est. 1993 — Lahore', desc: 'Founding firm established in 1993. 3-Fane Road, Tehreem Building, Lahore. Over 30 years of legal excellence.', icon: '📜' },
]

export default function CertificatesSection() {
  const [dbCerts, setDbCerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/certificates')
      .then(r => r.json())
      .then(d => { setDbCerts(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="ra-certs__grid">
      {/* Static always-visible certs */}
      {STATIC_CERTS.map(c => (
        <div key={c.id} className={`ra-cert-card${c.special ? ` ra-cert-card--${c.special}` : ''}`}>
          <div className="ra-cert-card__badge">{c.icon}</div>
          <h3 className="ra-cert-card__title">{c.title}</h3>
          <p className="ra-cert-card__num">{c.num}</p>
          <p className="ra-cert-card__desc">{c.desc}</p>
        </div>
      ))}

      {/* Dynamic certs from admin panel — only show if file_url is a valid http/data URL */}
      {!loading && dbCerts
        .filter(c => c.file_url && (c.file_url.startsWith('http') || c.file_url.startsWith('data:')))
        .map(c => {
          const isImg = ['jpg','jpeg','png','gif','webp'].includes((c.file_type||'').toLowerCase())
          const isPdf = c.file_type === 'pdf'
          const isDoc = ['doc','docx'].includes((c.file_type||'').toLowerCase())
          return (
            <div key={`db-${c.id}`} className="ra-cert-card ra-cert-card--dynamic">
              {isImg && (
                <div className="ra-cert-card__img-wrap">
                  <img src={c.file_url} alt={c.title}
                    className="ra-cert-card__img"
                    onError={e => { (e.target as HTMLImageElement).parentElement!.style.display='none' }} />
                </div>
              )}
              <div className="ra-cert-card__badge">{getIcon(c.title)}</div>
              <h3 className="ra-cert-card__title">{c.title}</h3>
              {c.issued_by && <p className="ra-cert-card__num">{c.issued_by}{c.issued_date ? ` · ${c.issued_date}` : ''}</p>}
              {c.description && <p className="ra-cert-card__desc">{c.description}</p>}
              <a href={c.file_url} target="_blank" rel="noopener noreferrer" className="ra-cert-card__download">
                {isPdf ? '📄 View PDF' : isDoc ? '📝 View Document' : '🖼️ View Certificate'}
              </a>
            </div>
          )
        })
      }
    </div>
  )
}
