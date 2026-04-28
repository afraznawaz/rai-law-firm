import { useState, useEffect } from 'react'
import './App.css'
import Admin from './pages/Admin'
import BlogPost from './pages/BlogPost'
import ELibrary from './pages/ELibrary'
import { FacebookIcon, TikTokIcon, InstagramIcon, YouTubeIcon, WhatsAppIcon } from './components/SocialIcons'

const NAV_LINKS = ['Home', 'About', 'Services', 'Expert', 'Blog', 'Reviews', 'E-Library', 'Contact']

const CASE_LAWS = [
  {
    id: 1,
    title: 'STR No. 115558 of 2017',
    court: 'Lahore High Court, Lahore',
    parties: 'Commissioner Inland Revenue, RTO Gujranwala vs. M/s Nadeem Silk Factory',
    date: '09.09.2025',
    judges: 'Malik Javid Iqbal Wains & Abid Aziz Sheikh',
    outcome: 'Disposed of in favour of respondent-taxpayer',
    category: 'Tax Law — Sales Tax',
    image: '/certificates/certificate-1.jpg'
  },
  {
    id: 2,
    title: 'STR No. 112851 of 2017 — Judgment Page',
    court: 'Lahore High Court, Lahore',
    parties: 'Commissioner Inland Revenue, RTO Gujranwala vs. M/s Ashraf Silk Factory',
    date: '23.04.2019 (LHC 1245)',
    judges: 'Malik Javid Iqbal Wains & Abid Aziz Sheikh',
    outcome: 'Reference applications disposed of — Sales Tax Act 1990 interpreted in favour of taxpayer',
    category: 'Tax Law — Sales Tax Act 1990',
    image: '/certificates/certificate-2.jpg'
  },
  {
    id: 3,
    title: 'STR No. 112851 of 2017',
    court: 'Lahore High Court, Lahore',
    parties: 'Commissioner Inland Revenue, RTO Gujranwala vs. M/s Ashraf Silk Factory Race Course',
    date: '09.09.2025',
    judges: 'Malik Javid Iqbal Wains & Abid Aziz Sheikh',
    outcome: 'ATIR order held unsustainable — taxpayer rights upheld',
    category: 'Tax Law — Sales Tax Act 1990',
    image: '/certificates/certificate-3.jpg'
  }
]

const IMPORTANT_LINKS = [
  { name: 'FBR', full: 'Federal Board of Revenue', url: 'https://www.fbr.gov.pk', desc: 'Tax filing, NTN, ATL status', color: '#1a5276' },
  { name: 'SECP', full: 'Securities & Exchange Commission', url: 'https://www.secp.gov.pk', desc: 'Company registration & compliance', color: '#1e8449' },
  { name: 'PRA', full: 'Punjab Revenue Authority', url: 'https://pra.punjab.gov.pk', desc: 'Punjab sales tax portal', color: '#6e2fa0' },
  { name: 'SRB', full: 'Sindh Revenue Board', url: 'https://srb.gos.pk', desc: 'Sindh sales tax services', color: '#b7950b' },
  { name: 'KPRA', full: 'KP Revenue Authority', url: 'https://kpra.kp.gov.pk', desc: 'KPK sales tax portal', color: '#1a5276' },
  { name: 'BRA', full: 'Balochistan Revenue Authority', url: 'https://bra.gob.pk', desc: 'Balochistan revenue services', color: '#922b21' },
  { name: 'NADRA', full: 'National Database & Registration Authority', url: 'https://www.nadra.gov.pk', desc: 'CNIC, NICOP, Pakistan Origin Card', color: '#1e8449' },
  { name: 'IPO', full: 'Intellectual Property Organization', url: 'https://ipo.gov.pk', desc: 'Trademark & patent registration', color: '#6e2fa0' },
  { name: 'PLRA', full: 'Punjab Land Records Authority', url: 'https://www.plra.punjab.gov.pk', desc: 'Land records & fard verification', color: '#b7950b' },
  { name: 'LHC', full: 'Lahore High Court', url: 'https://lhc.gov.pk', desc: 'Case status & cause lists', color: '#922b21' },
  { name: 'SCP', full: 'Supreme Court of Pakistan', url: 'https://www.supremecourt.gov.pk', desc: 'Apex court case information', color: '#1a5276' },
  { name: 'FIA', full: 'Federal Investigation Agency', url: 'https://www.fia.gov.pk', desc: 'Cybercrime & FIA matters', color: '#1e8449' },
]

const FAQS = [
  { q: 'Do you work with individuals and corporations?', a: 'Yes. We advise individuals, AOPs, SMEs, and large corporate groups across Pakistan. From salaried persons to multinational companies, we tailor our services to your specific needs.' },
  { q: 'Can you represent us for FBR notices and appeals?', a: 'Absolutely. We prepare detailed replies, represent clients during audits, and handle appeals before Commissioner Inland Revenue, ATIR, High Court, and Supreme Court.' },
  { q: 'How quickly can you review a tax notice?', a: 'Initial notice review is usually completed within 24 to 48 hours, depending on document completeness and urgency. We prioritize time-sensitive matters.' },
  { q: 'Do you handle provincial sales tax matters?', a: 'Yes. We handle registration, filing, notices, and compliance support for PRA (Punjab), SRB (Sindh), KPRA (KPK), and BRA (Balochistan) matters.' },
  { q: 'Can you help with ATL status restoration?', a: 'Yes. We review the reason for exclusion from the Active Taxpayers List, correct filing gaps, and process the required steps for ATL restoration with FBR.' },
  { q: 'Do you support company registration and SECP filings?', a: 'Yes. We provide end-to-end SECP support including incorporations, SMC formation, changes in directors/shareholding, statutory filings, and corporate governance documentation.' },
  { q: 'Can your team assist overseas Pakistanis?', a: 'Yes. We advise overseas Pakistanis on filing obligations, NICOP/POC matters, property-related tax concerns, inheritance issues, and legal representation in Pakistan.' },
  { q: 'What documents should I prepare before consultation?', a: 'Please share your NTN details, recent tax returns, any FBR/court notices, business profile, and relevant bank or withholding records. This helps us give you precise advice.' },
  { q: 'Do you handle cybercrime and FIA cases?', a: 'Yes. Rai Afraz specializes in FIA cybercrime defense under PECA 2016. We handle complaints, pre-arrest bail, trial defense, and appeals in cybercrime matters.' },
  { q: 'What are your consultation charges?', a: 'We offer a free initial consultation. Detailed advisory and representation fees are discussed transparently based on the nature and complexity of your matter.' },
]

const TRUST_REASONS = [
  { icon: '⚖️', title: 'Specialized Tax Expertise', desc: 'Member of Lahore Tax Bar Association with deep expertise in FBR disputes, tax tribunals, and income tax litigation.' },
  { icon: '🏛️', title: 'High Court Experience', desc: 'Extensive experience before Lahore High Court and Supreme Court of Pakistan on constitutional, tax, and civil matters.' },
  { icon: '📋', title: 'Clear Documentation', desc: 'Every engagement is supported by clear documentation, transparent timelines, and a compliance-first mindset.' },
  { icon: '⚡', title: '24-48 Hour Response', desc: 'We review notices and provide initial guidance within 24 to 48 hours — because time matters in legal matters.' },
  { icon: '🔒', title: 'Strict Confidentiality', desc: 'All client information is handled with absolute confidentiality. Your legal matters stay between you and us.' },
  { icon: '🌐', title: 'Nationwide Coverage', desc: 'We represent clients before federal and provincial forums across Pakistan — from Karachi to Peshawar.' },
]

const HOW_WE_WORK = [
  { num: '01', title: 'Discovery', desc: 'We map your current compliance position, filing history, notices, and legal risks through a detailed initial consultation.' },
  { num: '02', title: 'Strategy', desc: 'We build a tailored legal plan and a defensible documentation roadmap specific to your situation.' },
  { num: '03', title: 'Execution', desc: 'Our team handles submissions, court appearances, reconciliations, and all regulatory communications on your behalf.' },
  { num: '04', title: 'Ongoing Care', desc: 'Regular check-ins, compliance reminders, and proactive legal updates keep you protected and ahead of deadlines.' },
]

const SIGNATURE_SERVICES = [
  { title: 'Returns & Filings', icon: '📑', items: ['Annual income tax return filing', 'Wealth statement preparation', 'Statement of assets and liabilities', 'Withholding statements & reconciliations'] },
  { title: 'Audit & Notices', icon: '🔍', items: ['Notice reviews and replies', 'Audit representation & coordination', 'Demand and assessment management', 'Settlement and dispute resolution'] },
  { title: 'Corporate & SECP', icon: '🏢', items: ['Company incorporation and filings', 'Change of directors & shareholding', 'Corporate tax health checks', 'Regulatory compliance reporting'] },
  { title: 'Provincial Sales Tax', icon: '📊', items: ['PRA, SRB, KPRA, BRA registrations', 'Monthly & quarterly sales tax filings', 'Withholding and exemptions guidance', 'Provincial audits and notices'] },
]

const GALLERY_IMAGES = [
  { src: '/images/gallery-1.jpg', caption: 'Lahore High Court' },
  { src: '/images/gallery-2.jpg', caption: 'FBR — Federal Board of Revenue' },
  { src: '/images/gallery-3.jpg', caption: 'SECP — Company Registration' },
  { src: '/images/gallery-4.jpg', caption: 'SBP — State Bank of Pakistan' },
  { src: '/images/gallery-5.jpg', caption: 'Supreme Court of Pakistan' },
  { src: '/images/gallery-6.jpg', caption: 'Legal Excellence' },
]

const SERVICES = [
  { icon: '⚖️', title: 'Tax Law', desc: 'Comprehensive tax advisory, planning, and litigation services for individuals and corporations. We navigate complex tax codes to protect your financial interests.' },
  { icon: '🏛️', title: 'Civil Litigation', desc: 'Skilled representation in civil disputes, contract matters, property conflicts, and commercial litigation before all courts of Pakistan.' },
  { icon: '📋', title: 'Corporate Law', desc: 'Company formation, mergers & acquisitions, corporate governance, and regulatory compliance for businesses of all sizes.' },
  { icon: '🏠', title: 'Property & Real Estate', desc: 'Property transactions, title disputes, lease agreements, land acquisition, and real estate litigation across Punjab and beyond.' },
  { icon: '👨‍👩‍👧', title: 'Family Law', desc: 'Sensitive and professional handling of divorce, custody, inheritance, guardianship, and matrimonial property matters.' },
  { icon: '🔏', title: 'Criminal Defense', desc: 'Vigorous criminal defense representation at trial and appellate levels, ensuring every client receives a fair and just process.' },
  { icon: '📝', title: 'Contract Drafting', desc: 'Precise drafting, review, and negotiation of commercial contracts, MOUs, NDAs, and all forms of legal agreements.' },
  { icon: '🌐', title: 'Constitutional Law', desc: 'High Court and Supreme Court petitions, constitutional challenges, fundamental rights enforcement, and writ jurisdiction matters.' }
]

const SOCIAL_LINKS = [
  { Icon: FacebookIcon, label: 'Facebook (R&A)', href: 'https://www.facebook.com/61577203114572', color: '#1877f2' },
  { Icon: FacebookIcon, label: 'Facebook (Rai Afraz)', href: 'https://www.facebook.com/raiafraz10', color: '#1877f2' },
  { Icon: TikTokIcon, label: 'TikTok', href: 'https://www.tiktok.com/@rai_associates', color: '#010101' },
  { Icon: InstagramIcon, label: 'Instagram', href: 'https://www.instagram.com/rai_associates10', color: '#e1306c' },
  { Icon: YouTubeIcon, label: 'YouTube', href: 'https://www.youtube.com/@raiandassociates', color: '#ff0000' },
  { Icon: WhatsAppIcon, label: 'WhatsApp', href: 'https://wa.me/923164371096', color: '#25d366' },
]

const STATS = [
  { value: '30+', label: 'Years of Excellence' },
  { value: '5000+', label: 'Cases Won' },
  { value: '98%', label: 'Client Satisfaction' },
  { value: '1', label: 'Dedicated Expert' }
]

interface Post {
  id: number; title: string; slug: string; category: string
  excerpt: string; author: string; published: boolean; created_at: string
}

export default function App() {
  const path = window.location.pathname
  if (path === '/admin') return <Admin />

  const [activeSection, setActiveSection] = useState('home')
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [openPost, setOpenPost] = useState<string | null>(null)
  const [showELibrary, setShowELibrary] = useState(false)
  const [blogFilter, setBlogFilter] = useState('All')
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [activeReview, setActiveReview] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/blog').then(r => r.json()).then(d => { setPosts(Array.isArray(d) ? d : []); setPostsLoading(false) }).catch(() => setPostsLoading(false))
    fetch('/api/reviews').then(r => r.json()).then(d => { setReviews(Array.isArray(d) ? d : []); setReviewsLoading(false) }).catch(() => setReviewsLoading(false))
  }, [])

  useEffect(() => {
    if (reviews.length === 0) return
    const timer = setInterval(() => setActiveReview(p => (p + 1) % reviews.length), 4000)
    return () => clearInterval(timer)
  }, [reviews])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)
      const sections = ['home', 'about', 'services', 'expert', 'blog', 'reviews', 'certificates', 'case-laws', 'contact']
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 100 && rect.bottom >= 100) { setActiveSection(id); break }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    if (id.toLowerCase() === 'e-library') {
      setShowELibrary(true)
      setMenuOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setShowELibrary(false)
    const sectionId = id.toLowerCase().replace(/\s+/g, '-')
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      setTimeout(() => setSubmitted(false), 5000)
    } catch (err) {
      alert('Message send karne mein masla hua. Please call karein: 0304-4840937')
    }
  }

  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category)))]
  const filteredPosts = blogFilter === 'All' ? posts : posts.filter(p => p.category === blogFilter)

  if (showELibrary) {
    return (
      <div>
        <nav className="ra-nav ra-nav--scrolled">
          <div className="ra-nav__inner">
            <div className="ra-nav__logo" onClick={() => setShowELibrary(false)} style={{ cursor: 'pointer' }}>
              <img src="/uploads/upload_1.PNG" alt="RAI & Associates" className="ra-nav__logo-img" />
              <div className="ra-nav__logo-text">
                <span className="ra-nav__logo-name">RAI & ASSOCIATES</span>
                <span className="ra-nav__logo-sub">Law Firm — Est. 1993</span>
              </div>
            </div>
            <button className="ra-nav__link" onClick={() => setShowELibrary(false)} style={{color:'var(--gold)'}}>← Back to Home</button>
          </div>
        </nav>
        <ELibrary onBack={() => setShowELibrary(false)} />
        <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-wa-float" title="Chat on WhatsApp">
          <svg viewBox="0 0 24 24" fill="currentColor" className="ra-wa-float__icon"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <span className="ra-wa-float__text">WhatsApp</span>
        </a>
      </div>
    )
  }

  if (openPost) {
    return (
      <div>
        <nav className="ra-nav ra-nav--scrolled">
          <div className="ra-nav__inner">
            <div className="ra-nav__logo" onClick={() => setOpenPost(null)} style={{ cursor: 'pointer' }}>
              <img src="/uploads/upload_1.PNG" alt="RAI & Associates" className="ra-nav__logo-img" />
              <div className="ra-nav__logo-text">
                <span className="ra-nav__logo-name">RAI & ASSOCIATES</span>
                <span className="ra-nav__logo-sub">Law Firm — Est. 1993</span>
              </div>
            </div>
          </div>
        </nav>
        <BlogPost slug={openPost} onBack={() => setOpenPost(null)} />
        <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-wa-float" title="Chat on WhatsApp">
          <svg viewBox="0 0 24 24" fill="currentColor" className="ra-wa-float__icon"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          <span className="ra-wa-float__text">WhatsApp</span>
        </a>
      </div>
    )
  }

  return (
    <div className="ra-root">
      {/* NAVBAR */}
      <nav className={`ra-nav ${scrolled ? 'ra-nav--scrolled' : ''}`}>
        <div className="ra-nav__inner">
          {/* LEFT — Est. badge */}
          <div className="ra-nav__left">
            <div className="ra-nav__logo" onClick={() => scrollTo('home')}>
              <img src="/uploads/upload_1.PNG" alt="RAI & Associates" className="ra-nav__logo-img" />
              <div className="ra-nav__logo-text">
                <span className="ra-nav__logo-name">RAI & ASSOCIATES</span>
                <span className="ra-nav__logo-sub">Law Firm — Est. 1993</span>
              </div>
            </div>
          </div>
          {/* CENTER — Nav links */}
          <div className="ra-nav__center">
            <div className="ra-nav__links">
              {NAV_LINKS.map(link => (
                <button key={link}
                  className={`ra-nav__link ${activeSection === link.toLowerCase() ? 'ra-nav__link--active' : ''}`}
                  onClick={() => scrollTo(link.toLowerCase())}>{link}</button>
              ))}
            </div>
          </div>
          {/* RIGHT — CTA */}
          <div className="ra-nav__right">
            <button className="ra-nav__cta" onClick={() => scrollTo('contact')}>Free Consultation</button>
            <button className="ra-nav__burger" onClick={() => setMenuOpen(!menuOpen)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="ra-nav__mobile">
            {NAV_LINKS.map(link => (
              <button key={link} className="ra-nav__mobile-link" onClick={() => scrollTo(link.toLowerCase())}>{link}</button>
            ))}
            <button className="ra-nav__cta ra-nav__cta--mobile" onClick={() => scrollTo('contact')}>Free Consultation</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" className="ra-hero">
        <div className="ra-hero__overlay" />
        {/* 3D LEFT SIDE */}
        <div className="ra-hero__3d ra-hero__3d--left">
          <div className="ra-hero3d__scene">
            <div className="ra-hero3d__ring ra-hero3d__ring--outer" />
            <div className="ra-hero3d__ring ra-hero3d__ring--mid" />
            <div className="ra-hero3d__card">
              <div className="ra-hero3d__card-glow" />
              <img src="/uploads/upload_1.PNG" alt="RAI & Associates" className="ra-hero3d__logo" />
              <div className="ra-hero3d__firm">RAI & ASSOCIATES</div>
              <div className="ra-hero3d__est">Est. 1993 · Lahore</div>
              <div className="ra-hero3d__divider" />
              <div className="ra-hero3d__tagline">⚖️ Committed to Justice</div>
            </div>
            <div className="ra-hero3d__badge ra-hero3d__badge--1"><span>30+</span><small>Years</small></div>
            <div className="ra-hero3d__badge ra-hero3d__badge--2"><span>5K+</span><small>Cases</small></div>
            <div className="ra-hero3d__badge ra-hero3d__badge--3"><span>98%</span><small>Success</small></div>
            <div className="ra-hero3d__badge ra-hero3d__badge--4"><span>⚖️</span><small>Justice</small></div>
            {[...Array(8)].map((_, i) => <div key={i} className={`ra-hero3d__particle ra-hero3d__particle--${i+1}`} />)}
          </div>
        </div>
        <div className="ra-hero__content">
          <div className="ra-hero__badge">Established Since 1993</div>
          <h1 className="ra-hero__title"><span className="ra-hero__title-gold">RAI & ASSOCIATES</span><br />Law Firm</h1>
          <p className="ra-hero__tagline">Committed to Justice — R & A</p>
          <p className="ra-hero__desc">Three decades of trusted legal excellence in Lahore. Specializing in Tax Law, Civil Litigation, Corporate Law, and Constitutional matters before all courts of Pakistan.</p>
          <div className="ra-hero__actions">
            <button className="ra-btn ra-btn--gold" onClick={() => scrollTo('contact')}>Book Consultation</button>
            <button className="ra-btn ra-btn--outline" onClick={() => scrollTo('services')}>Our Services</button>
          </div>
          <div className="ra-hero__bar">
            <span>📍 R&A Law Firm, 3-Fane Road, Tehreem Building, Lahore</span>
            <span>🌐 <a href="https://www.raiandassociates.com.pk" target="_blank" rel="noopener noreferrer" className="ra-hero__web-link">www.raiandassociates.com.pk</a></span>
          </div>
        </div>
      </section>

      {/* R&A LAW FIRM BANNER */}
      <section className="ra-firm-banner">
        <div className="ra-firm-banner__orbs">
          {[...Array(5)].map((_, i) => <div key={i} className={`ra-firm-banner__orb ra-firm-banner__orb--${i+1}`} />)}
        </div>
        <div className="ra-firm-banner__inner">
          <img src="/uploads/upload_1.PNG" alt="R&A" className="ra-firm-banner__logo" />
          <div className="ra-firm-banner__words">
            <span className="ra-firm-banner__ra">R&A</span>
            <span className="ra-firm-banner__law">LAW FIRM</span>
          </div>
        </div>
        <div className="ra-firm-banner__line" />
        <div className="ra-firm-banner__sub">⚖️ Committed to Justice &nbsp;·&nbsp; Est. 1993 &nbsp;·&nbsp; Lahore, Pakistan</div>
      </section>

      {/* STATS */}
      <section className="ra-stats">
        {STATS.map((s, i) => (
          <div key={i} className="ra-stats__item">
            <span className="ra-stats__value">{s.value}</span>
            <span className="ra-stats__label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* 3D SHOWCASE */}
      <section className="ra-3d-section" aria-label="RAI & Associates Law Firm Lahore">
        {/* 3D LOGO — LEFT */}
        <div className="ra-3d-logo-wrap">
          <div className="ra-3d-logo-scene">
            <div className="ra-3d-logo-card">
              <div className="ra-3d-logo-card__shine" />
              <div className="ra-3d-logo-card__glow" />
              <img src="/uploads/upload_1.PNG" alt="RAI & Associates" className="ra-3d-logo-card__img" />
              <div className="ra-3d-logo-card__name">RAI & Associates</div>
              <div className="ra-3d-logo-card__bar" />
              <div className="ra-3d-logo-card__sub">Law Firm · Est. 1993</div>
            </div>
            <div className="ra-3d-logo-ring ra-3d-logo-ring--1" />
            <div className="ra-3d-logo-ring ra-3d-logo-ring--2" />
            <div className="ra-3d-logo-orb ra-3d-logo-orb--1" />
            <div className="ra-3d-logo-orb ra-3d-logo-orb--2" />
            <div className="ra-3d-logo-orb ra-3d-logo-orb--3" />
          </div>
        </div>
        {/* TEXT — RIGHT */}
        <div className="ra-3d-text">
          <h2 className="ra-3d-text__title">Pakistan's Trusted Legal Experts</h2>
          <p className="ra-3d-text__desc">Best tax lawyer in Lahore — RAI & Associates has delivered justice with integrity, expertise, and dedication since 1993. Serving clients across Pakistan.</p>
          <div className="ra-3d-text__keywords">
            <span>Tax Lawyer Lahore</span>
            <span>FBR Disputes</span>
            <span>FIA Cybercrime</span>
            <span>Corporate Law</span>
            <span>Trademark Pakistan</span>
          </div>
          <button className="ra-btn ra-btn--gold" onClick={() => scrollTo('contact')}>Get Free Consultation →</button>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="ra-section ra-about">
        <div className="ra-container">
          <div className="ra-about__grid">
            <div className="ra-about__img-col">
              <div className="ra-about__logo-wrap">
                <img src="/uploads/upload_1.PNG" alt="RAI & Associates" className="ra-about__logo" />
                <div className="ra-about__est">EST. 1993</div>
              </div>

              <div className="ra-about__ceo">
                <div className="ra-about__ceo-avatar">RA</div>
                <div>
                  <div className="ra-about__ceo-name">Rai Afraz ⚖️</div>
                  <div className="ra-about__ceo-role">CEO & Advocate</div>
                  <div className="ra-about__ceo-tag">Lahore Tax Bar Association</div>
                </div>
              </div>
            </div>
            <div className="ra-about__text-col">
              <div className="ra-section__label">About Our Firm</div>
              <h2 className="ra-section__title">Welcome to <span className="ra-brand-caps">RAI & ASSOCIATES</span> ⚖️</h2>
              <p className="ra-about__tagline">Legal Solutions for the Modern World</p>
              <div className="ra-divider" />
              <p className="ra-about__para">We are a <strong>Professional Law Firm</strong> based in Lahore, offering expert legal services designed for the complexities of today's world. From corporate disputes to digital crimes, we provide legal clarity and protection at every step.</p>
              <div className="ra-about__services-list">
                <div className="ra-about__sitem"><span>📑</span><span><strong>Tax & Corporate Law Litigation</strong> — Expert handling of tax disputes and corporate legal matters before all tribunals.</span></div>
                <div className="ra-about__sitem"><span>™️</span><span><strong>Intellectual Property (IPO & Trademark Registration)</strong> — Protecting your brand, inventions, and creative works.</span></div>
                <div className="ra-about__sitem"><span>🧑‍💻</span><span><strong>Cybercrime & FIA Matters</strong> — Specialized defense and advisory for digital crimes and FIA investigations.</span></div>
              </div>
              <p className="ra-about__para" style={{ marginTop: '16px' }}>We're here to provide <strong>legal clarity and protection</strong> 👨🏻‍⚖️</p>
              <div className="ra-about__offices">
                <h4 className="ra-about__offices-title">🏢 Our Offices</h4>
                <div className="ra-about__office">
                  <span className="ra-about__office-icon">📍</span>
                  <div><div className="ra-about__office-name">R&A Law Firm</div><div className="ra-about__office-addr">3-Fane Road, Tehreem Building, Lahore</div></div>
                </div>
                <div className="ra-about__office">
                  <span className="ra-about__office-icon">📍</span>
                  <div><div className="ra-about__office-name">Tax Consultancy Office</div><div className="ra-about__office-addr">Near Eiffel Tower, Bahria Town, Lahore</div></div>
                </div>
              </div>
              <div className="ra-about__social">
                <h4 className="ra-about__social-title">📲 Follow Us</h4>
                <div className="ra-about__social-links">
                  {SOCIAL_LINKS.map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="ra-about__social-btn" style={{ '--sc': s.color } as React.CSSProperties}>
                      <s.Icon size={16} /><span>{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="ra-section ra-services">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">What We Do</div>
            <h2 className="ra-section__title">Our Legal Services</h2>
            <div className="ra-divider ra-divider--center" />
            <p className="ra-section__subtitle">Comprehensive legal solutions tailored to protect your rights and interests</p>
          </div>
          <div className="ra-services__grid">
            {SERVICES.map((s, i) => (
              <div key={i} className="ra-service-card">
                <div className="ra-service-card__icon">{s.icon}</div>
                <h3 className="ra-service-card__title">{s.title}</h3>
                <p className="ra-service-card__desc">{s.desc}</p>
                <button className="ra-service-card__link" onClick={() => scrollTo('contact')}>Enquire →</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERTS */}
      <section id="expert" className="ra-section ra-experts">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Meet Our Experts</div>
            <h2 className="ra-section__title">Our Legal Team</h2>
            <div className="ra-divider ra-divider--center" />
            <p className="ra-section__subtitle">Experienced advocates committed to delivering justice since 1993</p>
          </div>

          {/* FOUNDER */}
          <div className="ra-expert-duo">
            <div className="ra-expert-solo ra-expert-solo--founder">
              <div className="ra-expert-solo__photo-wrap">
                <div className="ra-expert-solo__photo-bg">
                  <img src="/images/expert-bg.png" alt="Legal Background" className="ra-expert-solo__bg-img" />
                  <img src="/uploads/rai-haq-nawaz.jpg" alt="Rai Haq Nawaz Kharal" className="ra-expert-solo__photo" />
                  <div className="ra-expert-solo__name-overlay">Rai Haq Nawaz ⚖️</div>
                </div>
              </div>
              <div className="ra-expert-solo__info">
                <div className="ra-expert-solo__badge ra-expert-solo__badge--founder">⭐ Founder</div>
                <h2 className="ra-expert-solo__name">Rai Haq Nawaz Kharal</h2>
                <p className="ra-expert-solo__title-role">Advocate High Court</p>
                <p className="ra-expert-solo__bar">Punjab Bar Council — Practicing Since 1993</p>
                <div className="ra-expert-solo__tags">
                  <span>High Court Practice</span>
                  <span>Civil Litigation</span>
                  <span>Revenue Law</span>
                  <span>Property Disputes</span>
                  <span>Constitutional Law</span>
                </div>
                <div className="ra-expert-solo__reg"><span>🏛️ Punjab Bar Council — 30+ Years Experience</span></div>
                <p className="ra-expert-solo__bio">
                  Rai Haq Nawaz Kharal is the Founder of RAI & Associates Law Firm, established in 1993. With over three decades of distinguished legal practice, he is a highly respected Advocate of the Lahore High Court. He began his legal career in 1993 and has since built an unparalleled reputation in civil litigation, revenue law, property disputes, and constitutional matters.
                </p>
                <p className="ra-expert-solo__bio">
                  His deep knowledge of Punjab's legal landscape and unwavering commitment to justice have made him one of Lahore's most trusted advocates. He has appeared before District Courts, the Lahore High Court, and the Supreme Court of Pakistan, successfully representing thousands of clients over his illustrious career. His expertise in land revenue matters, inheritance disputes, and property litigation is unmatched in the region.
                </p>
                <div className="ra-expert-solo__achievements">
                  <div className="ra-expert-solo__ach"><span>📅</span><span>Practicing since <strong>1993</strong> — 30+ years</span></div>
                  <div className="ra-expert-solo__ach"><span>🏛️</span><span>Lahore High Court — Enrolled Advocate</span></div>
                  <div className="ra-expert-solo__ach"><span>⚖️</span><span>Supreme Court of Pakistan — Appearances</span></div>
                  <div className="ra-expert-solo__ach"><span>🏆</span><span>1000s of clients successfully represented</span></div>
                </div>
                <div className="ra-expert-solo__actions">
                  <a href="tel:+923044840937" className="ra-btn ra-btn--gold">📞 Call Now</a>
                  <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-btn ra-btn--outline">💬 WhatsApp</a>
                </div>
              </div>
            </div>

            {/* CEO */}
            <div className="ra-expert-solo">
              <div className="ra-expert-solo__photo-wrap">
                <div className="ra-expert-solo__photo-bg">
                  <img src="/images/expert-bg.png" alt="Legal Background" className="ra-expert-solo__bg-img" />
                  <img src="/uploads/rai-afraz.jpg" alt="Rai Afraz" className="ra-expert-solo__photo"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <div className="ra-expert-solo__name-overlay">Rai Afraz ⚖️</div>
                </div>
              </div>
              <div className="ra-expert-solo__info">
                <div className="ra-expert-solo__badge">CEO & Managing Partner</div>
                <h2 className="ra-expert-solo__name">Rai Afraz (Advocate) ⚖️</h2>
                <p className="ra-expert-solo__title-role">CEO — RAI & Associates</p>
                <p className="ra-expert-solo__bar">Member, Lahore Tax Bar Association</p>
                <div className="ra-expert-solo__tags">
                  <span>Tax Law Litigation</span>
                  <span>FIA Cases</span>
                  <span>Corporate Law</span>
                  <span>Cybercrime Defense</span>
                  <span>IPO & Trademark</span>
                </div>
                <div className="ra-expert-solo__reg"><span>🏛️ Punjab Bar Reg. No. 144840</span></div>
                <p className="ra-expert-solo__bio">
                  Rai Afraz is the CEO and Managing Partner of RAI & Associates Law Firm. Son of the Founder Rai Haq Nawaz Kharal, he carries forward the firm's legacy with modern legal expertise. Specialized in Tax Law Litigation and FIA Cases, he is a registered member of the Lahore Tax Bar Association.
                </p>
                <p className="ra-expert-solo__bio">
                  He has successfully represented hundreds of clients before FBR, tax tribunals, the Lahore High Court, and the Supreme Court of Pakistan. His expertise extends to cybercrime defense, FIA investigations, corporate law, intellectual property, and trademark registration. He holds a verified certificate from HarvardX in Contract Law and is committed to continuous legal education.
                </p>
                <div className="ra-expert-solo__achievements">
                  <div className="ra-expert-solo__ach"><span>🏛️</span><span>Punjab Bar Reg. <strong>No. 144840</strong></span></div>
                  <div className="ra-expert-solo__ach"><span>⚖️</span><span>Lahore Tax Bar Association — Member</span></div>
                  <div className="ra-expert-solo__ach"><span>🎓</span><span>HarvardX — Contract Law Certificate</span></div>
                  <div className="ra-expert-solo__ach"><span>💼</span><span>Tax Tribunals, LHC & Supreme Court</span></div>
                </div>
                <div className="ra-expert-solo__actions">
                  <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-btn ra-btn--gold">💬 WhatsApp</a>
                  <a href="tel:+923044840937" className="ra-btn ra-btn--outline">📞 Call Now</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section id="blog" className="ra-section ra-blog">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Knowledge Hub</div>
            <h2 className="ra-section__title">Legal Insights</h2>
            <div className="ra-divider ra-divider--center" />
            <p className="ra-section__subtitle">Expert legal articles and updates from <strong>RAI & ASSOCIATES</strong></p>
          </div>
          <div className="ra-blog__filters">
            {categories.map(cat => (
              <button key={cat} className={`ra-blog__filter ${blogFilter === cat ? 'active' : ''}`} onClick={() => setBlogFilter(cat)}>{cat}</button>
            ))}
          </div>
          {postsLoading ? (
            <div className="ra-blog__loading">
              {[1,2,3].map(i => <div key={i} className="ra-blog__skeleton" />)}
            </div>
          ) : (
            <div className="ra-blog__grid">
              {filteredPosts.map(post => (
                <div key={post.id} className="ra-blog-card" onClick={() => setOpenPost(post.slug)}>
                  <div className="ra-blog-card__cat">{post.category}</div>
                  <h3 className="ra-blog-card__title">{post.title}</h3>
                  <p className="ra-blog-card__excerpt">{post.excerpt}</p>
                  <div className="ra-blog-card__footer">
                    <span className="ra-blog-card__author">✍️ {post.author}</span>
                    <span className="ra-blog-card__date">{new Date(post.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <button className="ra-blog-card__read">Read Article →</button>
                </div>
              ))}
            </div>
          )}
          {!postsLoading && filteredPosts.length === 0 && (
            <div className="ra-blog__empty">No posts in this category yet.</div>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="ra-section ra-reviews">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Client Testimonials</div>
            <h2 className="ra-section__title">What Our Clients Say</h2>
            <div className="ra-divider ra-divider--center" />
            <p className="ra-section__subtitle">Genuine reviews from our clients across Pakistan</p>
          </div>

          {reviewsLoading ? (
            <div className="ra-reviews__loading">
              {[1,2,3].map(i => <div key={i} className="ra-reviews__skeleton" />)}
            </div>
          ) : (
            <>
              {/* Featured sliding review */}
              <div className="ra-reviews__featured">
                {reviews.map((r, i) => (
                  <div key={r.id} className={`ra-reviews__slide ${i === activeReview ? 'active' : ''}`}>
                    <div className="ra-reviews__quote">"</div>
                    <p className="ra-reviews__text">{r.review}</p>
                    <div className="ra-reviews__stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                    <div className="ra-reviews__author">
                      <div className="ra-reviews__avatar">{r.name.charAt(0)}</div>
                      <div>
                        <div className="ra-reviews__name">{r.name}</div>
                        <div className="ra-reviews__meta">{r.city} · {r.service}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="ra-reviews__dots">
                  {reviews.map((_, i) => (
                    <button key={i} className={`ra-reviews__dot ${i === activeReview ? 'active' : ''}`} onClick={() => setActiveReview(i)} />
                  ))}
                </div>
              </div>

              {/* Grid of all reviews */}
              <div className="ra-reviews__grid">
                {reviews.map((r) => (
                  <div key={r.id} className="ra-review-card">
                    <div className="ra-review-card__top">
                      <div className="ra-review-card__avatar">{r.name.charAt(0)}</div>
                      <div>
                        <div className="ra-review-card__name">{r.name}</div>
                        <div className="ra-review-card__loc">📍 {r.city}</div>
                      </div>
                      <div className="ra-review-card__stars">{'★'.repeat(r.rating)}</div>
                    </div>
                    <p className="ra-review-card__text">"{r.review}"</p>
                    <div className="ra-review-card__service">{r.service}</div>
                  </div>
                ))}
              </div>

              {/* Overall rating bar */}
              <div className="ra-reviews__overall">
                <div className="ra-reviews__overall-score">5.0</div>
                <div>
                  <div className="ra-reviews__overall-stars">★★★★★</div>
                  <div className="ra-reviews__overall-label">Average Rating · {reviews.length} Reviews</div>
                </div>
                <div className="ra-reviews__overall-badge">⚖️ Verified Clients</div>
              </div>


            </>
          )}
        </div>
      </section>

      {/* CERTIFICATES */}
      <section id="certificates" className="ra-section ra-certs">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Official Documents</div>
            <h2 className="ra-section__title">Certificates & Memberships</h2>
            <div className="ra-divider ra-divider--center" />
            <p className="ra-section__subtitle">Official bar memberships, registrations and professional certifications</p>
          </div>

          <div className="ra-certs__grid">
            <div className="ra-cert-card">
              <div className="ra-cert-card__icon">🏛️</div>
              <h3 className="ra-cert-card__title">Punjab Bar Council</h3>
              <p className="ra-cert-card__num">Registration No. 144840</p>
              <p className="ra-cert-card__desc">Licensed Advocate — Punjab Bar Council, Pakistan</p>
            </div>
            <div className="ra-cert-card">
              <div className="ra-cert-card__icon">⚖️</div>
              <h3 className="ra-cert-card__title">Lahore Tax Bar Association</h3>
              <p className="ra-cert-card__num">Active Member</p>
              <p className="ra-cert-card__desc">Specialized member of Lahore Tax Bar — Tax Law & Tribunal Practice</p>
            </div>
            <div className="ra-cert-card">
              <div className="ra-cert-card__icon">🎓</div>
              <h3 className="ra-cert-card__title">Lahore High Court</h3>
              <p className="ra-cert-card__num">Enrolled Advocate</p>
              <p className="ra-cert-card__desc">Authorized to practice before the Lahore High Court in all matters</p>
            </div>
            <div className="ra-cert-card">
              <div className="ra-cert-card__icon">📜</div>
              <h3 className="ra-cert-card__title">R&A Law Firm</h3>
              <p className="ra-cert-card__num">Est. 1993 — Lahore</p>
              <p className="ra-cert-card__desc">3-Fane Road, Tehreem Building, Lahore — Founded by Rai Haq Nawaz Kharal</p>
            </div>
            <div className="ra-cert-card ra-cert-card--harvard">
              <div className="ra-cert-card__icon">🎓</div>
              <h3 className="ra-cert-card__title">HarvardX — Harvard University</h3>
              <p className="ra-cert-card__num">Verified Certificate of Achievement</p>
              <p className="ra-cert-card__desc">HLS2X: Contract Law — From Trust to Promise to Contract · Issued August 20, 2024</p>
            </div>
            <div className="ra-cert-card ra-cert-card--stanford">
              <div className="ra-cert-card__icon">🏆</div>
              <h3 className="ra-cert-card__title">Stanford University</h3>
              <p className="ra-cert-card__num">Certificate of Completion</p>
              <p className="ra-cert-card__desc">Advanced Legal Studies — Stanford Law School Online Program · Continuing Legal Education</p>
            </div>
          </div>
        </div>
      </section>

      {/* CASE LAWS */}
      <section id="case-laws" className="ra-section ra-caselaws">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Court Orders & Judgments</div>
            <h2 className="ra-section__title">Case Laws</h2>
            <div className="ra-divider ra-divider--center" />
            <p className="ra-section__subtitle">Actual Lahore High Court orders where Rai Afraz Kharal appeared as Advocate</p>
          </div>
          <div className="ra-caselaws__grid">
            {CASE_LAWS.map(c => (
              <div key={c.id} className="ra-caselaw-card">
                <div className="ra-caselaw-card__img-wrap" onClick={() => setLightbox(c.image)}>
                  <img src={c.image} alt={c.title} className="ra-caselaw-card__img" />
                  <div className="ra-caselaw-card__overlay">
                    <span>🔍 View Full Document</span>
                  </div>
                </div>
                <div className="ra-caselaw-card__body">
                  <div className="ra-caselaw-card__cat">{c.category}</div>
                  <h3 className="ra-caselaw-card__title">{c.title}</h3>
                  <div className="ra-caselaw-card__court">🏛️ {c.court}</div>
                  <div className="ra-caselaw-card__parties">👥 {c.parties}</div>
                  <div className="ra-caselaw-card__date">📅 {c.date}</div>
                  <div className="ra-caselaw-card__judges">⚖️ {c.judges}</div>
                  <div className="ra-caselaw-card__outcome">✅ {c.outcome}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      {lightbox && (
        <div className="ra-lightbox" onClick={() => setLightbox(null)}>
          <div className="ra-lightbox__close" onClick={() => setLightbox(null)}>×</div>
          <img src={lightbox} alt="Document" className="ra-lightbox__img" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* CONTACT */}
      <section id="contact" className="ra-section ra-contact">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Get In Touch</div>
            <h2 className="ra-section__title">Contact Us</h2>
            <div className="ra-divider ra-divider--center" />
            <p className="ra-section__subtitle">Schedule a consultation with our legal experts today</p>
          </div>
          <div className="ra-contact__grid">
            <div className="ra-contact__info">
              <h3 className="ra-contact__info-title">Office Information</h3>
              <div className="ra-contact__details">
                <div className="ra-contact__detail"><div className="ra-contact__detail-icon">📍</div><div><div className="ra-contact__detail-label">R&A Law Firm</div><div className="ra-contact__detail-value">3-Fane Road, Tehreem Building, Lahore</div></div></div>
                <div className="ra-contact__detail"><div className="ra-contact__detail-icon">📍</div><div><div className="ra-contact__detail-label">Tax Consultancy Office</div><div className="ra-contact__detail-value">Near Eiffel Tower, Bahria Town, Lahore</div></div></div>
                <div className="ra-contact__detail"><div className="ra-contact__detail-icon">📞</div><div><div className="ra-contact__detail-label">Call</div><a href="tel:+923044840937" className="ra-contact__detail-value ra-contact__link">+92 304 484 0937</a></div></div>
                <div className="ra-contact__detail"><div className="ra-contact__detail-icon">💬</div><div><div className="ra-contact__detail-label">WhatsApp</div><a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-contact__detail-value ra-contact__link">+92 316 437 1096</a></div></div>
                <div className="ra-contact__detail"><div className="ra-contact__detail-icon">✉️</div><div><div className="ra-contact__detail-label">Email</div><a href="mailto:afrazrai4457@gmail.com" className="ra-contact__detail-value ra-contact__link">afrazrai4457@gmail.com</a></div></div>

                <div className="ra-contact__detail"><div className="ra-contact__detail-icon">🕐</div><div><div className="ra-contact__detail-label">Office Hours</div><div className="ra-contact__detail-value">Mon – Sat: 9:00 AM – 6:00 PM</div></div></div>
              </div>
            </div>
            <div className="ra-contact__form-wrap">
              <h3 className="ra-contact__form-title">Send Us a Message</h3>
              {submitted ? (
                <div className="ra-contact__success"><div className="ra-contact__success-icon">✓</div><p>Thank you! We will contact you shortly.</p></div>
              ) : (
                <form className="ra-contact__form" onSubmit={handleSubmit}>
                  <div className="ra-form__row">
                    <div className="ra-form__group"><label>Full Name *</label><input required placeholder="Your full name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
                    <div className="ra-form__group"><label>Phone Number *</label><input required placeholder="03XX XXXXXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                  </div>
                  <div className="ra-form__group"><label>Email Address</label><input type="email" placeholder="your@email.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                  <div className="ra-form__group"><label>Subject *</label>
                    <select required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}>
                      <option value="">Select a service</option>
                      <option>Tax Law</option><option>Civil Litigation</option><option>Corporate Law</option>
                      <option>Property & Real Estate</option><option>Family Law</option><option>Criminal Defense</option>
                      <option>Contract Drafting</option><option>Constitutional Law</option><option>Other</option>
                    </select>
                  </div>
                  <div className="ra-form__group"><label>Message *</label><textarea required rows={4} placeholder="Briefly describe your legal matter..." value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} /></div>
                  <button type="submit" className="ra-btn ra-btn--gold ra-btn--full">Send Message</button>
                </form>
              )}
            </div>
          </div>

          {/* FOLLOW US — Social Media */}
          <div className="ra-contact__social-wrap">
            <h3 className="ra-contact__social-title">📲 Follow Us on Social Media</h3>
            <div className="ra-contact__social-grid">
              <a href="https://www.facebook.com/61577203114572" target="_blank" rel="noopener noreferrer" className="ra-contact__social-btn ra-contact__social-btn--fb">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>Facebook (R&A)</span>
              </a>
              <a href="https://www.facebook.com/raiafraz10" target="_blank" rel="noopener noreferrer" className="ra-contact__social-btn ra-contact__social-btn--fb">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>Facebook (Rai Afraz)</span>
              </a>
              <a href="https://www.tiktok.com/@rai_associates" target="_blank" rel="noopener noreferrer" className="ra-contact__social-btn ra-contact__social-btn--tk">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>
                <span>TikTok</span>
              </a>
              <a href="https://www.instagram.com/rai_associates10" target="_blank" rel="noopener noreferrer" className="ra-contact__social-btn ra-contact__social-btn--ig">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                <span>Instagram</span>
              </a>
              <a href="https://www.youtube.com/@raiandassociates" target="_blank" rel="noopener noreferrer" className="ra-contact__social-btn ra-contact__social-btn--yt">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                <span>YouTube</span>
              </a>
              <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-contact__social-btn ra-contact__social-btn--wa">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* WHY CLIENTS TRUST US */}
      <section className="ra-section ra-trust">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Our Promise</div>
            <h2 className="ra-section__title">Why Clients Trust Us</h2>
            <div className="ra-divider ra-divider--center" />
            <p className="ra-section__subtitle">Our firm combines the precision of tax advisors with the rigour of litigation counsel</p>
          </div>
          <div className="ra-trust__grid">
            {TRUST_REASONS.map((t, i) => (
              <div key={i} className="ra-trust-card">
                <div className="ra-trust-card__icon">{t.icon}</div>
                <h3 className="ra-trust-card__title">{t.title}</h3>
                <p className="ra-trust-card__desc">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIGNATURE SERVICE LINES */}
      <section className="ra-section ra-signature">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Core Offerings</div>
            <h2 className="ra-section__title">Signature Service Lines</h2>
            <div className="ra-divider ra-divider--center" />
            <p className="ra-section__subtitle">Comprehensive legal and tax support aligned with your business lifecycle</p>
          </div>
          <div className="ra-signature__grid">
            {SIGNATURE_SERVICES.map((s, i) => (
              <div key={i} className="ra-sig-card">
                <div className="ra-sig-card__header">
                  <span className="ra-sig-card__icon">{s.icon}</span>
                  <h3 className="ra-sig-card__title">{s.title}</h3>
                  <span className="ra-sig-card__team">Dedicated team</span>
                </div>
                <ul className="ra-sig-card__list">
                  {s.items.map((item, j) => (
                    <li key={j}><span className="ra-sig-card__dot">▸</span>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* Full service list */}
          <div className="ra-signature__all">
            {['Income tax return filing for individuals and companies','Wealth statement preparation and reconciliation','FBR registration, profile updates, and ATL matters','Sales tax registration (federal and provincial)','FBR notices drafting and representation','Audit support, settlements, and dispute management','Corporate tax compliance and advisory','SECP filings and corporate governance support','Tax planning and exemption claims','Capital gains tax calculation and filing','Cybercrime & FIA defense under PECA 2016','Trademark & IPO registration','Civil, criminal & constitutional litigation','Revenue law & land record disputes'].map((item, i) => (
              <div key={i} className="ra-signature__item"><span>✓</span>{item}</div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW WE WORK */}
      <section className="ra-section ra-howwork">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Our Process</div>
            <h2 className="ra-section__title">How We Work</h2>
            <div className="ra-divider ra-divider--center" />
            <p className="ra-section__subtitle">A clear, structured approach from first consultation to final resolution</p>
          </div>
          <div className="ra-howwork__steps">
            {HOW_WE_WORK.map((s, i) => (
              <div key={i} className="ra-step">
                <div className="ra-step__num">{s.num}</div>
                <div className="ra-step__connector" />
                <div className="ra-step__content">
                  <h3 className="ra-step__title">{s.title}</h3>
                  <p className="ra-step__desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPORTANT LINKS */}
      <section className="ra-section ra-links">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Quick Access</div>
            <h2 className="ra-section__title">Important Links</h2>
            <div className="ra-divider ra-divider--center" />
            <p className="ra-section__subtitle">Direct access to Pakistan's key legal and regulatory portals</p>
          </div>
          <div className="ra-links__grid">
            {IMPORTANT_LINKS.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="ra-link-card" style={{'--lc': l.color} as React.CSSProperties}>
                <div className="ra-link-card__name">{l.name}</div>
                <div className="ra-link-card__full">{l.full}</div>
                <div className="ra-link-card__desc">{l.desc}</div>
                <div className="ra-link-card__arrow">→</div>
              </a>
            ))}
          </div>
        </div>
      </section>



      {/* PHOTO GALLERY */}
      <section className="ra-section ra-gallery">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Our World</div>
            <h2 className="ra-section__title">Inside <span className="ra-brand-caps">RAI & ASSOCIATES</span></h2>
            <div className="ra-divider ra-divider--center" />
            <p className="ra-section__subtitle">A glimpse into our legal practice and expertise</p>
          </div>
          <div className="ra-gallery__grid">
            {GALLERY_IMAGES.map((img, i) => (
              <div key={i} className={`ra-gallery-item ra-gallery-item--${i+1}`}>
                <img src={img.src} alt={img.caption} />
                <div className="ra-gallery-item__caption">{img.caption}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION — SEO Optimized */}
      <section id="faq" className="ra-section ra-faq" itemScope itemType="https://schema.org/FAQPage">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Common Questions</div>
            <h2 className="ra-section__title">Frequently Asked Questions</h2>
            <div className="ra-divider ra-divider--center" />
            <p className="ra-section__subtitle">Answers to the most common legal questions in Pakistan</p>
          </div>
          <div className="ra-faq__grid">
            {[
              { q: 'What is the best law firm in Lahore for tax cases?', a: 'RAI & Associates Law Firm is one of Lahore\'s most trusted law firms for tax cases. Led by Advocate Rai Afraz, a member of the Lahore Tax Bar Association (Punjab Bar Reg. No. 144840), the firm specializes in FBR tax disputes, income tax appeals, and sales tax litigation before all tax tribunals and courts in Pakistan.' },
              { q: 'How do I respond to an FBR tax notice?', a: 'Do NOT ignore any FBR notice. Contact a tax lawyer immediately. RAI & Associates specializes in responding to FBR notices under Section 114, 122, and 176 of the Income Tax Ordinance. Call Advocate Rai Afraz at 0304-4840937 for urgent tax notice assistance.' },
              { q: 'Can RAI & Associates help with FIA cybercrime cases?', a: 'Yes. RAI & Associates specializes in FIA cybercrime defense under PECA 2016. We handle online harassment, digital fraud, social media cases, PECA Section 19 & 20 cases, and all FIA Cybercrime Wing matters across Pakistan.' },
              { q: 'How to register a trademark in Pakistan?', a: 'Trademark registration is done through IPO Pakistan. RAI & Associates handles the complete process — trademark search, classification, TM-1 application filing, examination response, and registration certificate. Contact us at 0304-4840937 for a free consultation.' },
              { q: 'Where is RAI & Associates Law Firm located?', a: 'RAI & Associates has two offices in Lahore: (1) R&A Law Firm, 3-Fane Road, Tehreem Building, near Lahore High Court; (2) Tax Consultancy Office, near Eiffel Tower, Bahria Town, Lahore. Call: 0304-4840937 or WhatsApp: 0316-4371096.' },
              { q: 'What legal services does RAI & Associates offer?', a: 'We offer: Tax Law & FBR disputes, FIA Cybercrime defense, Corporate Law & SECP registration, Trademark & IP registration, Civil Litigation, Family Law & divorce, Criminal defense, Constitutional Law & writ petitions, Revenue Law, Property disputes, Environmental Law, and Labour Law.' },
              { q: 'How to get bail in a criminal case in Pakistan?', a: 'Contact RAI & Associates immediately after arrest. We apply for pre-arrest bail (anticipatory bail) before arrest or post-arrest bail after. Bail applications are filed in the Sessions Court or High Court depending on the offense. Call 0304-4840937 for urgent criminal matters.' },
              { q: 'How to file a writ petition in Lahore High Court?', a: 'A writ petition under Article 199 of the Constitution is filed when a fundamental right is violated or a public authority acts illegally. RAI & Associates has extensive experience filing writ petitions in the Lahore High Court for illegal detention, service matters, and government authority abuse.' },
            ].map((item, i) => (
              <div key={i} className="ra-faq__item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <button className="ra-faq__q" onClick={e => { const el = e.currentTarget.nextElementSibling as HTMLElement; el.style.display = el.style.display === 'none' ? 'block' : 'none'; e.currentTarget.classList.toggle('open') }}>
                  <span itemProp="name">{item.q}</span>
                  <span className="ra-faq__arrow">▼</span>
                </button>
                <div className="ra-faq__a" itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" style={{display:'none'}}>
                  <p itemProp="text">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BRANCHES */}
      <section className="ra-branches">
        <div className="ra-container">
          <div className="ra-branches__header">
            <div className="ra-section__label" style={{color:'var(--gold-light)'}}>Our Presence</div>
            <h2 className="ra-branches__title">Our Branches Across Pakistan</h2>
            <div className="ra-divider ra-divider--center" />
          </div>
          <div className="ra-branches__grid">
            {[
              { city: 'Lahore', icon: '🏛️', desc: 'R&A Law Firm, 3-Fane Road, Tehreem Building, Near Lahore High Court', main: true },
              { city: 'Lahore', icon: '💼', desc: 'Tax Consultancy Office, Near Eiffel Tower, Bahria Town', main: false },
              { city: 'Islamabad', icon: '🏙️', desc: 'Federal Capital — Available for consultations & court appearances', main: false },
              { city: 'Karachi', icon: '🌊', desc: 'Sindh High Court & Commercial Court matters', main: false },
              { city: 'Multan', icon: '🌹', desc: 'South Punjab — Multan High Court Bench', main: false },
              { city: 'Nankana Sahib', icon: '⭐', desc: 'District Courts — Civil & Revenue matters', main: false },
            ].map((b, i) => (
              <div key={i} className={`ra-branch-card ${b.main ? 'ra-branch-card--main' : ''}`}>
                <div className="ra-branch-card__icon">{b.icon}</div>
                <div className="ra-branch-card__city">{b.city}</div>
                {b.main && <div className="ra-branch-card__badge">Head Office</div>}
                <div className="ra-branch-card__desc">{b.desc}</div>
                <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-branch-card__btn">
                  💬 WhatsApp
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ra-footer">
        <div className="ra-container">
          <div className="ra-footer__grid">
            <div className="ra-footer__brand">
              <img src="/uploads/upload_1.PNG" alt="RAI & Associates" className="ra-footer__logo" />
              <p className="ra-footer__brand-text">Committed to Justice since 1993. Trusted legal advocates serving Lahore and all of Pakistan.</p>

            </div>
            <div className="ra-footer__col">
              <h4>Services</h4>
              <ul>{SERVICES.slice(0, 4).map((s, i) => <li key={i}><button onClick={() => scrollTo('services')}>{s.title}</button></li>)}</ul>
            </div>
            <div className="ra-footer__col">
              <h4>More Services</h4>
              <ul>{SERVICES.slice(4).map((s, i) => <li key={i}><button onClick={() => scrollTo('services')}>{s.title}</button></li>)}</ul>
            </div>
            <div className="ra-footer__col">
              <h4>Contact</h4>
              <ul>
                <li>📍 R&A Law Firm, 3-Fane Road, Tehreem Building, Lahore</li>
                <li>📍 Near Eiffel Tower, Bahria Town, Lahore</li>
                <li><a href="tel:+923044840937">📞 +92 304 484 0937</a></li>
                <li><a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer">💬 +92 316 437 1096</a></li>
                <li><a href="mailto:afrazrai4457@gmail.com">✉️ afrazrai4457@gmail.com</a></li>
                <li><a href="https://www.raiandassociates.com.pk" target="_blank" rel="noopener noreferrer">🌐 www.raiandassociates.com.pk</a></li>
              </ul>
            </div>
          </div>
          <div className="ra-footer__social">
            <span className="ra-footer__social-label">Follow Us:</span>
            {/* Facebook R&A */}
            <a href="https://www.facebook.com/61577203114572" target="_blank" rel="noopener noreferrer" className="ra-footer__soc-btn ra-footer__soc-btn--fb" title="Facebook R&A">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            {/* Facebook Rai Afraz */}
            <a href="https://www.facebook.com/raiafraz10" target="_blank" rel="noopener noreferrer" className="ra-footer__soc-btn ra-footer__soc-btn--fb" title="Facebook Rai Afraz">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            {/* TikTok */}
            <a href="https://www.tiktok.com/@rai_associates" target="_blank" rel="noopener noreferrer" className="ra-footer__soc-btn ra-footer__soc-btn--tt" title="TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </a>
            {/* Instagram */}
            <a href="https://www.instagram.com/rai_associates10" target="_blank" rel="noopener noreferrer" className="ra-footer__soc-btn ra-footer__soc-btn--ig" title="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            {/* YouTube */}
            <a href="https://www.youtube.com/@raiandassociates" target="_blank" rel="noopener noreferrer" className="ra-footer__soc-btn ra-footer__soc-btn--yt" title="YouTube">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            {/* WhatsApp */}
            <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-footer__soc-btn ra-footer__soc-btn--wa" title="WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
          <div className="ra-footer__bottom">
            <span>© {new Date().getFullYear()} <span className="ra-brand-caps">RAI & ASSOCIATES</span> Law Firm. All Rights Reserved.</span>
            <span><a href="https://www.raiandassociates.com.pk" target="_blank" rel="noopener noreferrer" className="ra-footer__web">🌐 www.raiandassociates.com.pk</a> · Est. 1993 — Lahore, Pakistan</span>
          </div>
        </div>
      </footer>

      {/* WHATSAPP FLOATING BUTTON — LEFT SIDE */}
      <a
        href="https://wa.me/923164371096?text=Hello%20RAI%20%26%20Associates%2C%20I%20need%20legal%20consultation."
        target="_blank"
        rel="noopener noreferrer"
        className="ra-wa-btn-fixed"
        title="Chat on WhatsApp"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="ra-wa-btn-fixed__text">WhatsApp</span>
      </a>

      {/* LEFT STICKY SIDEBAR */}
      <div className="ra-sidebar-left">
        <div className="ra-sidebar-left__inner">
          <div className="ra-sidebar-left__divider" />
          <div className="ra-sidebar-left__logo">
            <img src="/uploads/upload_1.PNG" alt="R&A" />
          </div>
          <div className="ra-sidebar-left__divider" />
          <span className="ra-sidebar-left__text">EST. 1993</span>
          <div className="ra-sidebar-left__divider" />
        </div>
      </div>

      {/* RIGHT STICKY SIDEBAR */}
      <div className="ra-sidebar-right">
        <div className="ra-sidebar-right__inner">
          <div className="ra-sidebar-right__divider" />
          <span className="ra-sidebar-right__text">LAHORE · PAKISTAN</span>
          <div className="ra-sidebar-right__divider" />
          <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-sidebar-right__wa" title="WhatsApp">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
          <div className="ra-sidebar-right__divider" />
          <span className="ra-sidebar-right__text">⚖️ JUSTICE</span>
          <div className="ra-sidebar-right__divider" />
        </div>
      </div>

    </div>
  )
}
