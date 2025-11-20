import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'
import DownloadGateModal from './DownloadGateModal'
import Notification from './Notification'
import UserCodesDashboard from './UserCodesDashboard'
import Dashboard from './Dashboard'
import './BrandQRLanding.css'

const BrandQRLanding = () => {
  const { user, signOut } = useAuth()
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [qrCodeDataURL, setQrCodeDataURL] = useState('')
  const [detectedType, setDetectedType] = useState('text')
  const [qrColor, setQrColor] = useState('#000000')
  const [selectedPattern, setSelectedPattern] = useState('square')
  const [activeDemo, setActiveDemo] = useState(0)
  const [demoQRs, setDemoQRs] = useState({})
  const [isDashboardActive, setIsDashboardActive] = useState(false)
  const [logoImage, setLogoImage] = useState(null)
  const [logoPreview, setLogoPreview] = useState('')
  const [savedQRCodes, setSavedQRCodes] = useState([])
  const [showSavedQRs, setShowSavedQRs] = useState(false)
  const [notification, setNotification] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [currentQRSaved, setCurrentQRSaved] = useState(false)
  const [downloadGateOpen, setDownloadGateOpen] = useState(false)
  const [pendingDownload, setPendingDownload] = useState(null)
  const [shortUrl, setShortUrl] = useState('')
  const [isGeneratingShortUrl, setIsGeneratingShortUrl] = useState(false)
  const debounceTimer = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  // Mouse tracking for flashlight effect
  const handleMouseMove = (e) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    card.style.setProperty('--mouse-x', `${x}%`)
    card.style.setProperty('--mouse-y', `${y}%`)
  }


  const detectContentType = (text) => {
    if (!text.trim()) return 'text'

    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i
    if (urlPattern.test(text)) return 'url'

    if (text.toLowerCase().startsWith('wifi:')) return 'wifi'

    if (text.toLowerCase().startsWith('begin:vcard')) return 'vcard'

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailPattern.test(text)) return 'email'

    if (text.toLowerCase().startsWith('smsto:')) return 'sms'

    const geoPattern = /^geo:[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/
    if (geoPattern.test(text)) return 'geolocation'

    return 'text'
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
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

  const applyQRPattern = async (qrDataURL, pattern) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const qrImg = new Image()
      qrImg.onload = () => {
        canvas.width = qrImg.width
        canvas.height = qrImg.height

        // For basic pattern implementation, we'll apply simple visual effects
        if (pattern === 'round') {
          // Apply slight border radius effect by softening edges
          ctx.filter = 'blur(0.5px)'
          ctx.drawImage(qrImg, 0, 0)
          ctx.filter = 'none'
        } else if (pattern === 'diamond') {
          // Apply rotation effect for diamond pattern
          ctx.save()
          ctx.translate(canvas.width / 2, canvas.height / 2)
          ctx.rotate(Math.PI / 4)
          ctx.drawImage(qrImg, -canvas.width / 2, -canvas.height / 2)
          ctx.restore()
        } else {
          ctx.drawImage(qrImg, 0, 0)
        }

        resolve(canvas.toDataURL('image/png'))
      }
      qrImg.src = qrDataURL
    })
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

  const generateSlug = () => {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
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
      const contentPreview = inputValue.length > 30 ? inputValue.substring(0, 30) + '...' : inputValue
      const title = `${detectedType.toUpperCase()}: ${contentPreview}`

      const { error: dbError } = await supabase
        .from('qr_codes')
        .insert([{
          user_id: user.id,
          slug,
          title,
          qr_type: detectedType,
          qr_content: inputValue,
          qr_image_data: qrCodeDataURL,
          logo_data: logoPreview || '',
          qr_color: qrColor
        }])

      if (dbError) throw dbError

      setCurrentQRSaved(true)
      setNotification({ type: 'success', message: 'QR code saved successfully!' })
      await fetchSavedQRCodes()
    } catch (dbErr) {
      console.error('Database save error:', dbErr)
      setNotification({ type: 'error', message: 'Failed to save QR code. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const generateQRCode = async (text, color = qrColor, pattern = selectedPattern) => {
    if (!text.trim()) {
      setQrCodeDataURL('')
      setShortUrl('')
      return
    }

    try {
      // For logged-in users with URL type, generate short URL
      let qrContent = text
      if (user && detectedType === 'url') {
        setIsGeneratingShortUrl(true)
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-short-url`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session?.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              destinationUrl: text,
              userId: user.id,
              qrType: detectedType,
              qrColor: color,
              logoData: logoPreview || '',
            }),
          })

          if (response.ok) {
            const { shortUrl: generatedUrl, slug } = await response.json()
            qrContent = generatedUrl
            setShortUrl(generatedUrl)
          }
        } catch (shortUrlError) {
          console.error('Failed to generate short URL:', shortUrlError)
          // Fall back to using the original URL
        } finally {
          setIsGeneratingShortUrl(false)
        }
      } else {
        setShortUrl('')
      }

      // Base QR Code generation using short URL if available
      let dataURL = await QRCode.toDataURL(qrContent, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: 'H',
        color: {
          dark: color,
          light: '#00000000'
        }
      })

      // Apply pattern styling if not square (basic implementation)
      if (pattern !== 'square') {
        dataURL = await applyQRPattern(dataURL, pattern)
      }

      if (logoImage) {
        dataURL = await embedLogoOnQR(dataURL, logoImage)
      }

      setQrCodeDataURL(dataURL)
      setCurrentQRSaved(false)
    } catch (err) {
      console.error('QR generation error:', err)
      setIsGeneratingShortUrl(false)
    }
  }

  const fetchSavedQRCodes = async () => {
    if (!user) {
      setSavedQRCodes([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavedQRCodes(data || [])
    } catch (err) {
      console.error('Failed to fetch saved QR codes:', err)
    }
  }

  const handleDownloadGateClose = () => {
    setDownloadGateOpen(false)
    if (pendingDownload) {
      proceedWithDownload(pendingDownload)
      setPendingDownload(null)
    }
  }

  const handleDownloadGateSignUp = () => {
    setDownloadGateOpen(false)
    setAuthModalOpen(true)
    setPendingDownload(null)
  }

  const deleteQRCode = async (qrId) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', qrId)
        .eq('user_id', user.id)

      if (error) throw error

      setNotification({ type: 'success', message: 'QR code deleted successfully' })
      await fetchSavedQRCodes()
    } catch (err) {
      console.error('Failed to delete QR code:', err)
      setNotification({ type: 'error', message: 'Failed to delete QR code. Please try again.' })
    }
  }

  useEffect(() => {
    fetchSavedQRCodes()
  }, [user])

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      const type = detectContentType(inputValue)
      setDetectedType(type)
      generateQRCode(inputValue)
      setCurrentQRSaved(false)
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [inputValue, qrColor, logoImage, selectedPattern])

  const downloadQRCode = async (format) => {
    if (!qrCodeDataURL) return

    // If user is not logged in, show download gate modal
    if (!user) {
      setPendingDownload(format)
      setDownloadGateOpen(true)
      return
    }

    // Proceed with download
    proceedWithDownload(format)
  }

  const proceedWithDownload = async (format) => {
    if (!qrCodeDataURL) return

    if (format === 'png') {
      const link = document.createElement('a')
      link.href = qrCodeDataURL
      link.download = 'brandqr-code.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (format === 'svg') {
      try {
        let svgString = await QRCode.toString(inputValue, {
          type: 'svg',
          width: 400,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: qrColor,
            light: '#ffffff'
          }
        })

        if (logoImage && logoPreview) {
          const parser = new DOMParser()
          const svgDoc = parser.parseFromString(svgString, 'image/svg+xml')
          const svgElement = svgDoc.documentElement

          const viewBox = svgElement.getAttribute('viewBox').split(' ')
          const svgWidth = parseFloat(viewBox[2])
          const svgHeight = parseFloat(viewBox[3])
          const centerX = svgWidth / 2
          const centerY = svgHeight / 2

          const clearZoneSize = svgWidth * 0.22
          const logoSize = clearZoneSize * 0.75

          const defsElement = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'defs')

          const filter = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'filter')
          filter.setAttribute('id', 'shadow')
          filter.setAttribute('x', '-50%')
          filter.setAttribute('y', '-50%')
          filter.setAttribute('width', '200%')
          filter.setAttribute('height', '200%')

          const feGaussianBlur = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur')
          feGaussianBlur.setAttribute('in', 'SourceAlpha')
          feGaussianBlur.setAttribute('stdDeviation', '2')

          const feOffset = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feOffset')
          feOffset.setAttribute('dx', '0')
          feOffset.setAttribute('dy', '1')
          feOffset.setAttribute('result', 'offsetblur')

          const feComponentTransfer = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feComponentTransfer')
          const feFuncA = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feFuncA')
          feFuncA.setAttribute('type', 'linear')
          feFuncA.setAttribute('slope', '0.15')
          feComponentTransfer.appendChild(feFuncA)

          const feMerge = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feMerge')
          const feMergeNode1 = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode')
          const feMergeNode2 = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'feMergeNode')
          feMergeNode2.setAttribute('in', 'SourceGraphic')
          feMerge.appendChild(feMergeNode1)
          feMerge.appendChild(feMergeNode2)

          filter.appendChild(feGaussianBlur)
          filter.appendChild(feOffset)
          filter.appendChild(feComponentTransfer)
          filter.appendChild(feMerge)
          defsElement.appendChild(filter)

          const clipPath = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'clipPath')
          clipPath.setAttribute('id', 'logoClip')
          const clipCircle = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'circle')
          clipCircle.setAttribute('cx', centerX.toString())
          clipCircle.setAttribute('cy', centerY.toString())
          clipCircle.setAttribute('r', (logoSize / 2).toString())
          clipPath.appendChild(clipCircle)
          defsElement.appendChild(clipPath)

          svgElement.insertBefore(defsElement, svgElement.firstChild)

          const clearZone = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'circle')
          clearZone.setAttribute('cx', centerX.toString())
          clearZone.setAttribute('cy', centerY.toString())
          clearZone.setAttribute('r', (clearZoneSize / 2).toString())
          clearZone.setAttribute('fill', '#FFFFFF')
          clearZone.setAttribute('filter', 'url(#shadow)')
          svgElement.appendChild(clearZone)

          const clearZoneBorder = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'circle')
          clearZoneBorder.setAttribute('cx', centerX.toString())
          clearZoneBorder.setAttribute('cy', centerY.toString())
          clearZoneBorder.setAttribute('r', (clearZoneSize / 2 - 1).toString())
          clearZoneBorder.setAttribute('fill', 'none')
          clearZoneBorder.setAttribute('stroke', 'rgba(0, 0, 0, 0.08)')
          clearZoneBorder.setAttribute('stroke-width', '1.5')
          svgElement.appendChild(clearZoneBorder)

          const logoGroup = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g')
          logoGroup.setAttribute('clip-path', 'url(#logoClip)')

          const logoImageElement = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'image')
          logoImageElement.setAttribute('href', logoPreview)
          logoImageElement.setAttribute('x', (centerX - logoSize / 2).toString())
          logoImageElement.setAttribute('y', (centerY - logoSize / 2).toString())
          logoImageElement.setAttribute('width', logoSize.toString())
          logoImageElement.setAttribute('height', logoSize.toString())
          logoGroup.appendChild(logoImageElement)
          svgElement.appendChild(logoGroup)

          const logoBorder = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'circle')
          logoBorder.setAttribute('cx', centerX.toString())
          logoBorder.setAttribute('cy', centerY.toString())
          logoBorder.setAttribute('r', (logoSize / 2 + 1).toString())
          logoBorder.setAttribute('fill', 'none')
          logoBorder.setAttribute('stroke', 'rgba(255, 255, 255, 0.4)')
          logoBorder.setAttribute('stroke-width', '2')
          svgElement.appendChild(logoBorder)

          svgString = new XMLSerializer().serializeToString(svgDoc)
        }

        const blob = new Blob([svgString], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'brandqr-code.svg'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } catch (err) {
        console.error('SVG generation error:', err)
      }
    }
  }

  useEffect(() => {
    const demoData = [
      { type: 'url', value: 'https://brandqr.com', color: '#8B5CF6' },
      { type: 'wifi', value: 'WIFI:S:MyCafe;T:WPA;P:guest123;;', color: '#06B6D4' },
      { type: 'email', value: 'mailto:hello@brandqr.com', color: '#10B981' },
      { type: 'text', value: 'Hello, BrandQR!', color: '#F59E0B' }
    ]

    const generateDemos = async () => {
      const qrs = {}
      for (let i = 0; i < demoData.length; i++) {
        try {
          const dataURL = await QRCode.toDataURL(demoData[i].value, {
            width: 300,
            margin: 2,
            color: {
              dark: demoData[i].color,
              light: '#ffffff'
            }
          })
          qrs[i] = { ...demoData[i], qr: dataURL }
        } catch (err) {
          console.error('Demo QR generation error:', err)
        }
      }
      setDemoQRs(qrs)
    }

    generateDemos()

    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % 4)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getTypeIcon = (type) => {
    const icons = {
      url: '🌐',
      text: '📝',
      wifi: '📶',
      vcard: '👤',
      email: '✉️',
      sms: '💬',
      geolocation: '📍'
    }
    return icons[type] || '📝'
  }

  // Calculate aggregate statistics for logged-in users
  const calculateStats = () => {
    const totalCodes = savedQRCodes.length
    const totalScans = savedQRCodes.reduce((sum, qr) => sum + (qr.scan_count || 0), 0)
    
    // Calculate scans in last 30 days (simplified - using all scans for now as we don't have date-based scan data)
    const scansLast30Days = totalScans
    
    const latestCode = savedQRCodes.length > 0 ? savedQRCodes[0] : null
    
    return {
      totalCodes,
      totalScans,
      scansLast30Days,
      latestCode
    }
  }

  const scrollToGenerator = () => {
    const generatorSection = document.getElementById('qr-generator-section')
    if (generatorSection) {
      generatorSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="brandqr">
      <div className="brandqr__aurora-bg"></div>

      <nav className="brandqr__nav">
        <div className="brandqr__nav-content">
          <div className="brandqr__logo">
            <div className="brandqr__logo-icon"></div>
            <span>BrandQR</span>
          </div>
          <div className="brandqr__nav-right">
            <a href="/guides" className="brandqr__nav-link">Guides</a>
            <div className="brandqr__nav-links">
            {user ? (
              <div className="brandqr__user-menu">
                <button
                  className="brandqr__user-button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  {user.email.charAt(0).toUpperCase()}
                </button>
                {userMenuOpen && (
                  <div className="brandqr__user-dropdown">
                    <div className="brandqr__user-email">{user.email}</div>
                    <button
                      className="brandqr__dropdown-item"
                      onClick={() => {
                        setShowSavedQRs(!showSavedQRs)
                        setUserMenuOpen(false)
                      }}
                    >
                      My QR Codes ({savedQRCodes.length})
                    </button>
                    <button
                      className="brandqr__sign-out"
                      onClick={() => {
                        signOut()
                        setUserMenuOpen(false)
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="brandqr__nav-cta"
                onClick={() => setAuthModalOpen(true)}
              >
                Sign In
              </button>
            )}
            </div>
          </div>
        </div>
      </nav>

      {user ? (
        <>
          {/* New Dashboard with Horizontal Pill Tab Bar */}
          <Dashboard
            user={user}
            savedQRCodes={savedQRCodes}
            onDeleteQRCode={deleteQRCode}
            inputValue={inputValue}
            setInputValue={setInputValue}
            detectedType={detectedType}
            qrColor={qrColor}
            setQrColor={setQrColor}
            selectedPattern={selectedPattern}
            setSelectedPattern={setSelectedPattern}
            qrCodeDataURL={qrCodeDataURL}
            generateQRCode={generateQRCode}
            logoPreview={logoPreview}
            logoImage={logoImage}
            handleLogoUpload={handleLogoUpload}
            removeLogo={removeLogo}
            fileInputRef={fileInputRef}
            getTypeIcon={getTypeIcon}
            downloadQRCode={downloadQRCode}
            saveQRCodeToDatabase={saveQRCodeToDatabase}
            isSaving={isSaving}
            currentQRSaved={currentQRSaved}
            isDashboardActive={isDashboardActive}
            setIsDashboardActive={setIsDashboardActive}
            shortUrl={shortUrl}
            isGeneratingShortUrl={isGeneratingShortUrl}
          />
        </>
      ) : (
        <>
          {/* Marketing Hero for Non-logged-in Users */}
          <section className="brandqr__hero">
            <div className="brandqr__hero-content">
              <div className="brandqr__hero-text">
                <h1 className="brandqr__hero-title">
                  Create Trackable & Branded QR Codes Instantly.
                </h1>
                <p className="brandqr__hero-subtitle">
                  Design beautiful, logo-embedded QR Codes in seconds. Unlock real-time scan analytics and change your link anytime.
                </p>
              </div>

              <div className="brandqr__hero-visual">
                <div className={`brandqr__dashboard ${isDashboardActive ? 'brandqr__dashboard--active' : ''}`}>
                  <div className="brandqr__dashboard-header">
                    <div className="brandqr__dashboard-logo">
                      <div className="brandqr__dashboard-logo-icon"></div>
                      <span>BrandQR</span>
                    </div>
                    <div className="brandqr__dashboard-actions">
                      <div className="brandqr__dashboard-action-icon"></div>
                      <div className="brandqr__dashboard-action-icon"></div>
                    </div>
                  </div>

                  <div className="brandqr__generator-card">
                    <div className="brandqr__input-wrapper">
                      <input
                        type="text"
                        className="brandqr__input"
                        placeholder="Enter URL, Text, or More..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={() => setIsDashboardActive(true)}
                        onBlur={() => {
                          if (!inputValue) setIsDashboardActive(false)
                        }}
                      />
                      <div className="brandqr__type-badge">
                        <span className="brandqr__type-icon">{getTypeIcon(detectedType)}</span>
                        <span className="brandqr__type-text">{detectedType}</span>
                      </div>
                    </div>

                    <div className="brandqr__color-options">
                      <label className="brandqr__color-label">QR Color:</label>
                      <div className="brandqr__color-presets">
                        <button
                          className={`brandqr__color-preset ${qrColor === '#000000' ? 'brandqr__color-preset--active' : ''}`}
                          style={{ background: '#000000' }}
                          onClick={() => setQrColor('#000000')}
                          title="Black"
                        ></button>
                        <button
                          className={`brandqr__color-preset ${qrColor === '#8B5CF6' ? 'brandqr__color-preset--active' : ''}`}
                          style={{ background: '#8B5CF6' }}
                          onClick={() => setQrColor('#8B5CF6')}
                          title="Purple"
                        ></button>
                        <button
                          className={`brandqr__color-preset ${qrColor === '#06B6D4' ? 'brandqr__color-preset--active' : ''}`}
                          style={{ background: '#06B6D4' }}
                          onClick={() => setQrColor('#06B6D4')}
                          title="Cyan"
                        ></button>
                        <button
                          className={`brandqr__color-preset ${qrColor === '#EC4899' ? 'brandqr__color-preset--active' : ''}`}
                          style={{ background: '#EC4899' }}
                          onClick={() => setQrColor('#EC4899')}
                          title="Pink"
                        ></button>
                        <button
                          className={`brandqr__color-preset ${qrColor === '#10B981' ? 'brandqr__color-preset--active' : ''}`}
                          style={{ background: '#10B981' }}
                          onClick={() => setQrColor('#10B981')}
                          title="Green"
                        ></button>
                      </div>
                    </div>

                    <div className="brandqr__logo-section">
                      <label className="brandqr__color-label">Logo (Optional):</label>
                      {!logoPreview ? (
                        <div className="brandqr__logo-upload">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="brandqr__file-input"
                            id="logo-upload-brand"
                          />
                          <label htmlFor="logo-upload-brand" className="brandqr__file-label">
                            <span>📷 Upload Logo</span>
                          </label>
                        </div>
                      ) : (
                        <div className="brandqr__logo-preview">
                          <img src={logoPreview} alt="Logo preview" className="brandqr__logo-image" />
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="brandqr__remove-logo"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <div className={`brandqr__qr-results ${qrCodeDataURL ? 'brandqr__qr-results--visible' : ''}`}>
                      {qrCodeDataURL && (
                        <>
                          <div className="brandqr__qr-preview">
                            <img src={qrCodeDataURL} alt="QR Code Preview" className="brandqr__qr-image" />
                          </div>

                          <div className="brandqr__download-buttons">
                            <button
                              className="brandqr__download-btn brandqr__download-btn--png"
                              onClick={() => downloadQRCode('png')}
                            >
                              Download PNG
                            </button>
                            <button
                              className="brandqr__download-btn brandqr__download-btn--svg"
                              onClick={() => downloadQRCode('svg')}
                            >
                              Download SVG
                            </button>
                            <button
                              className={`brandqr__download-btn brandqr__download-btn--save ${currentQRSaved ? 'brandqr__download-btn--saved' : ''}`}
                              onClick={saveQRCodeToDatabase}
                              disabled={isSaving || currentQRSaved}
                            >
                              {isSaving ? 'Saving...' : currentQRSaved ? 'Saved ✓' : 'Save QR Code'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section for Non-logged-in Users */}
          <section className="brandqr__features">
        <div className="brandqr__features-container">
          <h2 className="brandqr__section-title">Powerful Features</h2>

          <div className="brandqr__bento-grid">
            <div 
              className="brandqr__feature-card brandqr__feature-card--tall"
              onMouseMove={handleMouseMove}
            >
              <div className="brandqr__feature-content">
                <div className="brandqr__smart-detection-visual">
                  <div className="brandqr__circuit-board">
                    <div className="brandqr__circuit-node"></div>
                    <div className="brandqr__circuit-node"></div>
                    <div className="brandqr__circuit-node"></div>
                    <div className="brandqr__circuit-node"></div>
                    <div className="brandqr__circuit-node"></div>
                    <div className="brandqr__circuit-line"></div>
                    <div className="brandqr__circuit-line"></div>
                    <div className="brandqr__circuit-line"></div>
                    <div className="brandqr__circuit-line"></div>
                  </div>
                </div>
                <h3 className="brandqr__feature-title">AI-Powered Smart Detection</h3>
                <p className="brandqr__feature-desc">
                  Automatically detects content type as you type. URLs, Wi-Fi, vCards, email, SMS, and geolocation.
                </p>
              </div>
            </div>

            <div 
              className="brandqr__feature-card brandqr__feature-card--short"
              onMouseMove={handleMouseMove}
            >
              <div className="brandqr__feature-content">
                <div className="brandqr__customization-preview">
                  <div className="brandqr__color-picker-demo">
                    <div className="brandqr__demo-swatches">
                      <div className="brandqr__color-swatch" style={{ background: '#000' }}></div>
                      <div className="brandqr__color-swatch" style={{ background: '#8B5CF6' }}></div>
                      <div className="brandqr__color-swatch" style={{ background: '#06B6D4' }}></div>
                    </div>
                    <div className="brandqr__color-slider"></div>
                  </div>
                </div>
                <h3 className="brandqr__feature-title">Customization Suite</h3>
                <p className="brandqr__feature-desc">
                  Customize colors and embed logos with precision.
                </p>
              </div>
            </div>

            <div 
              className="brandqr__feature-card brandqr__feature-card--short"
              onMouseMove={handleMouseMove}
            >
              <div className="brandqr__feature-content">
                <div className="brandqr__instant-preview">
                  <div className="brandqr__qr-forming">
                    {[...Array(25)].map((_, i) => (
                      <div key={i} className="brandqr__qr-pixel"></div>
                    ))}
                  </div>
                  <div className="brandqr__pulse-ring"></div>
                  <div className="brandqr__pulse-ring brandqr__pulse-ring--delayed"></div>
                </div>
                <h3 className="brandqr__feature-title">Instant, No-Click Generation</h3>
                <p className="brandqr__feature-desc">
                  QR codes generate instantly as you type. No buttons needed.
                </p>
              </div>
            </div>

            <div 
              className="brandqr__feature-card brandqr__feature-card--tall"
              onMouseMove={handleMouseMove}
            >
              <div className="brandqr__feature-content">
                <div className="brandqr__download-preview">
                  <div className="brandqr__qr-detail">
                    {[...Array(36)].map((_, i) => (
                      <div key={i} className="brandqr__qr-detail-pixel"></div>
                    ))}
                    <div className="brandqr__qr-corner brandqr__qr-corner--tl"></div>
                    <div className="brandqr__qr-corner brandqr__qr-corner--tr"></div>
                    <div className="brandqr__qr-corner brandqr__qr-corner--bl"></div>
                    <div className="brandqr__qr-corner brandqr__qr-corner--br"></div>
                  </div>
                  <div className="brandqr__format-badges">
                    <span className="brandqr__format-badge">PNG</span>
                    <span className="brandqr__format-badge">SVG</span>
                  </div>
                </div>
                <h3 className="brandqr__feature-title">High-Resolution Downloads</h3>
                <p className="brandqr__feature-desc">
                  Export in PNG or SVG format for any use case.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="brandqr__demo">
        <div className="brandqr__demo-container">
          <h2 className="brandqr__section-title">See It In Action</h2>
          <p className="brandqr__section-subtitle">
            Watch how BrandQR intelligently generates QR codes for different content types
          </p>

          <div className="brandqr__demo-showcase">
            <div className="brandqr__demo-inputs">
              {Object.keys(demoQRs).map((key) => (
                <div
                  key={key}
                  className={`brandqr__demo-input ${activeDemo === parseInt(key) ? 'brandqr__demo-input--active' : ''}`}
                  onClick={() => setActiveDemo(parseInt(key))}
                >
                  <div className="brandqr__demo-input-header">
                    <span className="brandqr__demo-type-badge" style={{ background: demoQRs[key].color }}>
                      {demoQRs[key].type.toUpperCase()}
                    </span>
                  </div>
                  <div className="brandqr__demo-input-value">
                    {demoQRs[key].value}
                  </div>
                </div>
              ))}
            </div>

            <div className="brandqr__demo-output">
              {demoQRs[activeDemo] && (
                <>
                  <div className="brandqr__demo-qr-container">
                    <img
                      src={demoQRs[activeDemo].qr}
                      alt={`${demoQRs[activeDemo].type} QR code`}
                      className="brandqr__demo-qr-image"
                    />
                  </div>
                  <div className="brandqr__demo-output-label">
                    Generated {demoQRs[activeDemo].type} QR Code
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
        </>
      )}

      <footer className="brandqr__footer">
        <div className="brandqr__footer-content">
          <div className="brandqr__footer-brand">
            <div className="brandqr__logo">
              <div className="brandqr__logo-icon"></div>
              <span>BrandQR</span>
            </div>
            <p className="brandqr__footer-tagline">Automate the impossible.</p>
          </div>

          <div className="brandqr__footer-links">
            <div className="brandqr__footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#docs">Documentation</a>
            </div>
            <div className="brandqr__footer-column">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#blog">Blog</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <DownloadGateModal
        isOpen={downloadGateOpen}
        onClose={handleDownloadGateClose}
        onProceedDownload={handleDownloadGateClose}
        onSignUp={handleDownloadGateSignUp}
      />

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {showSavedQRs && (
        <div className="brandqr__saved-modal" onClick={() => setShowSavedQRs(false)}>
          <div className="brandqr__saved-content" onClick={(e) => e.stopPropagation()}>
            <div className="brandqr__saved-header">
              <h2>My Saved QR Codes</h2>
              <button className="brandqr__close-button" onClick={() => setShowSavedQRs(false)}>✕</button>
            </div>
            <div className="brandqr__saved-grid">
              {savedQRCodes.length === 0 ? (
                <p className="brandqr__empty-message">No saved QR codes yet. Create one to get started!</p>
              ) : (
                savedQRCodes.map((qr) => (
                  <div key={qr.id} className="brandqr__saved-item">
                    <div className="brandqr__saved-image">
                      {qr.qr_image_data && (
                        <img src={qr.qr_image_data} alt={qr.title} />
                      )}
                    </div>
                    <div className="brandqr__saved-info">
                      <h3>{qr.title}</h3>
                      <p className="brandqr__saved-type">{qr.qr_type}</p>
                      <p className="brandqr__saved-date">
                        {new Date(qr.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="brandqr__saved-actions">
                      <a
                        href={qr.qr_image_data}
                        download={`${qr.title}.png`}
                        className="brandqr__download-button"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => deleteQRCode(qr.id)}
                        className="brandqr__delete-button"
                        aria-label="Delete QR Code"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BrandQRLanding
