export interface VideoInfo {
  platform: 'youtube' | 'facebook' | 'instagram' | 'tiktok' | 'vimeo' | 'generic'
  embedUrl: string | null
  thumbnailUrl: string | null
  originalUrl: string
  videoId: string | null
}

export function detectVideo(url: string): VideoInfo {
  const u = url.trim()
  const ytMatch = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/)
  if (ytMatch) {
    const id = ytMatch[1]
    return { platform: 'youtube', embedUrl: `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`, thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`, originalUrl: u, videoId: id }
  }
  const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?([0-9]+)/)
  if (vimeoMatch) {
    const id = vimeoMatch[1]
    return { platform: 'vimeo', embedUrl: `https://player.vimeo.com/video/${id}?color=c9a84c&title=0&byline=0`, thumbnailUrl: null, originalUrl: u, videoId: id }
  }
  if (u.includes('facebook.com') || u.includes('fb.watch')) {
    return { platform: 'facebook', embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=false&width=640&autoplay=false`, thumbnailUrl: null, originalUrl: u, videoId: null }
  }
  if (u.includes('instagram.com')) {
    const igMatch = u.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/)
    const id = igMatch ? igMatch[1] : null
    return { platform: 'instagram', embedUrl: id ? `https://www.instagram.com/p/${id}/embed/` : null, thumbnailUrl: null, originalUrl: u, videoId: id }
  }
  if (u.includes('tiktok.com')) {
    const ttMatch = u.match(/video\/([0-9]+)/)
    const id = ttMatch ? ttMatch[1] : null
    return { platform: 'tiktok', embedUrl: id ? `https://www.tiktok.com/embed/v2/${id}` : null, thumbnailUrl: null, originalUrl: u, videoId: id }
  }
  return { platform: 'generic', embedUrl: u, thumbnailUrl: null, originalUrl: u, videoId: null }
}

export function getPlatformLabel(platform: VideoInfo['platform']): string {
  const labels: Record<VideoInfo['platform'], string> = { youtube: '▶ YouTube', facebook: '📘 Facebook', instagram: '📸 Instagram', tiktok: '🎵 TikTok', vimeo: '🎬 Vimeo', generic: '🎥 Video' }
  return labels[platform]
}

export function getPlatformColor(platform: VideoInfo['platform']): string {
  const colors: Record<VideoInfo['platform'], string> = { youtube: '#ff0000', facebook: '#1877f2', instagram: '#e1306c', tiktok: '#010101', vimeo: '#1ab7ea', generic: '#0d3d1e' }
  return colors[platform]
}
