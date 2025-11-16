import { useState, useRef } from 'react'
import QRCode from 'qrcode'
import { supabase } from '../lib/supabase'
import './QRGenerator.css'

const QRGenerator = () => {
  const [qrType, setQrType] = useState('single')
  const [singleUrl, setSingleUrl] = useState('')
  const [title, setTitle] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [qrCodeDataURL, setQrCodeDataURL] = useState('')
  const [landingPageUrl, setLandingPageUrl] = useState('')
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef(null)

  const generateSlug = () => {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
  }

  const isValidURL = (string) => {
    if (!string) return true
    try {
      const urlObj = new URL(string.startsWith('http') ? string : `https://${string}`)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch (e) {
      return false
    }
  }

  const generateQRCode = async () => {
    if (qrType === 'single') {
      if (!singleUrl.trim()) {
        setError('Please enter a URL')
        return
      }

      if (!isValidURL(singleUrl)) {
        setError('Please enter a valid URL')
        return
      }

      setError('')
      setIsGenerating(true)

      try {
        const fullUrl = singleUrl.startsWith('http') ? singleUrl : `https://${singleUrl}`
        setLandingPageUrl(fullUrl)

        const dataURL = await QRCode.toDataURL(fullUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeDataURL(dataURL)
      } catch (err) {
        setError('Failed to generate QR code. Please try again.')
        console.error(err)
      } finally {
        setIsGenerating(false)
      }
    } else {
      if (!websiteUrl.trim() && !instagramHandle.trim()) {
        setError('Please enter at least one platform (Website or Instagram)')
        return
      }

      if (websiteUrl && !isValidURL(websiteUrl)) {
        setError('Please enter a valid website URL')
        return
      }

      setError('')
      setIsGenerating(true)

      try {
        const slug = generateSlug()
        const platforms = []
        let displayOrder = 0

        if (websiteUrl.trim()) {
          platforms.push({
            platform_type: 'website',
            platform_value: websiteUrl.trim(),
            display_order: displayOrder++
          })
        }

        if (instagramHandle.trim()) {
          platforms.push({
            platform_type: 'instagram',
            platform_value: instagramHandle.trim().replace('@', ''),
            display_order: displayOrder++
          })
        }

        const { data: qrCodeData, error: qrError } = await supabase
          .from('qr_codes')
          .insert([{ slug, title: title.trim() }])
          .select()
          .single()

        if (qrError) throw qrError

        const platformLinks = platforms.map(p => ({
          qr_code_id: qrCodeData.id,
          ...p
        }))

        const { error: platformError } = await supabase
          .from('platform_links')
          .insert(platformLinks)

        if (platformError) throw platformError

        const landingUrl = `${window.location.origin}/qr/${slug}`
        setLandingPageUrl(landingUrl)

        const dataURL = await QRCode.toDataURL(landingUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeDataURL(dataURL)
      } catch (err) {
        setError('Failed to generate QR code. Please try again.')
        console.error(err)
      } finally {
        setIsGenerating(false)
      }
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeDataURL) return

    const link = document.createElement('a')
    link.href = qrCodeDataURL
    link.download = 'qrcode.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetForm = () => {
    setSingleUrl('')
    setTitle('')
    setWebsiteUrl('')
    setInstagramHandle('')
    setQrCodeDataURL('')
    setLandingPageUrl('')
    setError('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      generateQRCode()
    }
  }

  return (
    <div className="qr-generator">
      <div className="qr-generator__container">
        <header className="qr-generator__header">
          <h1 className="qr-generator__title">QR Code Generator</h1>
          <p className="qr-generator__subtitle">Create QR codes for single links or multiple platforms</p>
        </header>

        {!qrCodeDataURL ? (
          <div className="qr-generator__input-section">
            <div className="qr-generator__form">
              <div className="qr-generator__type-selector">
                <button
                  className={`qr-generator__type-button ${qrType === 'single' ? 'qr-generator__type-button--active' : ''}`}
                  onClick={() => setQrType('single')}
                  disabled={isGenerating}
                >
                  Single Link
                </button>
                <button
                  className={`qr-generator__type-button ${qrType === 'multi' ? 'qr-generator__type-button--active' : ''}`}
                  onClick={() => setQrType('multi')}
                  disabled={isGenerating}
                >
                  Multi-Platform
                </button>
              </div>

              {qrType === 'single' ? (
                <div className="qr-generator__field">
                  <label className="qr-generator__label" htmlFor="single-url">
                    URL
                  </label>
                  <input
                    id="single-url"
                    type="text"
                    className="qr-generator__input"
                    placeholder="e.g., example.com or https://example.com"
                    value={singleUrl}
                    onChange={(e) => setSingleUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isGenerating}
                  />
                </div>
              ) : (
                <>
              <div className="qr-generator__field">
                <label className="qr-generator__label" htmlFor="title">
                  Title (Optional)
                </label>
                <input
                  id="title"
                  type="text"
                  className="qr-generator__input"
                  placeholder="e.g., My Business"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isGenerating}
                />
              </div>

              <div className="qr-generator__field">
                <label className="qr-generator__label" htmlFor="website">
                  <span className="qr-generator__platform-icon">🌐</span>
                  Website URL
                </label>
                <input
                  id="website"
                  type="text"
                  className="qr-generator__input"
                  placeholder="e.g., example.com or https://example.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isGenerating}
                />
              </div>

                <div className="qr-generator__field">
                  <label className="qr-generator__label" htmlFor="instagram">
                  <span className="qr-generator__platform-icon">📷</span>
                  Instagram Handle
                </label>
                <input
                  id="instagram"
                  type="text"
                  className="qr-generator__input"
                  placeholder="e.g., username or @username"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  onKeyPress={handleKeyPress}
                    disabled={isGenerating}
                  />
                </div>
              </>
              )}

              <button
                className="qr-generator__button qr-generator__button--primary"
                onClick={generateQRCode}
                disabled={isGenerating}
                aria-label="Generate QR Code"
              >
                {isGenerating ? 'Generating...' : 'Generate QR Code'}
              </button>
            </div>

            {error && (
              <div className="qr-generator__error" role="alert">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="qr-generator__result">
            <div className="qr-generator__qr-container">
              <img
                src={qrCodeDataURL}
                alt="Generated QR Code"
                className="qr-generator__qr-image"
              />
            </div>

            <div className="qr-generator__landing-info">
              <p className="qr-generator__landing-label">Landing Page URL:</p>
              <a
                href={landingPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="qr-generator__landing-link"
              >
                {landingPageUrl}
              </a>
            </div>

            <div className="qr-generator__actions">
              <button
                className="qr-generator__button qr-generator__button--secondary"
                onClick={downloadQRCode}
                aria-label="Download QR Code"
              >
                Download QR Code
              </button>
              <button
                className="qr-generator__button qr-generator__button--primary"
                onClick={resetForm}
                aria-label="Create Another"
              >
                Create Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRGenerator
