import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import './BrandQRLanding.css'

const BrandQRLanding = () => {
  const [inputValue, setInputValue] = useState('')
  const [qrCodeDataURL, setQrCodeDataURL] = useState('')
  const [detectedType, setDetectedType] = useState('text')
  const [qrColor, setQrColor] = useState('#000000')
  const [isTerminalVisible, setIsTerminalVisible] = useState(false)
  const [terminalText, setTerminalText] = useState('')
  const debounceTimer = useRef(null)
  const canvasRef = useRef(null)

  const socialProofLogos = [
    'NETFLIX', 'SPOTIFY', 'AIRBNB', 'UBER', 'STRIPE', 'SLACK',
    'SHOPIFY', 'ZOOM', 'DISCORD', 'DROPBOX', 'FIGMA', 'NOTION'
  ]

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

  const generateQRCode = async (text, color = qrColor) => {
    if (!text.trim()) {
      setQrCodeDataURL('')
      return
    }

    try {
      const dataURL = await QRCode.toDataURL(text, {
        width: 400,
        margin: 2,
        color: {
          dark: color,
          light: '#00000000'
        }
      })
      setQrCodeDataURL(dataURL)
    } catch (err) {
      console.error('QR generation error:', err)
    }
  }

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      const type = detectContentType(inputValue)
      setDetectedType(type)
      generateQRCode(inputValue)
    }, 300)

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [inputValue, qrColor])

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
      QRCode.toString(inputValue, {
        type: 'svg',
        width: 400,
        margin: 2,
        color: {
          dark: qrColor,
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

  useEffect(() => {
    const terminalCode = `BrandQR.generate(WiFi:MyCPA;P:guest123))
BrandQR.generate(WiFi:S:MiFi;T:S:MyCafe;T:WPA;P:guest22))
  TestDenvese.itter TheIglse=8DD8))`

    let index = 0
    const typeInterval = setInterval(() => {
      if (index < terminalCode.length) {
        setTerminalText(terminalCode.substring(0, index + 1))
        index++
      } else {
        clearInterval(typeInterval)
      }
    }, 50)

    return () => clearInterval(typeInterval)
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

  return (
    <div className="brandqr">
      <div className="brandqr__aurora-bg"></div>

      <nav className="brandqr__nav">
        <div className="brandqr__nav-content">
          <div className="brandqr__logo">
            <div className="brandqr__logo-icon"></div>
            <span>BrandQR</span>
          </div>
          <div className="brandqr__nav-links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <button className="brandqr__nav-cta">Sign In</button>
          </div>
        </div>
      </nav>

      <section className="brandqr__hero">
        <div className="brandqr__hero-content">
          <div className="brandqr__hero-text">
            <h1 className="brandqr__hero-title">
              Automate the Impossible.
            </h1>
            <p className="brandqr__hero-subtitle">
              Instantly generate intelligent QR codes for anything.
            </p>

            <button className="brandqr__hero-cta">
              <span className="brandqr__cta-text">Experience BrandQR</span>
              <div className="brandqr__cta-beam"></div>
            </button>
          </div>

          <div className="brandqr__hero-visual">
            <div className="brandqr__dashboard">
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
                  />
                  <div className="brandqr__type-badge">
                    <span className="brandqr__type-icon">{getTypeIcon(detectedType)}</span>
                    <span className="brandqr__type-text">{detectedType}</span>
                  </div>
                </div>

                {qrCodeDataURL && (
                  <div className="brandqr__qr-preview">
                    <img src={qrCodeDataURL} alt="QR Code Preview" className="brandqr__qr-image" />
                  </div>
                )}

                {qrCodeDataURL && (
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="brandqr__social-proof">
        <div className="brandqr__ticker">
          <div className="brandqr__ticker-track">
            {[...socialProofLogos, ...socialProofLogos, ...socialProofLogos].map((logo, idx) => (
              <div key={idx} className="brandqr__ticker-item">{logo}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="brandqr__features">
        <div className="brandqr__features-container">
          <h2 className="brandqr__section-title">Powerful Features</h2>

          <div className="brandqr__bento-grid">
            <div className="brandqr__feature-card">
              <div className="brandqr__feature-content">
                <div className="brandqr__feature-icon-group">
                  <span className="brandqr__feature-icon">🌐</span>
                  <span className="brandqr__feature-icon">📶</span>
                  <span className="brandqr__feature-icon">👤</span>
                  <span className="brandqr__feature-icon">✉️</span>
                  <span className="brandqr__feature-icon">💬</span>
                  <span className="brandqr__feature-icon">📍</span>
                </div>
                <h3 className="brandqr__feature-title">AI-Powered Smart Detection</h3>
                <p className="brandqr__feature-desc">
                  Automatically detects content type as you type. URLs, Wi-Fi, vCards, email, SMS, and geolocation.
                </p>
              </div>
            </div>

            <div className="brandqr__feature-card">
              <div className="brandqr__feature-content">
                <div className="brandqr__customization-preview">
                  <div className="brandqr__color-picker-demo">
                    <div className="brandqr__color-swatch" style={{ background: '#000' }}></div>
                    <div className="brandqr__color-swatch" style={{ background: '#8B5CF6' }}></div>
                    <div className="brandqr__color-swatch" style={{ background: '#06B6D4' }}></div>
                    <div className="brandqr__color-slider"></div>
                  </div>
                </div>
                <h3 className="brandqr__feature-title">Customization Suite</h3>
                <p className="brandqr__feature-desc">
                  Customize colors and embed logos with precision.
                </p>
              </div>
            </div>

            <div className="brandqr__feature-card">
              <div className="brandqr__feature-content">
                <div className="brandqr__instant-preview">
                  <div className="brandqr__pulse-ring"></div>
                  <div className="brandqr__pulse-ring brandqr__pulse-ring--delayed"></div>
                  <div className="brandqr__instant-icon">⚡</div>
                </div>
                <h3 className="brandqr__feature-title">Instant, No-Click Generation</h3>
                <p className="brandqr__feature-desc">
                  QR codes generate instantly as you type. No buttons needed.
                </p>
              </div>
            </div>

            <div className="brandqr__feature-card">
              <div className="brandqr__feature-content">
                <div className="brandqr__download-preview">
                  <div className="brandqr__download-icon">⬇</div>
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

      <section className="brandqr__terminal">
        <div className="brandqr__terminal-container">
          <h2 className="brandqr__section-title">See It In Action</h2>

          <div className="brandqr__terminal-window">
            <div className="brandqr__terminal-header">
              <div className="brandqr__terminal-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div className="brandqr__terminal-title">brandqr-demo.js</div>
            </div>
            <div className="brandqr__terminal-body">
              <pre className="brandqr__terminal-code">
                <code>{terminalText}<span className="brandqr__terminal-cursor">|</span></code>
              </pre>
            </div>
            <div className="brandqr__terminal-qr">
              {qrCodeDataURL && (
                <img src={qrCodeDataURL} alt="Terminal QR" className="brandqr__terminal-qr-image" />
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="brandqr__customization">
        <div className="brandqr__customization-container">
          <h2 className="brandqr__section-title">Customize Your QR</h2>

          <div className="brandqr__customization-grid">
            <div className="brandqr__customization-controls">
              <div className="brandqr__control-group">
                <label className="brandqr__control-label">QR Code Color</label>
                <div className="brandqr__color-picker">
                  <input
                    type="color"
                    className="brandqr__color-input"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                  />
                  <span className="brandqr__color-value">{qrColor}</span>
                </div>
              </div>

              <div className="brandqr__control-group">
                <label className="brandqr__control-label">Quick Presets</label>
                <div className="brandqr__preset-colors">
                  <button
                    className="brandqr__preset-btn"
                    style={{ background: '#000000' }}
                    onClick={() => setQrColor('#000000')}
                  ></button>
                  <button
                    className="brandqr__preset-btn"
                    style={{ background: '#8B5CF6' }}
                    onClick={() => setQrColor('#8B5CF6')}
                  ></button>
                  <button
                    className="brandqr__preset-btn"
                    style={{ background: '#06B6D4' }}
                    onClick={() => setQrColor('#06B6D4')}
                  ></button>
                  <button
                    className="brandqr__preset-btn"
                    style={{ background: '#EC4899' }}
                    onClick={() => setQrColor('#EC4899')}
                  ></button>
                  <button
                    className="brandqr__preset-btn"
                    style={{ background: '#10B981' }}
                    onClick={() => setQrColor('#10B981')}
                  ></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
    </div>
  )
}

export default BrandQRLanding
