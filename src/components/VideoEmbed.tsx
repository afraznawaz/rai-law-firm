import { useState } from 'react'
import { detectVideo, getPlatformLabel, getPlatformColor } from '../lib/videoEmbed'

interface Props {
  url: string
}

export default function VideoEmbed({ url }: Props) {
  const [playing, setPlaying] = useState(false)
  const info = detectVideo(url)

  const platformLabel = getPlatformLabel(info.platform)
  const platformColor = getPlatformColor(info.platform)

  // TikTok — embed works via iframe
  if (info.platform === 'tiktok' && info.embedUrl) {
    return (
      <div className="ve-wrap ve-wrap--tiktok">
        <div className="ve-platform-badge" style={{ background: platformColor }}>{platformLabel}</div>
        <div className="ve-tiktok-container">
          <iframe
            src={info.embedUrl}
            className="ve-tiktok-frame"
            allowFullScreen
            scrolling="no"
            allow="encrypted-media"
            loading="lazy"
            title="TikTok video"
          />
        </div>
      </div>
    )
  }

  // Instagram — embed
  if (info.platform === 'instagram' && info.embedUrl) {
    return (
      <div className="ve-wrap">
        <div className="ve-platform-badge" style={{ background: platformColor }}>{platformLabel}</div>
        <div className="ve-ratio">
          <iframe
            src={info.embedUrl}
            className="ve-iframe"
            allowFullScreen
            scrolling="no"
            allow="encrypted-media"
            loading="lazy"
            title="Instagram post"
          />
        </div>
        <div className="ve-fallback-link">
          <a href={info.originalUrl} target="_blank" rel="noopener noreferrer" className="ve-open-btn" style={{ background: platformColor }}>
            📸 Open on Instagram
          </a>
        </div>
      </div>
    )
  }

  // YouTube — thumbnail + lazy load
  if (info.platform === 'youtube' && info.embedUrl) {
    if (!playing && info.thumbnailUrl) {
      return (
        <div className="ve-wrap">
          <div className="ve-platform-badge" style={{ background: platformColor }}>{platformLabel}</div>
          <div className="ve-yt-thumb" onClick={() => setPlaying(true)}>
            <img src={info.thumbnailUrl} alt="Video thumbnail" className="ve-yt-thumb__img" loading="lazy" />
            <div className="ve-yt-thumb__overlay">
              <div className="ve-yt-thumb__play">
                <svg viewBox="0 0 24 24" fill="white" width="40" height="40">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="ve-wrap">
        <div className="ve-platform-badge" style={{ background: platformColor }}>{platformLabel}</div>
        <div className="ve-ratio">
          <iframe
            src={playing ? info.embedUrl + '&autoplay=1' : info.embedUrl}
            className="ve-iframe"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="lazy"
            title="YouTube video"
          />
        </div>
      </div>
    )
  }

  // Facebook — embed with fallback
  if (info.platform === 'facebook' && info.embedUrl) {
    return (
      <div className="ve-wrap">
        <div className="ve-platform-badge" style={{ background: platformColor }}>{platformLabel}</div>
        <div className="ve-ratio">
          <iframe
            src={info.embedUrl}
            className="ve-iframe"
            allowFullScreen
            scrolling="no"
            allow="encrypted-media"
            loading="lazy"
            title="Facebook video"
          />
        </div>
        <div className="ve-fallback-link">
          <a href={info.originalUrl} target="_blank" rel="noopener noreferrer" className="ve-open-btn" style={{ background: platformColor }}>
            📘 Open on Facebook
          </a>
        </div>
      </div>
    )
  }

  // Vimeo
  if (info.platform === 'vimeo' && info.embedUrl) {
    return (
      <div className="ve-wrap">
        <div className="ve-platform-badge" style={{ background: platformColor }}>{platformLabel}</div>
        <div className="ve-ratio">
          <iframe
            src={info.embedUrl}
            className="ve-iframe"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
            loading="lazy"
            title="Vimeo video"
          />
        </div>
      </div>
    )
  }

  // Generic / direct video file
  if (info.platform === 'generic') {
    const isDirectVideo = /\.(mp4|webm|ogg|mov)$/i.test(url)
    if (isDirectVideo) {
      return (
        <div className="ve-wrap">
          <div className="ve-platform-badge" style={{ background: platformColor }}>{platformLabel}</div>
          <video controls className="ve-direct-video" preload="metadata">
            <source src={url} />
            Your browser does not support video.
          </video>
        </div>
      )
    }
    // Unknown URL — show open button
    return (
      <div className="ve-wrap ve-wrap--fallback">
        <div className="ve-platform-badge" style={{ background: platformColor }}>{platformLabel}</div>
        <div className="ve-fallback">
          <div className="ve-fallback__icon">🎥</div>
          <p className="ve-fallback__text">Click to watch video</p>
          <a href={url} target="_blank" rel="noopener noreferrer" className="ve-open-btn" style={{ background: platformColor }}>
            ▶ Open Video
          </a>
        </div>
      </div>
    )
  }

  return null
}
