import { useState, useEffect } from 'react'
import './App.css'
import Admin from './pages/Admin'
import BlogPost from './pages/BlogPost'

const NAV_LINKS = ['Home', 'About', 'Services', 'Expert', 'Blog', 'Reviews', 'Contact']

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
  { icon: '📘', label: 'Facebook (R&A)', href: 'https://www.facebook.com/61577203114572', color: '#1877f2' },
  { icon: '📘', label: 'Facebook (Rai Afraz)', href: 'https://www.facebook.com/raiafraz10', color: '#1877f2' },
  { icon: '🎵', label: 'TikTok', href: 'https://www.tiktok.com/@rai_associates', color: '#010101' },
  { icon: '📸', label: 'Instagram', href: 'https://www.instagram.com/rai_associates10', color: '#e1306c' },
  { icon: '▶️', label: 'YouTube', href: 'https://www.youtube.com/@raiandassociates', color: '#ff0000' },
  { icon: '💬', label: 'WhatsApp', href: 'https://wa.me/923164371096', color: '#25d366' },
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [openPost, setOpenPost] = useState<string | null>(null)
  const [blogFilter, setBlogFilter] = useState('All')
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [activeReview, setActiveReview] = useState(0)

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
      const sections = ['home', 'about', 'services', 'expert', 'blog', 'reviews', 'contact']
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
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  const categories = ['All', ...Array.from(new Set(posts.map(p => p.category)))]
  const filteredPosts = blogFilter === 'All' ? posts : posts.filter(p => p.category === blogFilter)

  if (openPost) {
    return (
      <div>
        <nav className="ra-nav ra-nav--scrolled">
          <div className="ra-nav__inner">
            <div className="ra-nav__logo" onClick={() => setOpenPost(null)} style={{ cursor: 'pointer' }}>
              <img src="/uploads/upload_1.PNG" alt="RAI & Associates" className="ra-nav__logo-img" />
              <div className="ra-nav__logo-text">
                <span className="ra-nav__logo-name">RAI & Associates</span>
                <span className="ra-nav__logo-sub">Law Firm — Est. 1993</span>
              </div>
            </div>
          </div>
        </nav>
        <BlogPost slug={openPost} onBack={() => setOpenPost(null)} />
      </div>
    )
  }

  return (
    <div className="ra-root">
      {/* NAVBAR */}
      <nav className={`ra-nav ${scrolled ? 'ra-nav--scrolled' : ''}`}>
        <div className="ra-nav__inner">
          <div className="ra-nav__logo" onClick={() => scrollTo('home')}>
            <img src="/uploads/upload_1.PNG" alt="RAI & Associates" className="ra-nav__logo-img" />
            <div className="ra-nav__logo-text">
              <span className="ra-nav__logo-name">RAI & Associates</span>
              <span className="ra-nav__logo-sub">Law Firm — Est. 1993</span>
            </div>
          </div>
          <div className="ra-nav__links">
            {NAV_LINKS.map(link => (
              <button key={link}
                className={`ra-nav__link ${activeSection === link.toLowerCase() ? 'ra-nav__link--active' : ''}`}
                onClick={() => scrollTo(link.toLowerCase())}>{link}</button>
            ))}
            <button className="ra-nav__cta" onClick={() => scrollTo('contact')}>Free Consultation</button>
          </div>
          <button className="ra-nav__burger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
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
        <div className="ra-hero__content">
          <div className="ra-hero__badge">Established Since 1993</div>
          <h1 className="ra-hero__title"><span className="ra-hero__title-gold">RAI & Associates</span><br />Law Firm</h1>
          <p className="ra-hero__tagline">Committed to Justice — R & A</p>
          <p className="ra-hero__desc">Three decades of trusted legal excellence in Lahore. Specializing in Tax Law, Civil Litigation, Corporate Law, and Constitutional matters before all courts of Pakistan.</p>
          <div className="ra-hero__actions">
            <button className="ra-btn ra-btn--gold" onClick={() => scrollTo('contact')}>Book Consultation</button>
            <button className="ra-btn ra-btn--outline" onClick={() => scrollTo('services')}>Our Services</button>
          </div>
          <div className="ra-hero__bar">
            <span>🏛️ Punjab Bar Registration No. 144840</span>
            <span>📍 R&A Law Firm, 3-Fane Road, Tehreem Building, Lahore</span>
            <span>🌐 <a href="https://www.rai%26associates.com.pk" target="_blank" rel="noopener noreferrer" className="ra-hero__web-link">www.rai&associates.com.pk</a></span>
          </div>
        </div>
        <div className="ra-hero__scales">
          <div className="ra-scales">
            <div className="ra-scales__beam" />
            <div className="ra-scales__center" />
            <div className="ra-scales__pan ra-scales__pan--left"><div className="ra-scales__pan-inner" /></div>
            <div className="ra-scales__pan ra-scales__pan--right"><div className="ra-scales__pan-inner" /></div>
          </div>
        </div>
      </section>

      {/* 3D SHOWCASE */}
      <section className="ra-3d-section">
        <div className="ra-3d-scene">
          <div className="ra-3d-card">
            <div className="ra-3d-card__inner">
              <div className="ra-3d-card__front">
                <div className="ra-3d-card__glow" />
                <img src="/uploads/upload_1.PNG" alt="RAI & Associates" className="ra-3d-card__logo" />
                <div className="ra-3d-card__firm">RAI & Associates</div>
                <div className="ra-3d-card__sub">Law Firm — Est. 1993</div>
                <div className="ra-3d-card__line" />
                <div className="ra-3d-card__tagline">Committed to Justice</div>
              </div>
            </div>
          </div>
          <div className="ra-3d-particles">
            {[...Array(12)].map((_, i) => <div key={i} className={`ra-3d-particle ra-3d-particle--${i+1}`} />)}
          </div>
          <div className="ra-3d-float ra-3d-float--1"><span className="ra-3d-float__num">30+</span><span className="ra-3d-float__lbl">Years</span></div>
          <div className="ra-3d-float ra-3d-float--2"><span className="ra-3d-float__num">5K+</span><span className="ra-3d-float__lbl">Cases</span></div>
          <div className="ra-3d-float ra-3d-float--3"><span className="ra-3d-float__num">⚖️</span><span className="ra-3d-float__lbl">Justice</span></div>
          <div className="ra-3d-float ra-3d-float--4"><span className="ra-3d-float__num">98%</span><span className="ra-3d-float__lbl">Success</span></div>
          <div className="ra-3d-ring ra-3d-ring--1" />
          <div className="ra-3d-ring ra-3d-ring--2" />
        </div>
        <div className="ra-3d-text">
          <h2 className="ra-3d-text__title">Trusted Legal Excellence</h2>
          <p className="ra-3d-text__desc">Pakistan's premier law firm delivering justice with integrity, expertise, and dedication since 1993.</p>
          <button className="ra-btn ra-btn--gold" onClick={() => scrollTo('contact')}>Get Free Consultation →</button>
        </div>
      </section>

      {/* 3D SHOWCASE */}
      <section className="ra-3d-section">
        <div className="ra-3d-scene">
          <div className="ra-3d-ring ra-3d-ring--1" />
          <div className="ra-3d-ring ra-3d-ring--2" />
          <div className="ra-3d-ring ra-3d-ring--3" />
          <div className="ra-3d-card">
            <div className="ra-3d-card__inner">
              <div className="ra-3d-card__glow" />
              <img src="/uploads/upload_1.PNG" alt="RAI & Associates" className="ra-3d-card__logo" />
              <div className="ra-3d-card__firm">RAI & Associates</div>
              <div className="ra-3d-card__sub">Law Firm — Est. 1993</div>
              <div className="ra-3d-card__divider" />
              <div className="ra-3d-card__tagline">⚖️ Committed to Justice</div>
            </div>
          </div>
          <div className="ra-3d-float ra-3d-float--1"><span className="ra-3d-float__num">30+</span><span className="ra-3d-float__lbl">Years</span></div>
          <div className="ra-3d-float ra-3d-float--2"><span className="ra-3d-float__num">5K+</span><span className="ra-3d-float__lbl">Cases</span></div>
          <div className="ra-3d-float ra-3d-float--3"><span className="ra-3d-float__num">98%</span><span className="ra-3d-float__lbl">Success</span></div>
          <div className="ra-3d-float ra-3d-float--4"><span className="ra-3d-float__num">⚖️</span><span className="ra-3d-float__lbl">Justice</span></div>
          {[...Array(10)].map((_, i) => <div key={i} className={`ra-3d-particle ra-3d-p${i}`} />)}
        </div>
        <div className="ra-3d-text">
          <div className="ra-section__label">Why Choose Us</div>
          <h2 className="ra-3d-text__title">Trusted Legal Excellence<br /><span>Since 1993</span></h2>
          <p className="ra-3d-text__desc">Pakistan's premier law firm delivering justice with integrity, expertise, and dedication. From Tax Law to FIA cases — we fight for your rights.</p>
          <div className="ra-3d-text__features">
            <div className="ra-3d-feat"><span>✓</span> Lahore High Court Practice</div>
            <div className="ra-3d-feat"><span>✓</span> Tax Bar Association Member</div>
            <div className="ra-3d-feat"><span>✓</span> FIA & Cybercrime Specialist</div>
            <div className="ra-3d-feat"><span>✓</span> Free Initial Consultation</div>
          </div>
          <button className="ra-btn ra-btn--gold" onClick={() => scrollTo('contact')}>Get Free Consultation →</button>
        </div>
      </section>

      {/* 3D SHOWCASE */}
      <section className="ra-3d-section">
        <div className="ra-3d-scene">
          <div className="ra-3d-card">
            <div className="ra-3d-card__inner">
              <div className="ra-3d-card__front">
                <div className="ra-3d-card__glow" />
                <img src="/uploads/upload_1.PNG" alt="RAI & Associates" className="ra-3d-card__logo" />
                <div className="ra-3d-card__firm">RAI & Associates</div>
                <div className="ra-3d-card__sub">Law Firm — Est. 1993</div>
                <div className="ra-3d-card__line" />
                <div className="ra-3d-card__tagline">Committed to Justice</div>
              </div>
            </div>
          </div>
          <div className="ra-3d-particles">
            {[...Array(12)].map((_, i) => <div key={i} className={`ra-3d-particle ra-3d-particle--${i+1}`} />)}
          </div>
          <div className="ra-3d-float ra-3d-float--1"><span className="ra-3d-float__num">30+</span><span className="ra-3d-float__lbl">Years</span></div>
          <div className="ra-3d-float ra-3d-float--2"><span className="ra-3d-float__num">5K+</span><span className="ra-3d-float__lbl">Cases</span></div>
          <div className="ra-3d-float ra-3d-float--3"><span className="ra-3d-float__num">⚖️</span><span className="ra-3d-float__lbl">Justice</span></div>
          <div className="ra-3d-float ra-3d-float--4"><span className="ra-3d-float__num">98%</span><span className="ra-3d-float__lbl">Success</span></div>
          <div className="ra-3d-ring ra-3d-ring--1" />
          <div className="ra-3d-ring ra-3d-ring--2" />
        </div>
        <div className="ra-3d-text">
          <h2 className="ra-3d-text__title">Trusted Legal Excellence</h2>
          <p className="ra-3d-text__desc">Pakistan's premier law firm delivering justice with integrity, expertise, and dedication since 1993.</p>
          <button className="ra-btn ra-btn--gold" onClick={() => scrollTo('contact')}>Get Free Consultation →</button>
        </div>
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
              <h2 className="ra-section__title">Welcome to Rai & Associates ⚖️</h2>
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
                      <span>{s.icon}</span><span>{s.label}</span>
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

      {/* EXPERT — Only Rai Afraz */}
      <section id="expert" className="ra-section ra-experts">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Meet The Expert</div>
            <h2 className="ra-section__title">Rai Afraz — CEO & Advocate</h2>
            <div className="ra-divider ra-divider--center" />
            <p className="ra-section__subtitle">Dedicated advocate committed to delivering justice</p>
          </div>
          <div className="ra-expert-solo">
            <div className="ra-expert-solo__photo-wrap">
              <div className="ra-expert-solo__photo-bg">
                <img src="/images/legal-bg.png" alt="Legal Background" className="ra-expert-solo__bg-img" />
                <img src="/uploads/rai-afraz.jpg" alt="Rai Afraz" className="ra-expert-solo__photo"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div className="ra-expert-solo__name-overlay">Rai Afraz ⚖️</div>
              </div>
            </div>
            <div className="ra-expert-solo__info">
              <div className="ra-expert-solo__badge">CEO & Founding Partner</div>
              <h2 className="ra-expert-solo__name">Rai Afraz (Advocate) ⚖️</h2>
              <p className="ra-expert-solo__bar">Member, Lahore Tax Bar Association</p>
              <div className="ra-expert-solo__tags">
                <span>Tax Law Litigation</span>
                <span>FIA Cases</span>
                <span>Corporate Law</span>
                <span>Cybercrime Defense</span>
                <span>IPO & Trademark</span>
              </div>
              <div className="ra-expert-solo__reg">
                <span>🏛️ Punjab Bar Reg. No. 144840</span>
              </div>
              <p className="ra-expert-solo__bio">
                Rai Afraz is the CEO and Founding Partner of Rai & Associates Law Firm. 
                Specialized in Tax Law Litigation and FIA Cases, he brings deep expertise 
                in navigating Pakistan's complex legal landscape. As a registered member of 
                the Lahore Tax Bar Association, he has successfully represented hundreds of 
                clients before tax tribunals, the Lahore High Court, and the Supreme Court of Pakistan.
              </p>
              <div className="ra-expert-solo__actions">
                <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-btn ra-btn--gold">💬 WhatsApp</a>
                <a href="tel:+923044840937" className="ra-btn ra-btn--outline">📞 Call Now</a>
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
            <p className="ra-section__subtitle">Expert legal articles and updates from Rai & Associates</p>
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
                <div className="ra-contact__detail"><div className="ra-contact__detail-icon">🏛️</div><div><div className="ra-contact__detail-label">Punjab Bar Registration</div><div className="ra-contact__detail-value">No. 144840</div></div></div>
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
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ra-footer">
        <div className="ra-container">
          <div className="ra-footer__grid">
            <div className="ra-footer__brand">
              <img src="/uploads/upload_1.PNG" alt="RAI & Associates" className="ra-footer__logo" />
              <p className="ra-footer__brand-text">Committed to Justice since 1993. Trusted legal advocates serving Lahore and all of Pakistan.</p>
              <div className="ra-footer__reg">Punjab Bar Reg. No. 144840</div>
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
                <li><a href="https://www.rai%26associates.com.pk" target="_blank" rel="noopener noreferrer">🌐 www.rai&associates.com.pk</a></li>
              </ul>
            </div>
          </div>
          <div className="ra-footer__social">
            <span className="ra-footer__social-label">Follow Us:</span>
            {SOCIAL_LINKS.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="ra-footer__social-link" title={s.label}>{s.icon}</a>
            ))}
          </div>
          <div className="ra-footer__bottom">
            <span>© {new Date().getFullYear()} RAI & Associates Law Firm. All Rights Reserved.</span>
            <span><a href="https://www.rai%26associates.com.pk" target="_blank" rel="noopener noreferrer" className="ra-footer__web">🌐 www.rai&associates.com.pk</a> · Est. 1993 — Lahore, Pakistan</span>
          </div>
        </div>
      </footer>
      {/* WHATSAPP FLOATING BUTTON */}
      <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-wa-float" title="Chat on WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor" className="ra-wa-float__icon">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="ra-wa-float__text">Chat with Us</span>
      </a>
      {/* WHATSAPP FLOATING BUTTON */}
      <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-wa-float" title="Chat on WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor" className="ra-wa-float__icon">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="ra-wa-float__text">WhatsApp Us</span>
      </a>
      {/* WHATSAPP FLOATING BUTTON */}
      <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-wa-float" title="Chat on WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor" className="ra-wa-float__icon">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="ra-wa-float__text">WhatsApp</span>
      </a>
    </div>
  )
}
