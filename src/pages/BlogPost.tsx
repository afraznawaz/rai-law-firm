import { useState, useEffect } from 'react'

interface Post {
  id: number
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  author: string
  published: boolean
  created_at: string
  updated_at: string
}

function renderContent(text: string) {
  if (!text) return ''
  return text
    .split('\n\n')
    .map((para, i) => {
      if (!para.trim()) return ''
      const html = para
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br/>')
      return `<p>${html}</p>`
    })
    .join('')
}

function setMeta(title: string, description: string, canonical: string) {
  // Title
  document.title = `${title} | RAI & Associates Law Firm`

  // Canonical
  let canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
  if (!canonicalEl) {
    canonicalEl = document.createElement('link')
    canonicalEl.rel = 'canonical'
    document.head.appendChild(canonicalEl)
  }
  canonicalEl.href = canonical

  // Meta description
  let descEl = document.querySelector('meta[name="description"]') as HTMLMetaElement
  if (!descEl) {
    descEl = document.createElement('meta')
    descEl.name = 'description'
    document.head.appendChild(descEl)
  }
  descEl.content = description.substring(0, 160)

  // OG tags
  const setOG = (property: string, content: string) => {
    let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('property', property)
      document.head.appendChild(el)
    }
    el.content = content
  }
  setOG('og:title', `${title} | RAI & Associates Law Firm`)
  setOG('og:description', description.substring(0, 160))
  setOG('og:url', canonical)
  setOG('og:type', 'article')
  setOG('og:site_name', 'RAI & Associates Law Firm')

  // No-index removal — ensure indexable
  const noindex = document.querySelector('meta[name="robots"]') as HTMLMetaElement
  if (noindex) noindex.content = 'index, follow'
}

function resetMeta() {
  document.title = 'RAI & Associates Law Firm | Est. 1993 | Lahore'
  const canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
  if (canonicalEl) canonicalEl.href = 'https://raiandassociates.com.pk/'
  const descEl = document.querySelector('meta[name="description"]') as HTMLMetaElement
  if (descEl) descEl.content = 'RAI & Associates Law Firm - Expert legal services in Tax Law, Corporate Law, Cybercrime, Intellectual Property and more. Based in Lahore, Pakistan.'
}

function addStructuredData(post: Post, canonical: string) {
  const existing = document.getElementById('blog-structured-data')
  if (existing) existing.remove()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': post.title,
    'description': post.excerpt,
    'author': {
      '@type': 'Person',
      'name': post.author,
      'jobTitle': 'Advocate',
      'worksFor': {
        '@type': 'LegalService',
        'name': 'RAI & Associates Law Firm'
      }
    },
    'publisher': {
      '@type': 'LegalService',
      'name': 'RAI & Associates Law Firm',
      'url': 'https://raiandassociates.com.pk'
    },
    'datePublished': post.created_at,
    'dateModified': post.updated_at || post.created_at,
    'url': canonical,
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonical
    },
    'articleSection': post.category,
    'keywords': `${post.category}, Pakistan law, legal advice, ${post.title}`
  }

  const script = document.createElement('script')
  script.id = 'blog-structured-data'
  script.type = 'application/ld+json'
  script.text = JSON.stringify(schema)
  document.head.appendChild(script)
}

export default function BlogPost({ slug, onBack }: { slug: string; onBack: () => void }) {
  const [post, setPost] = useState<Post | null>(null)
  const [related, setRelated] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/blog?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => {
        setPost(d)
        setLoading(false)
        if (d && d.slug) {
          const canonical = `https://raiandassociates.com.pk/blog/${d.slug}`
          setMeta(d.title, d.excerpt || '', canonical)
          addStructuredData(d, canonical)
          // Fetch related posts by same category
          fetch('/api/blog')
            .then(r => r.json())
            .then(all => {
              if (Array.isArray(all)) {
                const rel = all.filter(p => p.category === d.category && p.slug !== d.slug).slice(0, 3)
                setRelated(rel)
              }
            })
        }
      })
      .catch(() => setLoading(false))

    return () => {
      resetMeta()
      const sd = document.getElementById('blog-structured-data')
      if (sd) sd.remove()
    }
  }, [slug])

  if (loading) return (
    <div className="blog-post-loading">
      <div className="blog-post-skeleton" />
    </div>
  )
  if (!post) return <div className="blog-post-loading">Post not found.</div>

  return (
    <div className="blog-post-page">
      {/* Breadcrumb — helps Google crawl */}
      <nav className="blog-post-breadcrumb" aria-label="breadcrumb">
        <button onClick={onBack}>Legal Insights</button>
        <span>›</span>
        <span>{post.category}</span>
        <span>›</span>
        <span>{post.title.substring(0, 40)}{post.title.length > 40 ? '...' : ''}</span>
      </nav>

      <div className="blog-post-wrap">
        <div className="blog-post-cat">{post.category}</div>
        <h1 className="blog-post-title">{post.title}</h1>
        <div className="blog-post-meta">
          <span>✍️ {post.author}</span>
          <span>📅 {new Date(post.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>🏷️ {post.category}</span>
        </div>

        {/* Excerpt as intro */}
        <p className="blog-post-excerpt">{post.excerpt}</p>

        <div className="blog-post-body" dangerouslySetInnerHTML={{ __html: renderContent(post.content) }} />

        {/* Internal links to other blog categories */}
        <div className="blog-post-internal">
          <h4>📚 Related Legal Topics</h4>
          <div className="blog-post-internal__links">
            {['Tax Law', 'Corporate Law', 'Family Law', 'Criminal Law', 'Cybercrime & FIA', 'Intellectual Property', 'Civil Litigation', 'Revenue Law', 'Constitutional Law', 'Environmental Law']
              .filter(c => c !== post.category)
              .slice(0, 5)
              .map(cat => (
                <button key={cat} className="blog-post-internal__link" onClick={onBack}>{cat} →</button>
              ))}
          </div>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="blog-post-related">
            <h3>Related Articles</h3>
            <div className="blog-post-related__grid">
              {related.map(r => (
                <a key={r.id}
                  href={`/blog/${r.slug}`}
                  className="blog-post-related__card"
                  onClick={e => { e.preventDefault(); window.history.pushState({}, '', `/blog/${r.slug}`); window.dispatchEvent(new PopStateEvent('popstate')) }}>
                  <div className="blog-post-related__cat">{r.category}</div>
                  <div className="blog-post-related__title">{r.title}</div>
                  <div className="blog-post-related__read">Read Article →</div>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="blog-post-cta">
          <h3>Need Legal Advice?</h3>
          <p>Contact Rai & Associates for a free consultation.</p>
          <div className="blog-post-cta__btns">
            <a href="tel:+923044840937" className="blog-post-cta-btn">📞 Call: +92 304 484 0937</a>
            <a href="https://wa.me/923164371096" target="_blank" rel="noopener noreferrer" className="blog-post-cta-btn blog-post-cta-btn--wa">💬 WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  )
}
