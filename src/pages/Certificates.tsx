import { useState } from 'react'

const CERTS = [
  {
    file: '/certificates/cert_1.jpg',
    title: 'Certificate of Completion',
    issuer: 'The Legal Mentors — TLM',
    recipient: 'Rai Afraz',
    desc: 'Successfully completed Internship Program at The Legal Mentors (TLM). Signed by Zeeshan Ahmad Malik & M. Asim Riaz Rana, Advocates High Court.',
    date: 'August – September 2023',
    type: 'Internship'
  },
  {
    file: '/certificates/cert_2.jpg',
    title: 'Verified Certificate — Stanford Online',
    issuer: 'Stanford University (via edX)',
    recipient: 'Rai Afraz',
    desc: 'LAW0001Y: Comparative Equality and Anti-Discrimination Law. Verified Certificate issued by StanfordOnline. Certificate ID: f7616ecc80b1466986b0283831035008.',
    date: '2023',
    type: 'Academic'
  },
  {
    file: '/certificates/cert_3.jpg',
    title: 'Certificate of Recognition — TAAKRA 2024',
    issuer: 'University of Central Punjab — Department of Student Affairs',
    recipient: 'Rai Afraz',
    desc: 'Presented in recognition of ongoing contributions and continued work as Organizer for TAAKRA 2024, organized by the Department of Student Affairs, University of Central Punjab.',
    date: '2024',
    type: 'Recognition'
  },
  {
    file: '/certificates/cert_4.jpg',
    title: 'Certificate of Membership',
    issuer: 'Association of International Lawyers (AIL), London',
    recipient: 'Mr. Rai Afraz Advocate',
    desc: 'Valued member of the Association of International Lawyers. Membership ID No. AIL-PB-NS-144820. Issued November 2025. Signed by Mr. Nadeem Tass (President) & Mr. Nasir Ghilzai (Secretary-General for Pakistan).',
    date: 'November 2025',
    type: 'Membership'
  },
  {
    file: '/certificates/cert_5.jpg',
    title: 'Life Membership Certificate',
    issuer: 'The Lahore Tax Bar Association (The Largest Tax Bar of Asia — Since 1947)',
    recipient: 'RAI AFRAZ (Advocate)',
    desc: 'LIFE Member of The Lahore Tax Bar Association. Membership No. R-0319. Date of Enrollment: 25-07-2025. Session 2025-26. Signed by Muhammad Asif Rana (President) & Mian Asad Hanif (General Secretary).',
    date: '25 July 2025',
    type: 'Membership'
  },
  {
    file: '/certificates/cert_6.jpg',
    title: 'Certificate of Participation — Training Workshop',
    issuer: 'Decentralization Support Program, Finance Department, Government of Punjab',
    recipient: 'Rai Haq Nawaz Kharal — UC Nazim',
    desc: 'Training Workshop for District & Tehsil Councilors. Awarded for participation in the Decentralization Support Program, Finance Department, Government of the Punjab.',
    date: '04 December – 06 December 2006',
    type: 'Training'
  },
  {
    file: '/certificates/cert_7.jpg',
    title: 'Bar Vocational Course (BVC) Certificate',
    issuer: 'District Bar Association, Nankana Sahib',
    recipient: 'Mr. Rai Afraz S/o Rai Haq Nawaz',
    desc: 'Successfully completed the Bar Vocational Course (BVC) training. Ref No. DBA/NNS/188. Signed by Rai Shajar Abbas Kharal, General Secretary, District Bar Association Nankana Sahib.',
    date: '25 July 2024 – 08 August 2024',
    type: 'Legal Training'
  },
  {
    file: '/certificates/cert_8.jpg',
    title: 'Verified Certificate of Achievement — HarvardX',
    issuer: 'Harvard University (via edX)',
    recipient: 'RAI AFRAZ',
    desc: 'HLS2X: Contract Law: From Trust to Promise to Contract. Verified Certificate of Achievement. Certificate ID: 9ae01d645b62450db08470e84ab15599. Signed by Charles Fried, Beneficial Professor of Law, Harvard Law School.',
    date: 'Issued August 20, 2024',
    type: 'Academic'
  },
  {
    file: '/certificates/cert_9.jpg',
    title: 'Certificate of Participation — Legal Drafting',
    issuer: 'The Legal Mentors — TLM, Lahore',
    recipient: 'Rai Afraz',
    desc: 'For Active & Successful Participation in Course of Legal Drafting and Interpersonal Skills at The Legal Mentors-TLM, 66/3 Hajvery Complex, 2-Mozang Road, Lahore. Signed by Zeeshan Ahmad Malik, Managing Partner.',
    date: '2023',
    type: 'Training'
  },
  {
    file: '/certificates/cert_10.jpg',
    title: 'Certificate of Participation — Gender Sensitization',
    issuer: 'Ministry of Women Development – UNDP & Local Government Department Punjab',
    recipient: 'Rai Haq Nawaz Kharal — UC Nazim',
    desc: '2-Days Training of Union Nazims & Union Naib Nazims on Gender Sensitization. Organized by Women Political School Project Punjab in collaboration with Local Government & Community Development Department Punjab.',
    date: '06 June – 07 June 2007',
    type: 'Training'
  },
  {
    file: '/certificates/cert_11.jpg',
    title: 'Life Membership Certificate',
    issuer: 'Lahore High Court Bar Association',
    recipient: 'Rai Haq Nawaz',
    desc: 'Lahore High Court Bar Association confers Membership for Life. Certificate No. 29321. Issued under the seal of the association. Signed by Malik Asif Ahmad Nissoana (President) & Farukh Ilyas Cheema (Secretary).',
    date: '22 December 2006',
    type: 'Membership'
  },
  {
    file: '/certificates/cert_12.jpg',
    title: 'Membership Certificate',
    issuer: 'District Bar Association, Nankana Sahib',
    recipient: 'Mr. Rai Afraz Advocate S/o Rai Haq Nawaz',
    desc: 'Bonafide member of District Bar Association, Nankana Sahib since 08.02.2025. CNIC No. 35402-7639533-9. Regular, punctual and honest person of good moral and legal character. Ref No. DBA/NNS/321. Signed by Rai Abid Hussain Kharal (President).',
    date: '15 November 2025',
    type: 'Membership'
  }
]

const TYPE_COLORS: Record<string, string> = {
  'Membership': '#c9a84c',
  'Academic': '#3b82f6',
  'Internship': '#10b981',
  'Recognition': '#8b5cf6',
  'Training': '#f59e0b',
  'Legal Training': '#ef4444',
}

export default function Certificates({ onBack }: { onBack: () => void }) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [filter, setFilter] = useState('All')

  const types = ['All', ...Array.from(new Set(CERTS.map(c => c.type)))]
  const filtered = filter === 'All' ? CERTS : CERTS.filter(c => c.type === filter)

  return (
    <div className="cert-page">
      {/* Header */}
      <div className="cert-header">
        <div className="ra-container">
          <button className="cert-back" onClick={onBack}>← Back to Home</button>
          <div className="cert-header__content">
            <div className="ra-section__label">Credentials & Achievements</div>
            <h1 className="cert-header__title">Certificates & Memberships</h1>
            <div className="ra-divider ra-divider--center" />
            <p className="cert-header__sub">Official certifications, memberships and academic achievements of Rai Afraz (Advocate)</p>
          </div>
          {/* Filters */}
          <div className="cert-filters">
            {types.map(t => (
              <button key={t} className={`ra-blog__filter ${filter === t ? 'active' : ''}`} onClick={() => setFilter(t)}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="cert-body">
        <div className="ra-container">
          <div className="cert-grid">
            {filtered.map((cert, i) => (
              <div key={i} className="cert-card">
                <div className="cert-card__img-wrap" onClick={() => setLightbox(CERTS.indexOf(cert))}>
                  <img src={cert.file} alt={cert.title} className="cert-card__img" />
                  <div className="cert-card__overlay">
                    <span className="cert-card__view">🔍 Click to View</span>
                  </div>
                </div>
                <div className="cert-card__body">
                  <span className="cert-card__type" style={{ background: TYPE_COLORS[cert.type] || '#555' }}>{cert.type}</span>
                  <h3 className="cert-card__title">{cert.title}</h3>
                  <p className="cert-card__issuer">🏛️ {cert.issuer}</p>
                  <p className="cert-card__desc">{cert.desc}</p>
                  <div className="cert-card__footer">
                    <span className="cert-card__date">📅 {cert.date}</span>
                    <button className="cert-card__btn" onClick={() => setLightbox(CERTS.indexOf(cert))}>View Certificate →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="cert-lightbox" onClick={() => setLightbox(null)}>
          <div className="cert-lightbox__inner" onClick={e => e.stopPropagation()}>
            <button className="cert-lightbox__close" onClick={() => setLightbox(null)}>✕</button>
            <button className="cert-lightbox__nav cert-lightbox__nav--prev"
              onClick={() => setLightbox((lightbox - 1 + CERTS.length) % CERTS.length)}>‹</button>
            <img src={CERTS[lightbox].file} alt={CERTS[lightbox].title} className="cert-lightbox__img" />
            <div className="cert-lightbox__info">
              <h3>{CERTS[lightbox].title}</h3>
              <p>{CERTS[lightbox].issuer} · {CERTS[lightbox].date}</p>
            </div>
            <button className="cert-lightbox__nav cert-lightbox__nav--next"
              onClick={() => setLightbox((lightbox + 1) % CERTS.length)}>›</button>
          </div>
        </div>
      )}
    </div>
  )
}
