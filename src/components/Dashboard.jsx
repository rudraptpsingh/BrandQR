import { useState } from 'react'
import './Dashboard.css'
import UserCodesDashboard from './UserCodesDashboard'

const Dashboard = ({ user, savedQRCodes, onDeleteQRCode, inputValue, setInputValue, detectedType, qrColor, setQrColor, qrCodeDataURL, logoPreview, logoImage, handleLogoUpload, removeLogo, fileInputRef, getTypeIcon, downloadQRCode, saveQRCodeToDatabase, isSaving, currentQRSaved, isDashboardActive, setIsDashboardActive }) => {
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate stats
  const calculateStats = () => {
    const totalCodes = savedQRCodes.length
    const totalScans = savedQRCodes.reduce((sum, qr) => sum + (qr.scan_count || 0), 0)
    const smartCodes = savedQRCodes.filter(qr => qr.qr_type === 'multi-platform').length
    const basicCodes = totalCodes - smartCodes
    
    return {
      totalCodes,
      totalScans,
      smartCodes,
      basicCodes,
      latestCode: savedQRCodes.length > 0 ? savedQRCodes[0] : null
    }
  }

  const stats = calculateStats()

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const scrollToGenerator = () => {
    setActiveTab('create')
  }

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        {/* Horizontal Pill Tab Bar */}
        <nav className="dashboard__tab-bar">
          <div className="dashboard__tab-bar-container">
            <button
              className={`dashboard__tab ${activeTab === 'overview' ? 'dashboard__tab--active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="dashboard__tab-icon">
                <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Overview</span>
            </button>

            <button
              className={`dashboard__tab ${activeTab === 'create' ? 'dashboard__tab--active' : ''}`}
              onClick={() => handleTabChange('create')}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="dashboard__tab-icon">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Create New</span>
            </button>

            <button
              className={`dashboard__tab ${activeTab === 'assets' ? 'dashboard__tab--active' : ''}`}
              onClick={() => handleTabChange('assets')}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="dashboard__tab-icon">
                <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 21V5C16 4.46957 15.7893 3.96086 15.4142 3.58579C15.0391 3.21071 14.5304 3 14 3H10C9.46957 3 8.96086 3.21071 8.58579 3.58579C8.21071 3.96086 8 4.46957 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>My Assets</span>
            </button>

            <button
              className={`dashboard__tab ${activeTab === 'templates' ? 'dashboard__tab--active' : ''}`}
              onClick={() => handleTabChange('templates')}
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="dashboard__tab-icon">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Templates</span>
            </button>
          </div>
        </nav>

        {/* Dynamic Content Area with Transitions */}
        <div className="dashboard__content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="dashboard__tab-content dashboard__tab-content--fade-in">
              <div className="dashboard__overview">
                <div className="dashboard__overview-header">
                  <div>
                    <h1 className="dashboard__page-title">Overview</h1>
                    <p className="dashboard__page-subtitle">Monitor your QR code performance and analytics</p>
                  </div>
                  <button className="dashboard__create-btn" onClick={scrollToGenerator}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Create New
                  </button>
                </div>

                {/* Stats Grid */}
                <div className="dashboard__stats-grid">
                  <div className="dashboard__stat-glass-card">
                    <div className="dashboard__stat-icon-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                        <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                        <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                        <rect x="16" y="16" width="3" height="3" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="dashboard__stat-info">
                      <div className="dashboard__stat-value">{stats.totalCodes}</div>
                      <div className="dashboard__stat-label">Total Codes</div>
                    </div>
                  </div>

                  <div className="dashboard__stat-glass-card">
                    <div className="dashboard__stat-icon-wrapper dashboard__stat-icon-wrapper--scans">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </div>
                    <div className="dashboard__stat-info">
                      <div className="dashboard__stat-value">{stats.totalScans}</div>
                      <div className="dashboard__stat-label">Total Scans</div>
                    </div>
                  </div>

                  <div className="dashboard__stat-glass-card">
                    <div className="dashboard__stat-icon-wrapper dashboard__stat-icon-wrapper--smart">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="dashboard__stat-info">
                      <div className="dashboard__stat-value">{stats.smartCodes}</div>
                      <div className="dashboard__stat-label">Smart Codes</div>
                    </div>
                  </div>

                  <div className="dashboard__stat-glass-card">
                    <div className="dashboard__stat-icon-wrapper dashboard__stat-icon-wrapper--basic">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.46997L11.75 5.17997" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 11C13.5705 10.4259 13.0226 9.95083 12.3934 9.60704C11.7642 9.26325 11.0685 9.05885 10.3533 9.00765C9.63819 8.95644 8.92037 9.05963 8.24861 9.31018C7.57685 9.56073 6.96689 9.9529 6.45996 10.46L3.45996 13.46C2.54917 14.403 2.04519 15.666 2.05659 16.977C2.06798 18.288 2.59382 19.5421 3.52086 20.4691C4.4479 21.3961 5.70197 21.922 7.01295 21.9334C8.32393 21.9448 9.58694 21.4408 10.53 20.53L12.24 18.82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="dashboard__stat-info">
                      <div className="dashboard__stat-value">{stats.basicCodes}</div>
                      <div className="dashboard__stat-label">Basic Codes</div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                {stats.latestCode && (
                  <div className="dashboard__recent-section">
                    <h2 className="dashboard__section-title">Latest Code</h2>
                    <div className="dashboard__latest-glass-card">
                      <div className="dashboard__latest-qr">
                        {stats.latestCode.qr_image_data && (
                          <img src={stats.latestCode.qr_image_data} alt={stats.latestCode.title} />
                        )}
                      </div>
                      <div className="dashboard__latest-info">
                        <h3 className="dashboard__latest-title">{stats.latestCode.title}</h3>
                        <p className="dashboard__latest-meta">Created {new Date(stats.latestCode.created_at).toLocaleDateString()}</p>
                        <div className="dashboard__latest-scans">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          <span>{stats.latestCode.scan_count || 0} scans</span>
                        </div>
                      </div>
                      <button className="dashboard__latest-action" onClick={() => setActiveTab('assets')}>
                        View All
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create New Tab */}
          {activeTab === 'create' && (
            <div className="dashboard__tab-content dashboard__tab-content--fade-in">
              <div className="dashboard__create">
                <h1 className="dashboard__page-title">Create New QR Code</h1>
                <p className="dashboard__page-subtitle">Design beautiful, branded QR codes in seconds</p>

                <div className="dashboard__generator-glass-card">
                  <div className={`dashboard__generator-inner ${isDashboardActive ? 'dashboard__generator-inner--active' : ''}`}>
                    <div className="dashboard__input-wrapper">
                      <input
                        type="text"
                        className="dashboard__input"
                        placeholder="Enter URL, Text, or More..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onFocus={() => setIsDashboardActive(true)}
                        onBlur={() => {
                          if (!inputValue) setIsDashboardActive(false)
                        }}
                      />
                      <div className="dashboard__type-badge">
                        <span className="dashboard__type-icon">{getTypeIcon(detectedType)}</span>
                        <span className="dashboard__type-text">{detectedType}</span>
                      </div>
                    </div>

                    <div className="dashboard__color-section">
                      <label className="dashboard__label">QR Color:</label>
                      <div className="dashboard__color-presets">
                        <button
                          className={`dashboard__color-preset ${qrColor === '#000000' ? 'dashboard__color-preset--active' : ''}`}
                          style={{ background: '#000000' }}
                          onClick={() => setQrColor('#000000')}
                          title="Black"
                        ></button>
                        <button
                          className={`dashboard__color-preset ${qrColor === '#8B5CF6' ? 'dashboard__color-preset--active' : ''}`}
                          style={{ background: '#8B5CF6' }}
                          onClick={() => setQrColor('#8B5CF6')}
                          title="Purple"
                        ></button>
                        <button
                          className={`dashboard__color-preset ${qrColor === '#06B6D4' ? 'dashboard__color-preset--active' : ''}`}
                          style={{ background: '#06B6D4' }}
                          onClick={() => setQrColor('#06B6D4')}
                          title="Cyan"
                        ></button>
                        <button
                          className={`dashboard__color-preset ${qrColor === '#EC4899' ? 'dashboard__color-preset--active' : ''}`}
                          style={{ background: '#EC4899' }}
                          onClick={() => setQrColor('#EC4899')}
                          title="Pink"
                        ></button>
                        <button
                          className={`dashboard__color-preset ${qrColor === '#10B981' ? 'dashboard__color-preset--active' : ''}`}
                          style={{ background: '#10B981' }}
                          onClick={() => setQrColor('#10B981')}
                          title="Green"
                        ></button>
                      </div>
                    </div>

                    <div className="dashboard__logo-section">
                      <label className="dashboard__label">Logo (Optional):</label>
                      {!logoPreview ? (
                        <div className="dashboard__logo-upload">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="dashboard__file-input"
                            id="logo-upload-dashboard"
                          />
                          <label htmlFor="logo-upload-dashboard" className="dashboard__file-label">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Upload Logo</span>
                          </label>
                        </div>
                      ) : (
                        <div className="dashboard__logo-preview">
                          <img src={logoPreview} alt="Logo preview" className="dashboard__logo-image" />
                          <button type="button" onClick={removeLogo} className="dashboard__remove-logo">
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    <div className={`dashboard__qr-results ${qrCodeDataURL ? 'dashboard__qr-results--visible' : ''}`}>
                      {qrCodeDataURL && (
                        <>
                          <div className="dashboard__qr-preview">
                            <img src={qrCodeDataURL} alt="QR Code Preview" className="dashboard__qr-image" />
                          </div>

                          <div className="dashboard__download-buttons">
                            <button
                              className="dashboard__download-btn dashboard__download-btn--png"
                              onClick={() => downloadQRCode('png')}
                            >
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 15L12 3M12 15L8 11M12 15L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M3 15L3 18C3 19.6569 4.34315 21 6 21L18 21C19.6569 21 21 19.6569 21 18L21 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              Download PNG
                            </button>
                            <button
                              className="dashboard__download-btn dashboard__download-btn--svg"
                              onClick={() => downloadQRCode('svg')}
                            >
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 15L12 3M12 15L8 11M12 15L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M3 15L3 18C3 19.6569 4.34315 21 6 21L18 21C19.6569 21 21 19.6569 21 18L21 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                              </svg>
                              Download SVG
                            </button>
                            <button
                              className={`dashboard__download-btn dashboard__download-btn--save ${currentQRSaved ? 'dashboard__download-btn--saved' : ''}`}
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
          )}

          {/* My Assets Tab */}
          {activeTab === 'assets' && (
            <div className="dashboard__tab-content dashboard__tab-content--fade-in">
              <div className="dashboard__assets">
                <h1 className="dashboard__page-title">My Assets</h1>
                <p className="dashboard__page-subtitle">Manage and organize all your QR codes</p>

                <UserCodesDashboard
                  qrCodes={savedQRCodes}
                  onEdit={(qr) => {
                    // Edit functionality placeholder
                  }}
                  onDownload={(qr) => {
                    const link = document.createElement('a')
                    link.href = qr.qr_image_data
                    link.download = `${qr.title.replace(/[^a-z0-9]/gi, '_')}.png`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                  onDelete={onDeleteQRCode}
                />
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="dashboard__tab-content dashboard__tab-content--fade-in">
              <div className="dashboard__templates">
                <h1 className="dashboard__page-title">Templates</h1>
                <p className="dashboard__page-subtitle">Start with pre-designed QR code templates</p>

                <div className="dashboard__templates-grid">
                  <div className="dashboard__template-card">
                    <div className="dashboard__template-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.46997L11.75 5.17997" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 11C13.5705 10.4259 13.0226 9.95083 12.3934 9.60704C11.7642 9.26325 11.0685 9.05885 10.3533 9.00765C9.63819 8.95644 8.92037 9.05963 8.24861 9.31018C7.57685 9.56073 6.96689 9.9529 6.45996 10.46L3.45996 13.46C2.54917 14.403 2.04519 15.666 2.05659 16.977C2.06798 18.288 2.59382 19.5421 3.52086 20.4691C4.4479 21.3961 5.70197 21.922 7.01295 21.9334C8.32393 21.9448 9.58694 21.4408 10.53 20.53L12.24 18.82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3>Website URL</h3>
                    <p>Direct users to your website or landing page</p>
                    <button className="dashboard__template-btn" onClick={() => setActiveTab('create')}>Use Template</button>
                  </div>

                  <div className="dashboard__template-card">
                    <div className="dashboard__template-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3>Email Contact</h3>
                    <p>Allow customers to contact you via email</p>
                    <button className="dashboard__template-btn" onClick={() => setActiveTab('create')}>Use Template</button>
                  </div>

                  <div className="dashboard__template-card">
                    <div className="dashboard__template-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3>Location</h3>
                    <p>Share your business location coordinates</p>
                    <button className="dashboard__template-btn" onClick={() => setActiveTab('create')}>Use Template</button>
                  </div>

                  <div className="dashboard__template-card">
                    <div className="dashboard__template-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.52 19C5.19 19 4.86 18.89 4.61 18.64C4.11 18.14 4.11 17.33 4.61 16.83L7.41 14.03C7.41 14.03 7.41 14.03 7.42 14.02C8.29 13.16 9.36 12.5 10.55 12.12L12.74 11.42C13.07 11.31 13.4 11.43 13.59 11.7C13.78 11.97 13.76 12.34 13.53 12.57L9.83 16.27C9.33 16.77 9.33 17.58 9.83 18.08C10.33 18.58 11.14 18.58 11.64 18.08L15.34 14.38C15.57 14.15 15.94 14.13 16.21 14.32C16.48 14.51 16.6 14.84 16.49 15.17L15.79 17.36C15.41 18.55 14.75 19.62 13.89 20.49C13.89 20.49 13.89 20.49 13.88 20.5L11.08 23.3C10.58 23.8 9.77 23.8 9.27 23.3C8.77 22.8 8.77 21.99 9.27 21.49L11.88 18.88C11.96 18.8 11.96 18.67 11.88 18.59C11.8 18.51 11.67 18.51 11.59 18.59L8.98 21.2C8.48 21.7 7.67 21.7 7.17 21.2C6.67 20.7 6.67 19.89 7.17 19.39L9.78 16.78C9.86 16.7 9.86 16.57 9.78 16.49C9.7 16.41 9.57 16.41 9.49 16.49L6.88 19.1C6.63 19.35 6.3 19.46 5.97 19.46L5.52 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M18.85 8.44C19.44 8.85 19.96 9.36 20.39 9.95" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16.93 6.52C17.91 6.93 18.79 7.56 19.5 8.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15.01 4.6C16.46 4.9 17.78 5.62 18.85 6.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3>WiFi Access</h3>
                    <p>Let guests connect to your WiFi network</p>
                    <button className="dashboard__template-btn" onClick={() => setActiveTab('create')}>Use Template</button>
                  </div>

                  <div className="dashboard__template-card">
                    <div className="dashboard__template-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 15L10 12L7 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3>Text Message</h3>
                    <p>Pre-compose SMS messages for customers</p>
                    <button className="dashboard__template-btn" onClick={() => setActiveTab('create')}>Use Template</button>
                  </div>

                  <div className="dashboard__template-card">
                    <div className="dashboard__template-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <h3>vCard Contact</h3>
                    <p>Share your complete contact information</p>
                    <button className="dashboard__template-btn" onClick={() => setActiveTab('create')}>Use Template</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

