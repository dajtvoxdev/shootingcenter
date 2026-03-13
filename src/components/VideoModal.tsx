import { useEffect } from 'react'
import './VideoModal.css'

interface VideoModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title: string
}

function VideoModal({ isOpen, onClose, videoUrl, title }: VideoModalProps) {
  // Extract YouTube video ID from various URL formats
  const getYouTubeId = (url: string): string => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
      /youtube\.com\/watch\?.*v=([^&\s]+)/,
    ]
    
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return ''
  }

  // Extract Facebook video/reel ID
  const getFacebookEmbedUrl = (url: string): string => {
    // Check if it's a Facebook reel URL
    const reelMatch = url.match(/facebook\.com\/reel\/(\d+)/)
    if (reelMatch && reelMatch[1]) {
      return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/reel/${reelMatch[1]}/&show_text=false&width=560&t=0`
    }
    
    // Check if it's a Facebook video URL
    const videoMatch = url.match(/facebook\.com\/.*\/videos\/(\d+)/)
    if (videoMatch && videoMatch[1]) {
      return `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/video.php?v=${videoMatch[1]}&show_text=false&width=560`
    }
    
    return ''
  }

  // Determine video type and get embed URL
  const getEmbedData = (): { url: string; type: 'youtube' | 'facebook' } => {
    const youtubeId = getYouTubeId(videoUrl)
    if (youtubeId) {
      return {
        url: `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`,
        type: 'youtube'
      }
    }
    
    const facebookUrl = getFacebookEmbedUrl(videoUrl)
    if (facebookUrl) {
      return { url: facebookUrl, type: 'facebook' }
    }
    
    return { url: '', type: 'youtube' }
  }

  const { url: embedUrl, type } = getEmbedData()

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen || !embedUrl) return null

  return (
    <div className="video-modal-overlay" onClick={onClose}>
      <div className="video-modal" onClick={(e) => e.stopPropagation()}>
        <button className="video-modal-close" onClick={onClose}>
          ×
        </button>
        <h3 className="video-modal-title">{title}</h3>
        <div className={`video-container ${type === 'facebook' ? 'facebook-video' : ''}`}>
          <iframe
            src={embedUrl}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            scrolling="no"
          ></iframe>
        </div>
      </div>
    </div>
  )
}

export default VideoModal
