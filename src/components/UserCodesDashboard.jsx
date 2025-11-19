import './UserCodesDashboard.css'
import QRCode from 'qrcode'

const UserCodesDashboard = ({ qrCodes, onEdit, onDownload, onDelete }) => {

  const getTypeLabel = (type) => {
    const types = {
      'single-url': 'Static',
      'text': 'Static',
      'wifi': 'Static',
      'url': 'Static',
      'multi-platform': 'Dynamic',
      'email': 'Static',
      'sms': 'Static',
      'geolocation': 'Static',
      'vcard': 'Static'
    }
    return types[type] || 'Static'
  }

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  const handleDownloadPNG = async (qr) => {
    if (!qr.qr_image_data) return

    const link = document.createElement('a')
    link.href = qr.qr_image_data
    link.download = `${qr.title.replace(/[^a-z0-9]/gi, '_')}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadSVG = async (qr) => {
    if (!qr.qr_content) return

    try {
      const svg = await QRCode.toString(qr.qr_content, {
        type: 'svg',
        width: 400,
        margin: 2,
        color: {
          dark: qr.qr_color || '#000000',
          light: '#ffffff'
        }
      })
      
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${qr.title.replace(/[^a-z0-9]/gi, '_')}.svg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to generate SVG:', err)
    }
  }

  return (
    <section className="user-dashboard">
      <div className="user-dashboard__container">
        <div className="user-dashboard__header">
          <div className="user-dashboard__header-content">
            <h2 className="user-dashboard__title">My BrandQR Codes</h2>
            <p className="user-dashboard__subtitle">Manage your dynamic and static creations</p>
          </div>
          <div className="user-dashboard__stats">
            <div className="user-dashboard__stat">
              <span className="user-dashboard__stat-value">{qrCodes.length}</span>
              <span className="user-dashboard__stat-label">Total Codes</span>
            </div>
            <div className="user-dashboard__stat">
              <span className="user-dashboard__stat-value">{qrCodes.filter(qr => getTypeLabel(qr.qr_type) === 'Dynamic').length}</span>
              <span className="user-dashboard__stat-label">Dynamic</span>
            </div>
          </div>
        </div>

        {qrCodes.length === 0 ? (
          <div className="user-dashboard__empty">
            <div className="user-dashboard__empty-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="4" y="13" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="13" y="4" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="15" y="15" width="3" height="3" fill="currentColor"/>
              </svg>
            </div>
            <h3 className="user-dashboard__empty-title">No QR codes yet</h3>
            <p className="user-dashboard__empty-text">Create your first QR code using the generator above</p>
          </div>
        ) : (
          <div className="user-dashboard__grid">
            {qrCodes.map((qr) => {
              const typeLabel = getTypeLabel(qr.qr_type)
              const isDynamic = typeLabel === 'Dynamic'

              return (
                <div key={qr.id} className="code-card">
                  <div className="code-card__header">
                    <div className="code-card__qr">
                      {qr.qr_image_data ? (
                        <img src={qr.qr_image_data} alt={qr.title} />
                      ) : (
                        <div className="code-card__qr-placeholder">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="4" y="4" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                            <rect x="4" y="13" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                            <rect x="13" y="4" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                            <rect x="15" y="15" width="3" height="3" fill="currentColor"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="code-card__content">
                    <div className="code-card__title-row">
                      <h3 className="code-card__title">{qr.title}</h3>
                      <span className={`code-card__badge code-card__badge--${isDynamic ? 'dynamic' : 'static'}`}>
                        {typeLabel}
                      </span>
                    </div>

                    <div className="code-card__meta">
                      <span className="code-card__date">
                        Created {getTimeAgo(qr.created_at)}
                      </span>
                    </div>

                    {qr.qr_content && (
                      <div className="code-card__qr-content">
                        <p className="code-card__qr-content-label">Content:</p>
                        <p className="code-card__qr-content-text">{qr.qr_content}</p>
                      </div>
                    )}

                    <div className="code-card__footer">
                      {isDynamic && (
                        <div className="code-card__scans">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="code-card__scans-count">{qr.scan_count || 0}</span>
                          <span className="code-card__scans-label">Scans</span>
                        </div>
                      )}

                      <div className="code-card__actions-row">
                        <div className="code-card__download-group">
                          <button
                            className="code-card__action-button code-card__action-button--download-png"
                            onClick={() => handleDownloadPNG(qr)}
                            aria-label="Download PNG"
                          >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 15L12 3M12 15L8 11M12 15L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M3 15L3 18C3 19.6569 4.34315 21 6 21L18 21C19.6569 21 21 19.6569 21 18L21 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            PNG
                          </button>
                          <button
                            className="code-card__action-button code-card__action-button--download-svg"
                            onClick={() => handleDownloadSVG(qr)}
                            aria-label="Download SVG"
                          >
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 15L12 3M12 15L8 11M12 15L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M3 15L3 18C3 19.6569 4.34315 21 6 21L18 21C19.6569 21 21 19.6569 21 18L21 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            SVG
                          </button>
                        </div>
                        <button
                          className="code-card__action-button code-card__action-button--delete"
                          onClick={() => onDelete(qr.id)}
                          aria-label="Delete QR Code"
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default UserCodesDashboard
