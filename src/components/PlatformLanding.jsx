import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './PlatformLanding.css'

const PlatformLanding = () => {
  const { slug } = useParams()
    const [qrData, setQrData] = useState(null)
    const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchQRData = async () => {
      try {
        const { data: qrCode, error: qrError } = await supabase
          .from('qr_codes')
          .select('id, title')
          .eq('slug', slug)
          .maybeSingle()

        if (qrError) throw qrError
        if (!qrCode) {
          setError('QR code not found')
          setLoading(false)
          return
        }

        setQrData(qrCode)

          const { data: platformLinks, error: platformError } = await supabase
            .from('platform_links')
            .select('platform_type, platform_value, display_order, link_label, link_url')
            .eq('qr_code_id', qrCode.id)
            .order('display_order', { ascending: true })

        if (platformError) throw platformError

        setPlatforms(platformLinks || [])
      } catch (err) {
        setError('Failed to load platform links')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchQRData()
    }
  }, [slug])

    const getDisplayLabel = (platform) => {
      if (platform.link_label && platform.link_label.trim()) {
        return platform.link_label
      }
      switch (platform.platform_type) {
        case 'website':
          return 'Visit Website'
        case 'instagram':
          return 'Follow on Instagram'
        default:
          return platform.platform_type || 'Link'
      }
    }

    const getPlatformUrl = (platform) => {
      if (platform.link_url && platform.link_url.trim()) {
        return platform.link_url
      }
      if (platform.platform_type === 'website') {
        return platform.platform_value.startsWith('http')
          ? platform.platform_value
          : `https://${platform.platform_value}`
      }
      if (platform.platform_type === 'instagram') {
        return `https://instagram.com/${platform.platform_value.replace('@', '')}`
      }
      return platform.platform_value
    }

    const getPlatformIcon = (platform) => {
      if (platform.platform_type === 'website') {
        return (
          <svg className="platform-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill="currentColor"/>
          </svg>
        )
      }

      if (platform.platform_type === 'instagram') {
        return (
          <svg className="platform-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" fill="currentColor"/>
          </svg>
        )
      }

      const label = getDisplayLabel(platform)
      return <div className="platform-landing__avatar">{label.charAt(0).toUpperCase()}</div>
    }

  if (loading) {
    return (
      <div className="platform-landing">
        <div className="platform-landing__container">
          <div className="platform-landing__loading">Loading...</div>
        </div>
      </div>
    )
  }

  if (error || !qrData) {
    return (
      <div className="platform-landing">
        <div className="platform-landing__container">
          <div className="platform-landing__error">{error || 'QR code not found'}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="platform-landing">
      <div className="platform-landing__container">
        {qrData.title && (
          <h1 className="platform-landing__title">{qrData.title}</h1>
        )}

        <div className="platform-landing__subtitle">Choose where to connect</div>

        <div className="platform-landing__platforms">
            {platforms.map((platform, index) => (
            <a
              key={index}
              href={getPlatformUrl(platform)}
              target="_blank"
              rel="noopener noreferrer"
              className="platform-landing__button"
            >
                {getPlatformIcon(platform)}
                <span>{getDisplayLabel(platform)}</span>
            </a>
          ))}
        </div>

        {platforms.length === 0 && (
          <div className="platform-landing__empty">No platforms available</div>
        )}
      </div>
    </div>
  )
}

export default PlatformLanding
