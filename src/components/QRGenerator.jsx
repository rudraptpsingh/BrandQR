import { useState, useRef } from 'react'
import QRCode from 'qrcode'
import './QRGenerator.css'

const QRGenerator = () => {
  const [url, setUrl] = useState('')
  const [qrCodeDataURL, setQrCodeDataURL] = useState('')
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef(null)

  const isValidURL = (string) => {
    try {
      const urlObj = new URL(string)
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
    } catch (e) {
      return false
    }
  }

  const generateQRCode = async () => {
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    if (!isValidURL(url)) {
      setError('Please enter a valid URL (must start with http:// or https://)')
      return
    }

    setError('')
    setIsGenerating(true)

    try {
      const dataURL = await QRCode.toDataURL(url, {
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

  const downloadQRCode = () => {
    if (!qrCodeDataURL) return

    const link = document.createElement('a')
    link.href = qrCodeDataURL
    link.download = 'qrcode.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
          <p className="qr-generator__subtitle">Create QR codes instantly from any URL</p>
        </header>

        <div className="qr-generator__input-section">
          <div className="qr-generator__input-wrapper">
            <input
              type="text"
              className="qr-generator__input"
              placeholder="Enter URL (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              aria-label="URL input"
              disabled={isGenerating}
            />
            <button
              className="qr-generator__button qr-generator__button--primary"
              onClick={generateQRCode}
              disabled={isGenerating}
              aria-label="Generate QR Code"
            >
              {isGenerating ? 'Generating...' : 'Generate QR'}
            </button>
          </div>

          {error && (
            <div className="qr-generator__error" role="alert">
              {error}
            </div>
          )}
        </div>

        {qrCodeDataURL && (
          <div className="qr-generator__result">
            <div className="qr-generator__qr-container">
              <img
                src={qrCodeDataURL}
                alt="Generated QR Code"
                className="qr-generator__qr-image"
              />
            </div>
            <button
              className="qr-generator__button qr-generator__button--secondary"
              onClick={downloadQRCode}
              aria-label="Download QR Code"
            >
              Download QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRGenerator
