import { useState } from 'react'

const NEWS_IMAGES = Array.from({ length: 22 }, (_, i) => `/news-events/news_${i + 1}.jpg`)

export default function NewsEvents({ onBack }: { onBack: () => void }) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  return (
    <div className="cert-page">
      <div className="cert-header">
        <div className="ra-container">
          <button className="cert-back" onClick={onBack}>← Back to Home</button>
          <div className="cert-header__content">
            <div className="ra-section__label">Latest Updates</div>
            <h1 className="cert-header__title">News & Events</h1>
            <div className="ra-divider ra-divider--center" />
            <p className="cert-header__sub">Events, seminars, legal proceedings and activities of Rai & Associates Law Firm</p>
          </div>
        </div>
      </div>

      <div className="cert-body">
        <div className="ra-container">
          <div className="news-grid">
            {NEWS_IMAGES.map((src, i) => (
              <div key={i} className="news-card" onClick={() => setLightbox(i)}>
                <div className="news-card__img-wrap">
                  <img src={src} alt={`Event ${i + 1}`} className="news-card__img"
                    onError={e => { (e.target as HTMLImageElement).closest('.news-card')?.remove() }} />
                  <div className="cert-card__overlay">
                    <span className="cert-card__view">🔍 Click to View</span>
                  </div>
                </div>
                <div className="news-card__footer">
                  <span>📸 Event Photo {i + 1}</span>
                  <button className="cert-card__btn">View →</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {lightbox !== null && (
        <div className="cert-lightbox" onClick={() => setLightbox(null)}>
          <div className="cert-lightbox__inner" onClick={e => e.stopPropagation()}>
            <button className="cert-lightbox__close" onClick={() => setLightbox(null)}>✕</button>
            <button className="cert-lightbox__nav cert-lightbox__nav--prev"
              onClick={() => setLightbox((lightbox - 1 + NEWS_IMAGES.length) % NEWS_IMAGES.length)}>‹</button>
            <img src={NEWS_IMAGES[lightbox]} alt={`Event ${lightbox + 1}`} className="cert-lightbox__img" />
            <div className="cert-lightbox__info">
              <h3>Event Photo {lightbox + 1}</h3>
              <p>RAI & Associates Law Firm — Events & Activities</p>
            </div>
            <button className="cert-lightbox__nav cert-lightbox__nav--next"
              onClick={() => setLightbox((lightbox + 1) % NEWS_IMAGES.length)}>›</button>
          </div>
        </div>
      )}
    </div>
  )
}
