import { useState } from 'react'
import './Dashboard.css'
import UserCodesDashboard from './UserCodesDashboard'

const Dashboard = ({ user, savedQRCodes, onDeleteQRCode, inputValue, setInputValue, detectedType, qrColor, setQrColor, selectedPattern, setSelectedPattern, qrCodeDataURL, generateQRCode, logoPreview, logoImage, handleLogoUpload, removeLogo, fileInputRef, getTypeIcon, downloadQRCode, saveQRCodeToDatabase, isSaving, currentQRSaved, isDashboardActive, setIsDashboardActive }) => {
  const [activeTab, setActiveTab] = useState('overview')

  // New Create New tab state
  const [codeTitle, setCodeTitle] = useState('')
  const [tags, setTags] = useState(['marketing', 'campaign'])
  const [tagInput, setTagInput] = useState('')
  const [creationMode, setCreationMode] = useState('single') // 'single' or 'bulk'
  const [selectedDestination, setSelectedDestination] = useState('url')
  const [designExpanded, setDesignExpanded] = useState(true)
  const [gradientEnabled, setGradientEnabled] = useState(false)

  // My Assets filtering state
  const [assetsSearchTerm, setAssetsSearchTerm] = useState('')
  const [selectedTagFilter, setSelectedTagFilter] = useState('all')

  // Templates state (Step 3.4)
  const [templates, setTemplates] = useState([
    {
      id: 'template-1',
      name: 'Brand Website',
      design_config: {
        color: '#8B5CF6',
        pattern: 'round',
        gradient: true
      },
      preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjZ3JhZGllbnQpIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudCIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPjxzdG9wIHN0b3AtY29sb3I9IiM4QjVDRjYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwNkI2RDQiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48L3N2Zz4='
    },
    {
      id: 'template-2',
      name: 'Business Card',
      design_config: {
        color: '#10B981',
        pattern: 'square',
        gradient: false
      },
      preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiMxMEI5ODEiLz48L3N2Zz4='
    },
    {
      id: 'template-3',
      name: 'Social Media',
      design_config: {
        color: '#EC4899',
        pattern: 'diamond',
        gradient: true
      },
      preview: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjZ3JhZGllbnQyKSIvPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQyIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agc3RvcC1jb2xvcj0iI0VDNDg5OSIvPjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0Y5NzMxNiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjwvc3ZnPg=='
    }
  ])

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

  // Handler functions for new features
  const addTag = (tag) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  const handleCreationModeChange = (mode) => {
    if (mode === 'bulk') {
      // Show Pro upgrade modal in the future
      alert('Bulk QR Code creation is a Pro feature. Upgrade to unlock this functionality!')
      return
    }
    setCreationMode(mode)
  }

  const handleDestinationChange = (destination) => {
    setSelectedDestination(destination)
    // Clear input when changing destination types
    if (destination !== 'url') {
      setInputValue('')
    }
  }

  // Template functionality (Step 3.4)
  const saveAsTemplate = () => {
    const templateName = prompt('Enter a name for this template:') || `Template ${templates.length + 1}`

    const newTemplate = {
      id: `template-${Date.now()}`,
      name: templateName,
      design_config: {
        color: qrColor,
        pattern: selectedPattern,
        gradient: gradientEnabled
      },
      preview: qrCodeDataURL || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9IiM5Q0EzQUYiLz4='
    }

    setTemplates([...templates, newTemplate])
    alert(`Template "${templateName}" saved successfully!`)
  }

  const loadTemplate = (template) => {
    setQrColor(template.design_config.color)
    setSelectedPattern(template.design_config.pattern)
    setGradientEnabled(template.design_config.gradient || false)
    setActiveTab('create')
    alert(`Template "${template.name}" loaded!`)
  }

  const deleteTemplate = (templateId) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId))
    }
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
                <p className="dashboard__page-subtitle">Design beautiful, branded QR codes with advanced features</p>

                {/* Two-Panel Layout */}
                <div className="dashboard__create-layout">
                  {/* Configuration Panel */}
                  <div className="dashboard__config-panel">

                    {/* Naming & Organization (Step 2.2) */}
                    <div className="dashboard__config-card">
                      <h3 className="dashboard__config-title">Name & Organization</h3>

                      <div className="dashboard__field-group">
                        <label className="dashboard__field-label">
                          Code Title <span className="dashboard__required">*</span>
                        </label>
                        <input
                          type="text"
                          className="dashboard__glass-input"
                          placeholder="Enter a descriptive title..."
                          value={codeTitle}
                          onChange={(e) => setCodeTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="dashboard__field-group">
                        <label className="dashboard__field-label">Tags</label>
                        <div className="dashboard__tags-input">
                          <input
                            type="text"
                            className="dashboard__glass-input"
                            placeholder="Add tags (press Enter)..."
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagInputKeyPress}
                          />
                          <div className="dashboard__tags-list">
                            {tags.map((tag, index) => (
                              <span key={index} className="dashboard__tag">
                                {tag}
                                <button
                                  onClick={() => removeTag(tag)}
                                  className="dashboard__tag-remove"
                                  type="button"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Creation Mode (Step 2.3) */}
                    <div className="dashboard__config-card">
                      <h3 className="dashboard__config-title">Creation Mode</h3>

                      <div className="dashboard__mode-toggle">
                        <button
                          className={`dashboard__mode-option ${creationMode === 'single' ? 'dashboard__mode-option--active' : ''}`}
                          onClick={() => handleCreationModeChange('single')}
                        >
                          <div className="dashboard__mode-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <span>Single QR Code</span>
                        </button>
                        <button
                          className="dashboard__mode-option dashboard__mode-option--pro"
                          onClick={() => handleCreationModeChange('bulk')}
                        >
                          <div className="dashboard__mode-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="2"/>
                              <rect x="15" y="3" width="6" height="6" stroke="currentColor" strokeWidth="2"/>
                              <rect x="3" y="15" width="6" height="6" stroke="currentColor" strokeWidth="2"/>
                              <rect x="15" y="15" width="6" height="6" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <span>Many QR Codes</span>
                          <span className="dashboard__pro-badge">PRO</span>
                        </button>
                      </div>
                    </div>

                    {/* Destination Selector (Step 2.4) */}
                    <div className="dashboard__config-card">
                      <h3 className="dashboard__config-title">Destination Type</h3>

                      <div className="dashboard__destination-gallery">
                        <button
                          className={`dashboard__destination-card ${selectedDestination === 'url' ? 'dashboard__destination-card--active' : ''}`}
                          onClick={() => handleDestinationChange('url')}
                        >
                          <div className="dashboard__destination-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9403 15.7513 14.6897C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.46997L11.75 5.17997" stroke="currentColor" strokeWidth="2"/>
                              <path d="M14 11C13.5705 10.4259 13.0226 9.95083 12.3934 9.60704C11.7642 9.26325 11.0685 9.05885 10.3533 9.00765C9.63819 8.95644 8.92037 9.05963 8.24861 9.31018C7.57685 9.56073 6.96689 9.9529 6.45996 10.46L3.45996 13.46C2.54917 14.403 2.04519 15.666 2.05659 16.977C2.06798 18.288 2.59382 19.5421 3.52086 20.4691C4.4479 21.3961 5.70197 21.922 7.01295 21.9334C8.32393 21.9448 9.58694 21.4408 10.53 20.53L12.24 18.82" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <span>Website URL</span>
                        </button>

                        <button
                          className={`dashboard__destination-card ${selectedDestination === 'vcard' ? 'dashboard__destination-card--active' : ''}`}
                          onClick={() => handleDestinationChange('vcard')}
                        >
                          <div className="dashboard__destination-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <span>vCard Contact</span>
                        </button>

                        <button
                          className={`dashboard__destination-card ${selectedDestination === 'file' ? 'dashboard__destination-card--active' : ''}`}
                          onClick={() => handleDestinationChange('file')}
                        >
                          <div className="dashboard__destination-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <span>File Upload</span>
                        </button>

                        <button
                          className={`dashboard__destination-card ${selectedDestination === 'email' ? 'dashboard__destination-card--active' : ''}`}
                          onClick={() => handleDestinationChange('email')}
                        >
                          <div className="dashboard__destination-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                              <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <span>Email</span>
                        </button>

                        <button
                          className={`dashboard__destination-card ${selectedDestination === 'location' ? 'dashboard__destination-card--active' : ''}`}
                          onClick={() => handleDestinationChange('location')}
                        >
                          <div className="dashboard__destination-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2"/>
                              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <span>Location</span>
                        </button>

                        <button
                          className={`dashboard__destination-card ${selectedDestination === 'wifi' ? 'dashboard__destination-card--active' : ''}`}
                          onClick={() => handleDestinationChange('wifi')}
                        >
                          <div className="dashboard__destination-icon">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5.52 19C5.19 19 4.86 18.89 4.61 18.64C4.11 18.14 4.11 17.33 4.61 16.83L7.41 14.03C7.41 14.03 7.41 14.03 7.42 14.02C8.29 13.16 9.36 12.5 10.55 12.12L12.74 11.42C13.07 11.31 13.4 11.43 13.59 11.7C13.78 11.97 13.76 12.34 13.53 12.57L9.83 16.27C9.33 16.77 9.33 17.58 9.83 18.08C10.33 18.58 11.14 18.58 11.64 18.08L15.34 14.38C15.57 14.15 15.94 14.13 16.21 14.32C16.48 14.51 16.6 14.84 16.49 15.17L15.79 17.36C15.41 18.55 14.75 19.62 13.89 20.49C13.89 20.49 13.89 20.49 13.88 20.5L11.08 23.3C10.58 23.8 9.77 23.8 9.27 23.3C8.77 22.8 8.77 21.99 9.27 21.49L11.88 18.88C11.96 18.8 11.96 18.67 11.88 18.59C11.8 18.51 11.67 18.51 11.59 18.59L8.98 21.2C8.48 21.7 7.67 21.7 7.17 21.2C6.67 20.7 6.67 19.89 7.17 19.39L9.78 16.78C9.86 16.7 9.86 16.57 9.78 16.49C9.7 16.41 9.57 16.41 9.49 16.49L6.88 19.1C6.63 19.35 6.3 19.46 5.97 19.46L5.52 19Z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                          </div>
                          <span>WiFi</span>
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Destination Forms */}
                    {selectedDestination === 'url' && (
                      <div className="dashboard__config-card">
                        <h3 className="dashboard__config-title">Website URL Configuration</h3>

                        <div className="dashboard__field-group">
                          <label className="dashboard__field-label">URL</label>
                          <input
                            type="url"
                            className="dashboard__glass-input"
                            placeholder="https://example.com"
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
                      </div>
                    )}

                    {selectedDestination === 'vcard' && (
                      <div className="dashboard__config-card">
                        <h3 className="dashboard__config-title">vCard Contact Information</h3>

                        <div className="dashboard__vcard-grid">
                          <div className="dashboard__field-group">
                            <label className="dashboard__field-label">First Name</label>
                            <input
                              type="text"
                              className="dashboard__glass-input"
                              placeholder="John"
                            />
                          </div>

                          <div className="dashboard__field-group">
                            <label className="dashboard__field-label">Last Name</label>
                            <input
                              type="text"
                              className="dashboard__glass-input"
                              placeholder="Doe"
                            />
                          </div>

                          <div className="dashboard__field-group">
                            <label className="dashboard__field-label">Email</label>
                            <input
                              type="email"
                              className="dashboard__glass-input"
                              placeholder="john@example.com"
                            />
                          </div>

                          <div className="dashboard__field-group">
                            <label className="dashboard__field-label">Phone</label>
                            <input
                              type="tel"
                              className="dashboard__glass-input"
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>

                          <div className="dashboard__field-group dashboard__field-group--full">
                            <label className="dashboard__field-label">Company</label>
                            <input
                              type="text"
                              className="dashboard__glass-input"
                              placeholder="Acme Corp"
                            />
                          </div>

                          <div className="dashboard__field-group dashboard__field-group--full">
                            <label className="dashboard__field-label">Job Title</label>
                            <input
                              type="text"
                              className="dashboard__glass-input"
                              placeholder="Software Engineer"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedDestination === 'file' && (
                      <div className="dashboard__config-card">
                        <h3 className="dashboard__config-title">File Upload</h3>

                        <div className="dashboard__file-drop-zone">
                          <div className="dashboard__file-drop-inner">
                            <div className="dashboard__file-drop-icon">
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <h4>Drop files here or click to browse</h4>
                            <p>Supports PDF, PNG, JPG, and other document types</p>
                            <input
                              type="file"
                              className="dashboard__file-input"
                              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                              id="file-upload-input"
                            />
                            <label htmlFor="file-upload-input" className="dashboard__file-browse-btn">
                              Browse Files
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedDestination === 'email' && (
                      <div className="dashboard__config-card">
                        <h3 className="dashboard__config-title">Email Configuration</h3>

                        <div className="dashboard__field-group">
                          <label className="dashboard__field-label">Email Address</label>
                          <input
                            type="email"
                            className="dashboard__glass-input"
                            placeholder="hello@example.com"
                          />
                        </div>

                        <div className="dashboard__field-group">
                          <label className="dashboard__field-label">Subject (Optional)</label>
                          <input
                            type="text"
                            className="dashboard__glass-input"
                            placeholder="Contact Request"
                          />
                        </div>

                        <div className="dashboard__field-group">
                          <label className="dashboard__field-label">Message (Optional)</label>
                          <textarea
                            className="dashboard__glass-input dashboard__textarea"
                            placeholder="Hello, I would like to get in touch..."
                            rows="3"
                          ></textarea>
                        </div>
                      </div>
                    )}

                    {selectedDestination === 'wifi' && (
                      <div className="dashboard__config-card">
                        <h3 className="dashboard__config-title">WiFi Network Configuration</h3>

                        <div className="dashboard__field-group">
                          <label className="dashboard__field-label">Network Name (SSID)</label>
                          <input
                            type="text"
                            className="dashboard__glass-input"
                            placeholder="MyWiFiNetwork"
                          />
                        </div>

                        <div className="dashboard__field-group">
                          <label className="dashboard__field-label">Password</label>
                          <input
                            type="password"
                            className="dashboard__glass-input"
                            placeholder="Enter WiFi password"
                          />
                        </div>

                        <div className="dashboard__field-group">
                          <label className="dashboard__field-label">Security Type</label>
                          <select className="dashboard__glass-input dashboard__select">
                            <option value="WPA">WPA/WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="none">Open Network</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {selectedDestination === 'location' && (
                      <div className="dashboard__config-card">
                        <h3 className="dashboard__config-title">Location Information</h3>

                        <div className="dashboard__field-group">
                          <label className="dashboard__field-label">Latitude</label>
                          <input
                            type="number"
                            step="any"
                            className="dashboard__glass-input"
                            placeholder="40.7128"
                          />
                        </div>

                        <div className="dashboard__field-group">
                          <label className="dashboard__field-label">Longitude</label>
                          <input
                            type="number"
                            step="any"
                            className="dashboard__glass-input"
                            placeholder="-74.0060"
                          />
                        </div>

                        <div className="dashboard__field-group dashboard__field-group--full">
                          <label className="dashboard__field-label">Address (Optional)</label>
                          <input
                            type="text"
                            className="dashboard__glass-input"
                            placeholder="123 Main St, New York, NY 10001"
                          />
                        </div>
                      </div>
                    )}

                    {/* Design Tools (Step 2.5) */}
                    <div className="dashboard__config-card dashboard__config-card--collapsible">
                      <h3
                        className="dashboard__config-title"
                        onClick={() => setDesignExpanded(!designExpanded)}
                        style={{ cursor: 'pointer' }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="dashboard__expand-icon"
                          style={{ transform: designExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                        >
                          <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Design Tools
                      </h3>

                      {designExpanded && (
                        <div className="dashboard__design-section">
                          <div className="dashboard__field-group">
                            <label className="dashboard__field-label">Color & Gradient</label>
                            <div className="dashboard__color-controls">
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
                              <div className="dashboard__color-advanced">
                                <input
                                  type="color"
                                  className="dashboard__color-picker"
                                  value={qrColor}
                                  onChange={(e) => setQrColor(e.target.value)}
                                />
                                <input
                                  type="text"
                                  className="dashboard__hex-input dashboard__glass-input"
                                  value={qrColor}
                                  onChange={(e) => setQrColor(e.target.value)}
                                  placeholder="#000000"
                                />
                                <button
                                  className={`dashboard__gradient-toggle ${gradientEnabled ? 'dashboard__gradient-toggle--active' : ''}`}
                                  onClick={() => setGradientEnabled(!gradientEnabled)}
                                >
                                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M12 2V22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="currentColor"/>
                                  </svg>
                                  Gradient
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="dashboard__field-group">
                            <label className="dashboard__field-label">Pattern Style</label>
                            <div className="dashboard__pattern-selector">
                              <button
                                className={`dashboard__pattern-option ${selectedPattern === 'square' ? 'dashboard__pattern-option--active' : ''}`}
                                onClick={() => {
                                  setSelectedPattern('square')
                                  if (inputValue && generateQRCode) {
                                    generateQRCode(inputValue, qrColor)
                                  }
                                }}
                              >
                                <div className="dashboard__pattern-preview dashboard__pattern-preview--square"></div>
                                <span>Square</span>
                              </button>
                              <button
                                className={`dashboard__pattern-option ${selectedPattern === 'round' ? 'dashboard__pattern-option--active' : ''}`}
                                onClick={() => {
                                  setSelectedPattern('round')
                                  if (inputValue && generateQRCode) {
                                    generateQRCode(inputValue, qrColor)
                                  }
                                }}
                              >
                                <div className="dashboard__pattern-preview dashboard__pattern-preview--round"></div>
                                <span>Round</span>
                              </button>
                              <button
                                className={`dashboard__pattern-option ${selectedPattern === 'diamond' ? 'dashboard__pattern-option--active' : ''}`}
                                onClick={() => {
                                  setSelectedPattern('diamond')
                                  if (inputValue && generateQRCode) {
                                    generateQRCode(inputValue, qrColor)
                                  }
                                }}
                              >
                                <div className="dashboard__pattern-preview dashboard__pattern-preview--diamond"></div>
                                <span>Diamond</span>
                              </button>
                            </div>
                          </div>

                        <div className="dashboard__field-group">
                          <label className="dashboard__field-label">Logo (Optional)</label>
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
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Preview Panel */}
                  <div className="dashboard__preview-panel">
                    <div className="dashboard__preview-card">
                      <h3 className="dashboard__preview-title">Live Preview</h3>

                      <div className="dashboard__qr-preview-container">
                        {qrCodeDataURL ? (
                          <>
                            <div className="dashboard__qr-preview-main">
                              <img src={qrCodeDataURL} alt="QR Code Preview" className="dashboard__qr-image" />
                            </div>

                            <div className="dashboard__preview-info">
                              <div className="dashboard__preview-meta">
                                <span className="dashboard__preview-label">Type:</span>
                                <span className="dashboard__preview-value">{detectedType.toUpperCase()}</span>
                              </div>
                              <div className="dashboard__preview-meta">
                                <span className="dashboard__preview-label">Color:</span>
                                <span className="dashboard__preview-value" style={{color: qrColor}}>{qrColor}</span>
                              </div>
                              {logoPreview && (
                                <div className="dashboard__preview-meta">
                                  <span className="dashboard__preview-label">Logo:</span>
                                  <span className="dashboard__preview-value">Embedded</span>
                                </div>
                              )}
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
                                PNG
                              </button>
                              <button
                                className="dashboard__download-btn dashboard__download-btn--svg"
                                onClick={() => downloadQRCode('svg')}
                              >
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 15L12 3M12 15L8 11M12 15L16 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M3 15L3 18C3 19.6569 4.34315 21 6 21L18 21C19.6569 21 21 19.6569 21 18L21 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                SVG
                              </button>
                              <button
                                className={`dashboard__download-btn dashboard__download-btn--save ${currentQRSaved ? 'dashboard__download-btn--saved' : ''}`}
                                onClick={saveQRCodeToDatabase}
                                disabled={isSaving || currentQRSaved}
                              >
                                {isSaving ? 'Saving...' : currentQRSaved ? 'Saved ✓' : 'Save'}
                              </button>

                              {qrCodeDataURL && (
                                <button
                                  className="dashboard__download-btn dashboard__download-btn--template"
                                  onClick={saveAsTemplate}
                                  title="Save current design as template"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M17 21V13H7V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M7 3V8H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Template
                                </button>
                              )}
                            </div>
                          </>
                        ) : (
                          <div className="dashboard__preview-placeholder">
                            <div className="dashboard__placeholder-icon">
                              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                                <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                                <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                                <rect x="16" y="16" width="3" height="3" fill="currentColor"/>
                              </svg>
                            </div>
                            <p>Enter content to generate QR code</p>
                          </div>
                        )}
                      </div>
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

                {/* Filtering Controls (Step 3.1) */}
                <div className="dashboard__assets-filters">
                  <div className="dashboard__search-container">
                    <div className="dashboard__search-wrapper">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="dashboard__search-icon">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                        <path d="21 21L16.65 16.65" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      <input
                        type="text"
                        className="dashboard__glass-input dashboard__search-input"
                        placeholder="Search by code title..."
                        value={assetsSearchTerm}
                        onChange={(e) => setAssetsSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="dashboard__filter-container">
                    <select
                      className="dashboard__glass-input dashboard__select dashboard__tag-filter"
                      value={selectedTagFilter}
                      onChange={(e) => setSelectedTagFilter(e.target.value)}
                    >
                      <option value="all">All Projects/Tags</option>
                      {/* Extract unique tags from saved QR codes */}
                      {[...new Set(
                        savedQRCodes
                          .flatMap(qr => qr.tags || [])
                          .filter(tag => tag && tag.trim())
                      )].map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <UserCodesDashboard
                  qrCodes={savedQRCodes.filter(qr => {
                    // Filter by search term
                    const matchesSearch = assetsSearchTerm === '' ||
                      qr.title.toLowerCase().includes(assetsSearchTerm.toLowerCase())

                    // Filter by tag
                    const matchesTag = selectedTagFilter === 'all' ||
                      (qr.tags && qr.tags.includes(selectedTagFilter))

                    return matchesSearch && matchesTag
                  })}
                  onEdit={(qr) => {
                    // TODO: Implement edit functionality
                    alert('Edit functionality coming soon!')
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
                  searchTerm={assetsSearchTerm}
                  tagFilter={selectedTagFilter}
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

                {/* Custom Templates (Step 3.4) */}
                <div className="dashboard__templates-section">
                  <h2 className="dashboard__section-title">Saved Templates</h2>
                  {templates.length > 0 ? (
                    <div className="dashboard__templates-grid">
                      {templates.map((template) => (
                        <div key={template.id} className="dashboard__template-card dashboard__template-card--custom">
                          <div className="dashboard__template-preview">
                            <img src={template.preview} alt={template.name} className="dashboard__template-preview-image" />
                            <div className="dashboard__template-overlay">
                              <button
                                className="dashboard__template-action dashboard__template-action--load"
                                onClick={() => loadTemplate(template)}
                                title="Load Template"
                              >
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M3 16L10 8L14 12L21 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M21 5H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M21 5V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                              <button
                                className="dashboard__template-action dashboard__template-action--delete"
                                onClick={() => deleteTemplate(template.id)}
                                title="Delete Template"
                              >
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <div className="dashboard__template-info">
                            <h3 className="dashboard__template-name">{template.name}</h3>
                            <div className="dashboard__template-config">
                              <span className="dashboard__template-color" style={{ backgroundColor: template.design_config.color }}></span>
                              <span className="dashboard__template-pattern">{template.design_config.pattern}</span>
                              {template.design_config.gradient && <span className="dashboard__template-gradient">Gradient</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="dashboard__templates-empty">
                      <div className="dashboard__empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                          <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                          <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                          <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                      <h3>No saved templates</h3>
                      <p>Create a QR code design and save it as a template for future use</p>
                      <button className="dashboard__template-btn" onClick={() => setActiveTab('create')}>Create First Template</button>
                    </div>
                  )}
                </div>

                {/* Default Templates */}
                <div className="dashboard__templates-section">
                  <h2 className="dashboard__section-title">Quick Start Templates</h2>
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
                      <button className="dashboard__template-btn" onClick={() => { setSelectedDestination('url'); setActiveTab('create'); }}>Use Template</button>
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
                      <button className="dashboard__template-btn" onClick={() => { setSelectedDestination('vcard'); setActiveTab('create'); }}>Use Template</button>
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
                      <button className="dashboard__template-btn" onClick={() => { setSelectedDestination('wifi'); setActiveTab('create'); }}>Use Template</button>
                    </div>
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

