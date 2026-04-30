import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Admin from './pages/Admin'
import BlogPost from './pages/BlogPost'

const NAV_LINKS = ['Home', 'About', 'Services', 'Expert', 'Blog', 'Reviews', 'Contact']

const SERVICES = [
  { icon: '⚖️', title: 'Tax Law', desc: 'Comprehensive tax advisory, planning, and litigation for individuals and corporations before all FBR tribunals.' },
  { icon: '🏛️', title: 'Civil Litigation', desc: 'Skilled representation in civil disputes, contract matters, property conflicts before all courts of Pakistan.' },
  { icon: '📋', title: 'Corporate Law', desc: 'Company formation, mergers & acquisitions, corporate governance, and SECP regulatory compliance.' },
  { icon: '🏠', title: 'Property & Real Estate', desc: 'Property transactions, title disputes, lease agreements, and real estate litigation across Punjab.' },
  { icon: '👨‍👩‍👧', title: 'Family Law', desc: 'Divorce, custody, inheritance, guardianship, and matrimonial property matters handled with care.' },
  { icon: '🔏', title: 'Criminal Defense', desc: 'Vigorous criminal defense at trial and appellate levels, ensuring every client a fair process.' },
  { icon: '📝', title: 'Contract Drafting', desc: 'Precise drafting, review, and negotiation of commercial contracts, MOUs, NDAs, and agreements.' },
  { icon: '🌐', title: 'Constitutional Law', desc: 'High Court and Supreme Court petitions, constitutional challenges, fundamental rights enforcement.' },
  { icon: '™️', title: 'Intellectual Property', desc: 'IPO trademark registration, copyright, patent protection and IP infringement litigation.' },
  { icon: '🧑‍💻', title: 'Cybercrime & FIA', desc: 'PECA 2016 defense, FIA cybercrime cases, online harassment and digital fraud defense.' },
  { icon: '🌿', title: 'Environmental Law', desc: 'EPA complaints, environmental impact assessments, pollution disputes and regulatory compliance.' },
  { icon: '📑', title: 'Revenue Law', desc: 'Land records, mutation disputes, Fard verification, and revenue court litigation across Punjab.' }
]

const SOCIAL_LINKS = [
  { icon: '📘', label: 'Facebook R&A', href: 'https://www.facebook.com/61577203114572', color: '#1877f2' },
  { icon: '📘', label: 'Facebook Rai Afraz', href: 'https://www.facebook.com/raiafraz10', color: '#1877f2' },
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

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 60)
    const sections = ['home', 'about', 'services', 'expert', 'blog', 'reviews', 'contact']
    for (const id of sections) {
      const el = document.getElementById(id)
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.top <= 100 && rect.bottom >= 100) { setActiveSection(id); break }
      }
    }
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

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
        <nav className="ra-nav ra-nav--scrolled" role="navigation" aria-label="Main navigation">
          <div className="ra-nav__inner">
            <div className="ra-nav__logo" onClick={() => setOpenPost(null)} style={{ cursor: 'pointer' }} role="button" aria-label="Go to homepage">
              <img src="/uploads/upload_1.PNG" alt="RAI & Associates Law Firm Logo" className="ra-nav__logo-img" width="52" height="52" />
              <div className="ra-nav__logo-text">
                <span className="ra-nav__logo-name">RAI & Associates</span>
                <span className="ra-nav__logo-sub">Law Firm — Est. 1993</span>
              </div>
            </div>
          </div>
        </nav>
        <BlogPost slug={openPost} onBack={() => setOpenPost(null)} />
        {/* WhatsApp Float */}
        <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-wa-float" aria-label="Chat on WhatsApp">
          <svg viewBox="0 0 24 24" fill="currentColor" className="ra-wa-float__icon" aria-hidden="true" width="28" height="28">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span className="ra-wa-float__text">WhatsApp Us</span>
        </a>
      </div>
    )
  }

  return (
    <div className="ra-root">
      {/* NAVBAR */}
      <nav className={`ra-nav ${scrolled ? 'ra-nav--scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="ra-nav__inner">
          <div className="ra-nav__logo" onClick={() => scrollTo('home')} role="button" aria-label="Go to homepage" tabIndex={0}>
            <img src="/uploads/upload_1.PNG" alt="RAI & Associates Law Firm Logo" className="ra-nav__logo-img" width="52" height="52" fetchPriority="high" />
            <div className="ra-nav__logo-text">
              <span className="ra-nav__logo-name">RAI & Associates</span>
              <span className="ra-nav__logo-sub">Law Firm — Est. 1993</span>
            </div>
          </div>
          <div className="ra-nav__links" role="menubar">
            {NAV_LINKS.map(link => (
              <button key={link} role="menuitem"
                className={`ra-nav__link ${activeSection === link.toLowerCase() ? 'ra-nav__link--active' : ''}`}
                onClick={() => scrollTo(link.toLowerCase())}
                aria-current={activeSection === link.toLowerCase() ? 'page' : undefined}>
                {link}
              </button>
            ))}
            <button className="ra-nav__cta" onClick={() => scrollTo('contact')} aria-label="Book a free consultation">Free Consultation</button>
          </div>
          <button className="ra-nav__burger" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
            <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
          </button>
        </div>
        {menuOpen && (
          <div className="ra-nav__mobile" role="menu">
            {NAV_LINKS.map(link => (
              <button key={link} role="menuitem" className="ra-nav__mobile-link" onClick={() => scrollTo(link.toLowerCase())}>{link}</button>
            ))}
            <button className="ra-nav__cta ra-nav__cta--mobile" onClick={() => scrollTo('contact')}>Free Consultation</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" className="ra-hero" aria-label="Hero section">
        <div className="ra-hero__overlay" aria-hidden="true" />
        <div className="ra-hero__content">
          <div className="ra-hero__badge">Established Since 1993</div>
          <h1 className="ra-hero__title"><span className="ra-hero__title-gold">RAI & Associates</span><br />Law Firm</h1>
          <p className="ra-hero__tagline">Committed to Justice — R & A</p>
          <p className="ra-hero__desc">Three decades of trusted legal excellence in Lahore. Specializing in Tax Law, Civil Litigation, Corporate Law, and Constitutional matters before all courts of Pakistan.</p>
          <div className="ra-hero__actions">
            <button className="ra-btn ra-btn--gold" onClick={() => scrollTo('contact')} aria-label="Book a free legal consultation">Book Consultation</button>
            <button className="ra-btn ra-btn--outline" onClick={() => scrollTo('services')} aria-label="View our legal services">Our Services</button>
          </div>
          <div className="ra-hero__bar">
            <span>🏛️ Punjab Bar Registration No. 144840</span>
            <span>📍 R&A Law Firm, 3-Fane Road, Tehreem Building, Lahore</span>
            <span>🌐 <a href="https://www.raiandassociates.com.pk" className="ra-hero__web-link" aria-label="Visit our website">www.raiandassociates.com.pk</a></span>
          </div>
        </div>
        <div className="ra-hero__scales" aria-hidden="true">
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
              <div className="ra-3d-card__glow" />
              <img src="/uploads/upload_1.PNG" alt="RAI & Associates Law Firm Logo" className="ra-3d-card__logo" />
              <div className="ra-3d-card__firm">RAI & Associates</div>
              <div className="ra-3d-card__sub">Law Firm — Est. 1993</div>
              <div className="ra-3d-card__line" />
              <div className="ra-3d-card__tagline">"Committed to Justice"</div>
              <div className="ra-3d-card__reg">Punjab Bar Reg. No. 144840</div>
            </div>
          </div>
          <div className="ra-3d-particles">
            {[...Array(14)].map((_, i) => <div key={i} className={`ra-3d-particle p${i+1}`} />)}
          </div>
          <div className="ra-3d-ring ra-3d-ring--1" />
          <div className="ra-3d-ring ra-3d-ring--2" />
          <div className="ra-3d-ring ra-3d-ring--3" />
          <div className="ra-3d-float f1"><span className="ra-3d-float__num">30+</span><span className="ra-3d-float__lbl">Years</span></div>
          <div className="ra-3d-float f2"><span className="ra-3d-float__num">5K+</span><span className="ra-3d-float__lbl">Cases Won</span></div>
          <div className="ra-3d-float f3"><span className="ra-3d-float__num">⚖️</span><span className="ra-3d-float__lbl">Justice</span></div>
          <div className="ra-3d-float f4"><span className="ra-3d-float__num">98%</span><span className="ra-3d-float__lbl">Success</span></div>
        </div>
        <div className="ra-3d-text">
          <div className="ra-section__label">Why Choose Us</div>
          <h2 className="ra-3d-text__title">Trusted Legal Excellence<br />Since 1993</h2>
          <div className="ra-divider" />
          <p className="ra-3d-text__desc">Pakistan's premier law firm delivering justice with integrity, expertise, and dedication. From tax tribunals to the Supreme Court — we fight for your rights.</p>
          <div className="ra-3d-text__points">
            <div className="ra-3d-point"><span>✓</span> Lahore High Court Practice</div>
            <div className="ra-3d-point"><span>✓</span> Tax Bar Association Member</div>
            <div className="ra-3d-point"><span>✓</span> FIA & Cybercrime Specialists</div>
            <div className="ra-3d-point"><span>✓</span> IPO Trademark Registration</div>
          </div>
          <button className="ra-btn ra-btn--gold" onClick={() => scrollTo('contact')}>Get Free Consultation →</button>
        </div>
      </section>

      {/* STATS */}
      <section className="ra-stats" aria-label="Key statistics">
        {STATS.map((s, i) => (
          <div key={i} className="ra-stats__item">
            <span className="ra-stats__value" aria-label={s.value}>{s.value}</span>
            <span className="ra-stats__label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ABOUT */}
      <section id="about" className="ra-section ra-about" aria-labelledby="about-heading">
        <div className="ra-container">
          <div className="ra-about__grid">
            <div className="ra-about__img-col">
              <div className="ra-about__logo-wrap">
                <img src="/uploads/upload_1.PNG" alt="RAI & Associates Law Firm official logo" className="ra-about__logo" width="220" height="220" loading="lazy" />
                <div className="ra-about__est" aria-label="Established 1993">EST. 1993</div>
              </div>
              <div className="ra-about__ceo">
                <div className="ra-about__ceo-avatar" aria-hidden="true">RA</div>
                <div>
                  <div className="ra-about__ceo-name">Rai Afraz ⚖️</div>
                  <div className="ra-about__ceo-role">CEO & Advocate</div>
                  <div className="ra-about__ceo-tag">Lahore Tax Bar Association</div>
                </div>
              </div>
            </div>
            <div className="ra-about__text-col">
              <div className="ra-section__label">About Our Firm</div>
              <h2 className="ra-section__title" id="about-heading">Welcome to Rai & Associates ⚖️</h2>
              <p className="ra-about__tagline">Legal Solutions for the Modern World</p>
              <div className="ra-divider" aria-hidden="true" />
              <p className="ra-about__para">We are a <strong>Professional Law Firm</strong> based in Lahore, offering expert legal services designed for the complexities of today's world. From corporate disputes to digital crimes, we provide legal clarity and protection at every step.</p>
              <ul className="ra-about__services-list" aria-label="Core practice areas">
                <li className="ra-about__sitem"><span aria-hidden="true">📑</span><span><strong>Tax & Corporate Law Litigation</strong> — Expert handling of tax disputes and corporate legal matters before all tribunals.</span></li>
                <li className="ra-about__sitem"><span aria-hidden="true">™️</span><span><strong>Intellectual Property (IPO & Trademark Registration)</strong> — Protecting your brand, inventions, and creative works.</span></li>
                <li className="ra-about__sitem"><span aria-hidden="true">🧑‍💻</span><span><strong>Cybercrime & FIA Matters</strong> — Specialized defense and advisory for digital crimes and FIA investigations.</span></li>
              </ul>
              <div className="ra-about__offices" aria-label="Office locations">
                <h3 className="ra-about__offices-title">🏢 Our Offices</h3>
                <address className="ra-about__office">
                  <span className="ra-about__office-icon" aria-hidden="true">📍</span>
                  <div><div className="ra-about__office-name">R&A Law Firm</div><div className="ra-about__office-addr">3-Fane Road, Tehreem Building, Lahore</div></div>
                </address>
                <address className="ra-about__office">
                  <span className="ra-about__office-icon" aria-hidden="true">📍</span>
                  <div><div className="ra-about__office-name">Tax Consultancy Office</div><div className="ra-about__office-addr">Near Eiffel Tower, Bahria Town, Lahore</div></div>
                </address>
              </div>
              <div className="ra-about__social" aria-label="Social media links">
                <h3 className="ra-about__social-title">📲 Follow Us</h3>
                <div className="ra-about__social-links">
                  {SOCIAL_LINKS.map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer" className="ra-about__social-btn"
                      style={{ '--sc': s.color } as React.CSSProperties} aria-label={`Follow us on ${s.label}`}>
                      <span aria-hidden="true">{s.icon}</span><span>{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="ra-section ra-services" aria-labelledby="services-heading">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">What We Do</div>
            <h2 className="ra-section__title" id="services-heading">Our Legal Services</h2>
            <div className="ra-divider ra-divider--center" aria-hidden="true" />
            <p className="ra-section__subtitle">Comprehensive legal solutions tailored to protect your rights and interests</p>
          </div>
          <div className="ra-services__grid" role="list">
            {SERVICES.map((s, i) => (
              <article key={i} className="ra-service-card" role="listitem">
                <div className="ra-service-card__icon" aria-hidden="true">{s.icon}</div>
                <h3 className="ra-service-card__title">{s.title}</h3>
                <p className="ra-service-card__desc">{s.desc}</p>
                <button className="ra-service-card__link" onClick={() => scrollTo('contact')} aria-label={`Enquire about ${s.title}`}>Enquire →</button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERT */}
      <section id="expert" className="ra-section ra-experts" aria-labelledby="expert-heading">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Meet The Expert</div>
            <h2 className="ra-section__title" id="expert-heading">Rai Afraz — CEO & Advocate</h2>
            <div className="ra-divider ra-divider--center" aria-hidden="true" />
            <p className="ra-section__subtitle">Dedicated advocate committed to delivering justice</p>
          </div>
          <div className="ra-expert-solo">
            <div className="ra-expert-solo__photo-wrap">
              <div className="ra-expert-solo__photo-bg">
                <img src="/images/legal-bg.png" alt="" className="ra-expert-solo__bg-img" aria-hidden="true" width="380" height="418" loading="lazy" />
                <img src="/uploads/rai-afraz.jpg" alt="Rai Afraz — Advocate and CEO of RAI & Associates Law Firm Lahore" className="ra-expert-solo__photo"
                  width="380" height="418" loading="lazy"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                <div className="ra-expert-solo__name-overlay" aria-hidden="true">Rai Afraz ⚖️</div>
              </div>
            </div>
            <div className="ra-expert-solo__info">
              <div className="ra-expert-solo__badge">CEO & Founding Partner</div>
              <h2 className="ra-expert-solo__name">Rai Afraz (Advocate) ⚖️</h2>
              <p className="ra-expert-solo__bar">Member, Lahore Tax Bar Association</p>
              <ul className="ra-expert-solo__tags" aria-label="Specializations">
                <li>Tax Law Litigation</li><li>FIA Cases</li><li>Corporate Law</li>
                <li>Cybercrime Defense</li><li>IPO & Trademark</li>
              </ul>
              <div className="ra-expert-solo__reg">
                <span>🏛️ Punjab Bar Reg. No. 144840</span>
              </div>
              <p className="ra-expert-solo__bio">Rai Afraz is the CEO and Founding Partner of Rai & Associates Law Firm. Specialized in Tax Law Litigation and FIA Cases, he brings deep expertise in navigating Pakistan's complex legal landscape. As a registered member of the Lahore Tax Bar Association, he has successfully represented hundreds of clients before tax tribunals, the Lahore High Court, and the Supreme Court of Pakistan.</p>
              <div className="ra-expert-solo__actions">
                <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-btn ra-btn--gold" aria-label="Contact Rai Afraz on WhatsApp">💬 WhatsApp</a>
                <a href="tel:+923044840937" className="ra-btn ra-btn--outline" aria-label="Call Rai Afraz">📞 Call Now</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section id="blog" className="ra-section ra-blog" aria-labelledby="blog-heading">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Knowledge Hub</div>
            <h2 className="ra-section__title" id="blog-heading">Legal Insights</h2>
            <div className="ra-divider ra-divider--center" aria-hidden="true" />
            <p className="ra-section__subtitle">Expert legal articles and updates from Rai & Associates</p>
          </div>
          <div className="ra-blog__filters" role="group" aria-label="Filter articles by category">
            {categories.map(cat => (
              <button key={cat} className={`ra-blog__filter ${blogFilter === cat ? 'active' : ''}`}
                onClick={() => setBlogFilter(cat)} aria-pressed={blogFilter === cat}>{cat}</button>
            ))}
          </div>
          {postsLoading ? (
            <div className="ra-blog__loading" aria-label="Loading articles" aria-busy="true">
              {[1,2,3].map(i => <div key={i} className="ra-blog__skeleton" aria-hidden="true" />)}
            </div>
          ) : (
            <div className="ra-blog__grid" role="list">
              {filteredPosts.map(post => (
                <article key={post.id} className="ra-blog-card" onClick={() => setOpenPost(post.slug)} role="listitem"
                  tabIndex={0} onKeyDown={e => e.key === 'Enter' && setOpenPost(post.slug)}>
                  <div className="ra-blog-card__cat">{post.category}</div>
                  <h3 className="ra-blog-card__title">{post.title}</h3>
                  <p className="ra-blog-card__excerpt">{post.excerpt}</p>
                  <div className="ra-blog-card__footer">
                    <span className="ra-blog-card__author">✍️ {post.author}</span>
                    <span className="ra-blog-card__date"><time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</time></span>
                  </div>
                  <span className="ra-blog-card__read" aria-label={`Read article: ${post.title}`}>Read Article →</span>
                </article>
              ))}
            </div>
          )}
          {!postsLoading && filteredPosts.length === 0 && (
            <p className="ra-blog__empty">No posts in this category yet.</p>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="ra-section ra-reviews" aria-labelledby="reviews-heading">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Client Testimonials</div>
            <h2 className="ra-section__title" id="reviews-heading">What Our Clients Say</h2>
            <div className="ra-divider ra-divider--center" aria-hidden="true" />
            <p className="ra-section__subtitle">Genuine reviews from our clients across Pakistan</p>
          </div>
          {reviewsLoading ? (
            <div className="ra-reviews__loading" aria-busy="true">
              {[1,2,3].map(i => <div key={i} className="ra-reviews__skeleton" aria-hidden="true" />)}
            </div>
          ) : (
            <>
              <div className="ra-reviews__featured" aria-label="Featured client review" aria-live="polite">
                {reviews.map((r, i) => (
                  <div key={r.id} className={`ra-reviews__slide ${i === activeReview ? 'active' : ''}`} aria-hidden={i !== activeReview}>
                    <div className="ra-reviews__quote" aria-hidden="true">"</div>
                    <p className="ra-reviews__text">{r.review}</p>
                    <div className="ra-reviews__stars" aria-label={`${r.rating} out of 5 stars`}>{'★'.repeat(r.rating)}</div>
                    <div className="ra-reviews__author">
                      <div className="ra-reviews__avatar" aria-hidden="true">{r.name.charAt(0)}</div>
                      <div>
                        <div className="ra-reviews__name">{r.name}</div>
                        <div className="ra-reviews__meta">{r.city} · {r.service}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="ra-reviews__dots" role="tablist" aria-label="Review navigation">
                  {reviews.map((_, i) => (
                    <button key={i} role="tab" aria-selected={i === activeReview} aria-label={`Review ${i + 1}`}
                      className={`ra-reviews__dot ${i === activeReview ? 'active' : ''}`} onClick={() => setActiveReview(i)} />
                  ))}
                </div>
              </div>
              <div className="ra-reviews__grid" role="list">
                {reviews.map((r) => (
                  <article key={r.id} className="ra-review-card" role="listitem">
                    <div className="ra-review-card__top">
                      <div className="ra-review-card__avatar" aria-hidden="true">{r.name.charAt(0)}</div>
                      <div>
                        <div className="ra-review-card__name">{r.name}</div>
                        <div className="ra-review-card__loc">📍 {r.city}</div>
                      </div>
                      <div className="ra-review-card__stars" aria-label={`${r.rating} stars`}>{'★'.repeat(r.rating)}</div>
                    </div>
                    <p className="ra-review-card__text">"{r.review}"</p>
                    <div className="ra-review-card__service">{r.service}</div>
                  </article>
                ))}
              </div>
              <div className="ra-reviews__overall" aria-label="Overall rating">
                <div className="ra-reviews__overall-score" aria-label="5 out of 5">5.0</div>
                <div>
                  <div className="ra-reviews__overall-stars" aria-hidden="true">★★★★★</div>
                  <div className="ra-reviews__overall-label">Average Rating · {reviews.length} Reviews</div>
                </div>
                <div className="ra-reviews__overall-badge">⚖️ Verified Clients</div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="ra-section ra-contact" aria-labelledby="contact-heading">
        <div className="ra-container">
          <div className="ra-section__header">
            <div className="ra-section__label">Get In Touch</div>
            <h2 className="ra-section__title" id="contact-heading">Contact Us</h2>
            <div className="ra-divider ra-divider--center" aria-hidden="true" />
            <p className="ra-section__subtitle">Schedule a consultation with our legal experts today</p>
          </div>
          <div className="ra-contact__grid">
            <div className="ra-contact__info">
              <h3 className="ra-contact__info-title">Office Information</h3>
              <address className="ra-contact__details">
                <div className="ra-contact__detail"><div className="ra-contact__detail-icon" aria-hidden="true">📍</div><div><div className="ra-contact__detail-label">R&A Law Firm</div><div className="ra-contact__detail-value">3-Fane Road, Tehreem Building, Lahore</div></div></div>
                <div className="ra-contact__detail"><div className="ra-contact__detail-icon" aria-hidden="true">📍</div><div><div className="ra-contact__detail-label">Tax Consultancy Office</div><div className="ra-contact__detail-value">Near Eiffel Tower, Bahria Town, Lahore</div></div></div>
                <div className="ra-contact__detail"><div className="ra-contact__detail-icon" aria-hidden="true">📞</div><div><div className="ra-contact__detail-label">Call</div><a href="tel:+923044840937" className="ra-contact__detail-value ra-contact__link">+92 304 484 0937</a></div></div>
                <div className="ra-contact__detail"><div className="ra-contact__detail-icon" aria-hidden="true">💬</div><div><div className="ra-contact__detail-label">WhatsApp</div><a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="ra-contact__detail-value ra-contact__link">+92 316 437 1096</a></div></div>
                <div className="ra-contact__detail"><div className="ra-contact__detail-icon" aria-hidden="true">✉️</div><div><div className="ra-contact__detail-label">Email</div><a href="mailto:afrazrai4457@gmail.com" className="ra-contact__detail-value ra-contact__link">afrazrai4457@gmail.com</a></div></div>
                <div className="ra-contact__detail"><div className="ra-contact__detail-icon" aria-hidden="true">🕐</div><div><div className="ra-contact__detail-label">Office Hours</div><div className="ra-contact__detail-value">Mon – Sat: 9:00 AM – 6:00 PM</div></div></div>
              </address>
            </div>
            <div className="ra-contact__form-wrap">
              <h3 className="ra-contact__form-title">Send Us a Message</h3>
              {submitted ? (
                <div className="ra-contact__success" role="alert">
                  <div className="ra-contact__success-icon" aria-hidden="true">✓</div>
                  <p>Thank you! We will contact you shortly.</p>
                </div>
              ) : (
                <form className="ra-contact__form" onSubmit={handleSubmit} noValidate>
                  <div className="ra-form__row">
                    <div className="ra-form__group">
                      <label htmlFor="name">Full Name *</label>
                      <input id="name" required placeholder="Your full name" value={formData.name} autoComplete="name"
                        onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="ra-form__group">
                      <label htmlFor="phone">Phone Number *</label>
                      <input id="phone" required placeholder="03XX XXXXXXX" value={formData.phone} autoComplete="tel" type="tel"
                        onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="ra-form__group">
                    <label htmlFor="email">Email Address</label>
                    <input id="email" type="email" placeholder="your@email.com" value={formData.email} autoComplete="email"
                      onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="ra-form__group">
                    <label htmlFor="subject">Subject *</label>
                    <select id="subject" required value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })}>
                      <option value="">Select a service</option>
                      <option>Tax Law</option><option>Civil Litigation</option><option>Corporate Law</option>
                      <option>Property & Real Estate</option><option>Family Law</option><option>Criminal Defense</option>
                      <option>Contract Drafting</option><option>Constitutional Law</option><option>Cybercrime & FIA</option>
                      <option>Intellectual Property</option><option>Revenue Law</option><option>Other</option>
                    </select>
                  </div>
                  <div className="ra-form__group">
                    <label htmlFor="message">Message *</label>
                    <textarea id="message" required rows={4} placeholder="Briefly describe your legal matter..." value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })} />
                  </div>
                  <button type="submit" className="ra-btn ra-btn--gold ra-btn--full">Send Message</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ra-footer" role="contentinfo">
        <div className="ra-container">
          <div className="ra-footer__grid">
            <div className="ra-footer__brand">
              <img src="/uploads/upload_1.PNG" alt="RAI & Associates Law Firm" className="ra-footer__logo" width="80" height="80" loading="lazy" />
              <p className="ra-footer__brand-text">Committed to Justice since 1993. Trusted legal advocates serving Lahore and all of Pakistan.</p>
              <div className="ra-footer__reg">Punjab Bar Reg. No. 144840</div>
            </div>
            <nav className="ra-footer__col" aria-label="Services">
              <h4>Services</h4>
              <ul>{SERVICES.slice(0, 6).map((s, i) => <li key={i}><button onClick={() => scrollTo('services')}>{s.title}</button></li>)}</ul>
            </nav>
            <nav className="ra-footer__col" aria-label="More services">
              <h4>More Services</h4>
              <ul>{SERVICES.slice(6).map((s, i) => <li key={i}><button onClick={() => scrollTo('services')}>{s.title}</button></li>)}</ul>
            </nav>
            <div className="ra-footer__col">
              <h4>Contact</h4>
              <address>
                <ul>
                  <li>📍 R&A Law Firm, 3-Fane Road, Tehreem Building, Lahore</li>
                  <li>📍 Near Eiffel Tower, Bahria Town, Lahore</li>
                  <li><a href="tel:+923044840937">📞 +92 304 484 0937</a></li>
                  <li><a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer">💬 +92 316 437 1096</a></li>
                  <li><a href="mailto:afrazrai4457@gmail.com">✉️ afrazrai4457@gmail.com</a></li>
                </ul>
              </address>
            </div>
          </div>
          <div className="ra-footer__social" aria-label="Social media links">
            <span className="ra-footer__social-label">Follow Us:</span>
            {SOCIAL_LINKS.map((s, i) => (
              <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                className="ra-footer__social-link" aria-label={s.label}>{s.icon}</a>
            ))}
          </div>
          <div className="ra-footer__bottom">
            <span>© {new Date().getFullYear()} RAI & Associates Law Firm. All Rights Reserved.</span>
            <span>Est. 1993 — Lahore, Pakistan</span>
          </div>
        </div>
      </footer>

      {/* WHATSAPP FLOATING BUTTON */}
      <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer"
        className="ra-wa-float" aria-label="Chat with RAI & Associates on WhatsApp">
        <svg viewBox="0 0 24 24" fill="currentColor" className="ra-wa-float__icon" aria-hidden="true" width="28" height="28">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="ra-wa-float__text">WhatsApp Us</span>
      </a>
    </div>
  )
}
