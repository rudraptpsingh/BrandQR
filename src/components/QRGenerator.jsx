import { useState, useRef } from 'react'
import QRCode from 'qrcode'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'
import Notification from './Notification'
import './QRGenerator.css'

const QRGenerator = () => {
  const { user } = useAuth()
  const [qrType, setQrType] = useState('single')
  const [singleUrl, setSingleUrl] = useState('')
  const [title, setTitle] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [qrCodeDataURL, setQrCodeDataURL] = useState('')
  const [landingPageUrl, setLandingPageUrl] = useState('')
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [logoImage, setLogoImage] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [notification, setNotification] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [currentQRSaved, setCurrentQRSaved] = useState(false)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

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

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setLogoImage(img)
        setLogoPreview(event.target.result)
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoImage(null)
    setLogoPreview('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const embedLogoOnQR = async (qrDataURL, logoImg) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const qrImg = new Image()
      qrImg.onload = () => {
        canvas.width = qrImg.width
        canvas.height = qrImg.height

        ctx.drawImage(qrImg, 0, 0)

        const centerX = canvas.width / 2
        const centerY = canvas.height / 2

        const clearZoneSize = Math.floor(qrImg.width * 0.22)
        const logoSize = Math.floor(clearZoneSize * 0.75)

        ctx.fillStyle = '#FFFFFF'
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
        ctx.shadowBlur = 8
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 2

        ctx.beginPath()
        ctx.arc(centerX, centerY, clearZoneSize / 2, 0, Math.PI * 2)
        ctx.fill()

        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(centerX, centerY, clearZoneSize / 2 - 1, 0, Math.PI * 2)
        ctx.stroke()

        const logoX = centerX - logoSize / 2
        const logoY = centerY - logoSize / 2

        ctx.save()
        ctx.beginPath()
        ctx.arc(centerX, centerY, logoSize / 2, 0, Math.PI * 2)
        ctx.clip()

        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize)
        ctx.restore()

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, logoSize / 2 + 1, 0, Math.PI * 2)
        ctx.stroke()

        resolve(canvas.toDataURL('image/png'))
      }
      qrImg.src = qrDataURL
    })
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

        let dataURL = await QRCode.toDataURL(fullUrl, {
          width: 300,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })

        if (logoImage) {
          dataURL = await embedLogoOnQR(dataURL, logoImage)
        }

        setQrCodeDataURL(dataURL)
        setCurrentQRSaved(false)
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

        const qrCodeInsert = {
          slug,
          title: title.trim() || 'Multi-Platform QR Code',
          qr_type: 'multi-platform'
        }

        if (user) {
          qrCodeInsert.user_id = user.id
        }

        const { data: qrCodeData, error: qrError } = await supabase
          .from('qr_codes')
          .insert([qrCodeInsert])
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

        let dataURL = await QRCode.toDataURL(landingUrl, {
          width: 300,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })

        if (logoImage) {
          dataURL = await embedLogoOnQR(dataURL, logoImage)
        }

        setQrCodeDataURL(dataURL)
        setCurrentQRSaved(false)
      } catch (err) {
        setError('Failed to generate QR code. Please try again.')
        console.error(err)
      } finally {
        setIsGenerating(false)
      }
    }
  }

  const downloadQRCode = (format) => {
    if (!qrCodeDataURL) return

    if (format === 'png') {
      const link = document.createElement('a')
      link.href = qrCodeDataURL
      link.download = 'brandqr-code.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (format === 'svg') {
      const qrContent = landingPageUrl || singleUrl
      QRCode.toString(qrContent, {
        type: 'svg',
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }).then(svg => {
        const blob = new Blob([svg], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'brandqr-code.svg'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      })
    }
  }

  const saveQRCodeToDatabase = async () => {
    if (!user) {
      setAuthModalOpen(true)
      setNotification({ type: 'info', message: 'Please sign in to save your QR code' })
      return
    }

    if (currentQRSaved) {
      setNotification({ type: 'info', message: 'This QR code is already saved' })
      return
    }

    try {
      const { data: existingQRs, error: countError } = await supabase
        .from('qr_codes')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)

      if (countError) throw countError

      if (existingQRs && existingQRs.length >= 10) {
        setNotification({ type: 'error', message: 'You have reached the maximum limit of 10 saved QR codes. Please delete some to save new ones.' })
        return
      }

      setIsSaving(true)

      const slug = generateSlug()
      let qrTitle = ''
      let qrContent = ''

      if (qrType === 'single') {
        const contentPreview = singleUrl.length > 30 ? singleUrl.substring(0, 30) + '...' : singleUrl
        qrTitle = title.trim() || `URL: ${contentPreview}`
        qrContent = singleUrl
      } else {
        const platforms = []
        if (websiteUrl) platforms.push(websiteUrl)
        if (instagramHandle) platforms.push(`@${instagramHandle}`)
        const contentPreview = platforms.join(', ')
        qrTitle = title.trim() || `Multi-Platform: ${contentPreview.length > 30 ? contentPreview.substring(0, 30) + '...' : contentPreview}`
        qrContent = landingPageUrl
      }

      const { error: dbError } = await supabase
        .from('qr_codes')
        .insert([{
          user_id: user.id,
          slug,
          title: qrTitle,
          qr_type: qrType === 'single' ? 'single-url' : 'multi-platform',
          qr_content: qrContent,
          qr_image_data: qrCodeDataURL,
          logo_data: logoPreview || '',
          qr_color: '#000000'
        }])

      if (dbError) throw dbError

      setCurrentQRSaved(true)
      setNotification({ type: 'success', message: 'QR code saved successfully!' })
    } catch (dbErr) {
      console.error('Database save error:', dbErr)
      setNotification({ type: 'error', message: 'Failed to save QR code. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const resetForm = () => {
    setSingleUrl('')
    setTitle('')
    setWebsiteUrl('')
    setInstagramHandle('')
    setQrCodeDataURL('')
    setLandingPageUrl('')
    setError('')
    setCurrentQRSaved(false)
    removeLogo()
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
                <>
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

                  <div className="qr-generator__field">
                    <label className="qr-generator__label">
                      Logo (Optional)
                    </label>
                    {!logoPreview ? (
                      <div className="qr-generator__logo-upload">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="qr-generator__file-input"
                          id="logo-upload"
                          disabled={isGenerating}
                        />
                        <label htmlFor="logo-upload" className="qr-generator__file-label">
                          <span className="qr-generator__upload-icon">📷</span>
                          <span>Upload Logo</span>
                        </label>
                      </div>
                    ) : (
                      <div className="qr-generator__logo-preview">
                        <img src={logoPreview} alt="Logo preview" className="qr-generator__logo-image" />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="qr-generator__remove-logo"
                          disabled={isGenerating}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </>
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

                  <div className="qr-generator__field">
                    <label className="qr-generator__label">
                      Logo (Optional)
                    </label>
                    {!logoPreview ? (
                      <div className="qr-generator__logo-upload">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="qr-generator__file-input"
                          id="logo-upload-multi"
                          disabled={isGenerating}
                        />
                        <label htmlFor="logo-upload-multi" className="qr-generator__file-label">
                          <span className="qr-generator__upload-icon">📷</span>
                          <span>Upload Logo</span>
                        </label>
                      </div>
                    ) : (
                      <div className="qr-generator__logo-preview">
                        <img src={logoPreview} alt="Logo preview" className="qr-generator__logo-image" />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="qr-generator__remove-logo"
                          disabled={isGenerating}
                        >
                          Remove
                        </button>
                      </div>
                    )}
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
              <div className="qr-generator__download-group">
                <button
                  className="qr-generator__button qr-generator__button--download-png"
                  onClick={() => downloadQRCode('png')}
                  aria-label="Download PNG"
                >
                  Download PNG
                </button>
                <button
                  className="qr-generator__button qr-generator__button--download-svg"
                  onClick={() => downloadQRCode('svg')}
                  aria-label="Download SVG"
                >
                  Download SVG
                </button>
              </div>
              <button
                className={`qr-generator__button ${currentQRSaved ? 'qr-generator__button--saved' : 'qr-generator__button--save'}`}
                onClick={saveQRCodeToDatabase}
                disabled={isSaving || currentQRSaved}
                aria-label="Save QR Code"
              >
                {isSaving ? 'Saving...' : currentQRSaved ? 'Saved ✓' : 'Save QR Code'}
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

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  )
}

export default QRGenerator
