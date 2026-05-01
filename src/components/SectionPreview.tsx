import { useState, useRef, useEffect } from 'react'

interface Props {
  id: string
  label: string
  title: string
  summary: string
  icon: string
  children: React.ReactNode
  accentColor?: string
}

export default function SectionPreview({ id, label, title, summary, icon, children, accentColor = 'var(--gold)' }: Props) {
  const [expanded, setExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (expanded && contentRef.current) {
      setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    }
  }, [expanded])

  return (
    <div id={id} className={`sp-wrapper ${expanded ? 'sp-wrapper--open' : ''}`} style={{ '--sp-accent': accentColor } as React.CSSProperties}>
      {/* PREVIEW ROW — always visible */}
      <div className="sp-preview" onClick={() => setExpanded(e => !e)}>
        <div className="sp-preview__left">
          <span className="sp-preview__icon">{icon}</span>
          <div>
            <div className="sp-preview__label">{label}</div>
            <h2 className="sp-preview__title">{title}</h2>
            <p className="sp-preview__summary">{summary}</p>
          </div>
        </div>
        <button className={`sp-preview__btn ${expanded ? 'sp-preview__btn--open' : ''}`} aria-label={expanded ? 'Collapse' : 'Expand'}>
          <span className="sp-preview__btn-text">{expanded ? 'Close' : 'View'}</span>
          <svg className="sp-preview__btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* FULL CONTENT — shown on expand */}
      <div
        ref={contentRef}
        className="sp-content"
        style={{ display: expanded ? 'block' : 'none' }}
      >
        <div className="sp-content__inner">
          {children}
        </div>
        <div className="sp-content__close-wrap">
          <button className="sp-content__close" onClick={() => { setExpanded(false); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }) }}>
            ↑ Collapse Section
          </button>
        </div>
      </div>
    </div>
  )
}
