import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { supabase } from '../lib/supabase'
import './QRGenerator.css'

const INTENT_OPTIONS = [
  {
    id: 'single',
    title: 'Single link',
    description: 'Point everyone to one destination like your menu or RSVP form.',
    helper: 'Fast, direct, zero maintenance.'
  },
  {
    id: 'multi',
    title: 'Link stack',
    description: 'Share a mini landing page with multiple CTAs or social links.',
    helper: 'Perfect for pop-ups, campaigns, and bios.'
  }
]

const LINK_PRESETS = [
  { id: 'website', icon: '🌐', label: 'Website', helper: 'Menu, store, or homepage', placeholder: 'https://your-site.com' },
  { id: 'instagram', icon: '📸', label: 'Instagram', helper: 'Profile link', placeholder: 'https://instagram.com/username' },
  { id: 'rsvp', icon: '📝', label: 'RSVP / Form', helper: 'Google Form, Typeform, etc.', placeholder: 'https://forms.gle/xyz' },
  { id: 'whatsapp', icon: '💬', label: 'WhatsApp', helper: 'Direct chat link', placeholder: 'https://wa.me/123456789' }
]

const MAX_LINKS = 5
const initialScanStats = { weekCount: null, total: null, topLink: null }

const useSupabaseSession = () => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session)
        setLoading(false)
      }
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
    })
    return () => {
      isMounted = false
      subscription?.subscription.unsubscribe()
    }
  }, [])

  return { session, loading }
}

const createRowId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 10)
}

const createLinkRow = (presetId = null) => {
  const preset = LINK_PRESETS.find((item) => item.id === presetId)
  return {
    id: createRowId(),
    label: preset?.label || '',
    url: '',
    preset: preset?.id || null,
    helper: preset?.helper || '',
    placeholder: preset?.placeholder || 'https://example.com'
  }
}

const normalizeUrl = (value) => {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  const hydrated = trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(hydrated)
    return url.toString()
  } catch (err) {
    return ''
  }
}

const inferLabelFromUrl = (value) => {
  const normalized = normalizeUrl(value)
  if (!normalized) return ''
  try {
    const url = new URL(normalized)
    const hostname = url.hostname.replace(/^www\./, '')
    const segment = hostname.split('.')[0]
    if (!segment) return hostname
    return segment.charAt(0).toUpperCase() + segment.slice(1)
  } catch (err) {
    return ''
  }
}

const formatTimestamp = (value) => {
  if (!value) return 'Not published yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not published yet'
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const QRGenerator = () => {
  const { session, loading: authLoading } = useSupabaseSession()
  const isAuthenticated = Boolean(session?.user)
  const userId = session?.user?.id || null
  const appOrigin = typeof window !== 'undefined' ? window.location.origin : ''
  const [qrType, setQrType] = useState('single')
  const [singleFriendlyName, setSingleFriendlyName] = useState('')
  const [singleUrl, setSingleUrl] = useState('')
  const [stackTitle, setStackTitle] = useState('')
  const [links, setLinks] = useState(() => [createLinkRow('website')])
  const [qrCodeDataURL, setQrCodeDataURL] = useState('')
  const [landingPageUrl, setLandingPageUrl] = useState('')
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [status] = useState('Active')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [generatedType, setGeneratedType] = useState(null)
  const [qrRecord, setQrRecord] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [scanStats, setScanStats] = useState(initialScanStats)
  const [linkHealthStatus, setLinkHealthStatus] = useState('Not checked')
  const [linkHealthMessage, setLinkHealthMessage] = useState('Generate a QR to run a quick check.')
  const [emailInput, setEmailInput] = useState('')
  const [emailStatus, setEmailStatus] = useState(null)
  const [myQRCodes, setMyQRCodes] = useState([])
  const [myCodesLoading, setMyCodesLoading] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)

  const isBusy = isGenerating || previewLoading

  const generateSlug = () => {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
  }

  const handleIntentChange = (intentId) => {
    if (intentId === 'multi' && !isAuthenticated) {
      setShowAuthPrompt(true)
      setError('Sign in to create and manage link stacks.')
      return
    }
    setQrType(intentId)
    setError('')
  }

  const handleLinkChange = (id, field, value) => {
    setLinks((prev) =>
      prev.map((link) => {
        if (link.id !== id) return link
        const nextValue = field === 'url' ? value : value
        const nextLink = { ...link, [field]: nextValue }
        if (field === 'url' && !link.label.trim()) {
          const inferred = inferLabelFromUrl(value)
          if (inferred) {
            nextLink.label = inferred
          }
        }
        return nextLink
      })
    )
  }

  const loadMyQRCodes = async (uid) => {
    if (!uid) return
    setMyCodesLoading(true)
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('id, title, slug, created_at, updated_at, qr_type')
        .eq('user_id', uid)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setMyQRCodes(data || [])
    } catch (err) {
      console.error('Failed to load saved QR codes', err)
    } finally {
      setMyCodesLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      loadMyQRCodes(userId)
    } else {
      setMyQRCodes([])
      if (qrType === 'multi') {
        setQrType('single')
      }
    }
  }, [userId])

  useEffect(() => {
    if (isAuthenticated) {
      setShowAuthPrompt(false)
      setEmailStatus(null)
    }
  }, [isAuthenticated])

  const handleGoogleSignIn = async () => {
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      })
    } catch (err) {
      console.error('Google sign-in failed', err)
    }
  }

  const handleEmailLogin = async (event) => {
    event.preventDefault()
    if (!emailInput.trim()) {
      setEmailStatus({ state: 'error', message: 'Enter an email address.' })
      return
    }
    setEmailStatus({ state: 'loading', message: 'Sending magic link…' })
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : undefined
    const { error } = await supabase.auth.signInWithOtp({
      email: emailInput.trim(),
      options: {
        emailRedirectTo: redirectTo
      }
    })
    if (error) {
      setEmailStatus({ state: 'error', message: error.message })
    } else {
      setEmailStatus({ state: 'success', message: 'Check your inbox for the sign-in link.' })
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setMyQRCodes([])
    setQrRecord(null)
    setScanStats(initialScanStats)
    setQrCodeDataURL('')
    setLandingPageUrl('')
    setGeneratedType(null)
  }

  const addLinkRow = (presetId = null) => {
    setLinks((prev) => {
      if (prev.length >= MAX_LINKS) return prev
      return [...prev, createLinkRow(presetId)]
    })
  }

  const removeLinkRow = (id) => {
    setLinks((prev) => {
      if (prev.length === 1) return prev
      return prev.filter((link) => link.id !== id)
    })
  }

  const moveLink = (id, direction) => {
    setLinks((prev) => {
      const index = prev.findIndex((link) => link.id === id)
      if (index === -1) return prev
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= prev.length) return prev
      const updated = [...prev]
      const [item] = updated.splice(index, 1)
      updated.splice(nextIndex, 0, item)
      return updated
    })
  }

  const generateQRCode = async () => {
    if (qrType === 'single') {
      if (!singleUrl.trim()) {
        setError('Please enter a link to point your QR code to.')
        return
      }

      const normalizedUrl = normalizeUrl(singleUrl)
      if (!normalizedUrl) {
        setError('Please enter a valid URL (example.com or https://example.com).')
        return
      }

      setError('')
      setIsGenerating(true)

      try {
        setLandingPageUrl(normalizedUrl)

        const dataURL = await QRCode.toDataURL(normalizedUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeDataURL(dataURL)
        setGeneratedType('single')
        setLastUpdated(new Date().toISOString())
        setQrRecord(null)
        setScanStats(initialScanStats)
        setLinkHealthStatus('URL verified')
        setLinkHealthMessage('Format and protocol look good for scanning.')
      } catch (err) {
        setError('Failed to generate the QR code. Please try again.')
        console.error(err)
      } finally {
        setIsGenerating(false)
      }
      return
    }

    if (!isAuthenticated || !userId) {
      setError('Sign in to create and manage link stacks.')
      setShowAuthPrompt(true)
      return
    }

    const cleanedLinks = links
      .map((link) => ({
        ...link,
        label: link.label.trim(),
        url: link.url.trim()
      }))
      .filter((link) => link.url.length > 0)

    if (!cleanedLinks.length) {
      setError('Add at least one link to your stack.')
      return
    }

    const normalizedLinks = []
    for (const link of cleanedLinks) {
      const normalizedUrl = normalizeUrl(link.url)
      if (!normalizedUrl) {
        setError(`"${link.label || link.url}" is not a valid URL.`)
        return
      }
      const resolvedLabel = link.label || inferLabelFromUrl(normalizedUrl) || 'Link'
      normalizedLinks.push({
        ...link,
        normalizedUrl,
        resolvedLabel
      })
    }

    setError('')
    setIsGenerating(true)

    try {
      const slug = generateSlug()
      const { data: qrCodeData, error: qrError } = await supabase
        .from('qr_codes')
        .insert([{ slug, title: stackTitle.trim(), qr_type: 'multi', user_id: userId }])
        .select()
        .single()

      if (qrError) throw qrError

      const platformLinks = normalizedLinks.map((link, index) => ({
        qr_code_id: qrCodeData.id,
        platform_type: link.preset || 'custom',
        platform_value: link.normalizedUrl,
        display_order: index,
        link_label: link.resolvedLabel,
        link_url: link.normalizedUrl
      }))

      const { error: platformError } = await supabase
        .from('platform_links')
        .insert(platformLinks)

      if (platformError) throw platformError

      const landingUrl = `${appOrigin}/qr/${slug}`
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
      setGeneratedType('multi')
      setLastUpdated(new Date().toISOString())
      setQrRecord(qrCodeData)
      setLinkHealthStatus('Link stack saved')
      setLinkHealthMessage('Each link is hosted on your landing page.')
      await refreshAnalytics(qrCodeData.id)
      await loadMyQRCodes(userId)
    } catch (err) {
      setError('Failed to save your link stack. Please try again.')
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

  const resetForm = () => {
    setSingleFriendlyName('')
    setSingleUrl('')
    setStackTitle('')
    setLinks([createLinkRow('website')])
    setQrCodeDataURL('')
    setLandingPageUrl('')
    setError('')
    setGeneratedType(null)
    setLastUpdated(null)
    setQrRecord(null)
    setScanStats(initialScanStats)
    setLinkHealthStatus('Not checked')
    setLinkHealthMessage('Generate a QR to run a quick check.')
  }

  const refreshAnalytics = async (qrCodeId) => {
    if (!qrCodeId) return
    setAnalyticsLoading(true)
    try {
      const { data, error } = await supabase
        .from('qr_scans')
        .select('link_label, scanned_at')
        .eq('qr_code_id', qrCodeId)

      if (error) throw error

      const now = new Date()
      const weekStart = new Date(now)
      weekStart.setHours(0, 0, 0, 0)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())

      const total = data.length
      const weekCount = data.filter((item) => new Date(item.scanned_at) >= weekStart).length

      const linkCounts = data.reduce((acc, item) => {
        const label = item.link_label || 'Landing view'
        acc[label] = (acc[label] || 0) + 1
        return acc
      }, {})

      const topLink = Object.entries(linkCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
      setScanStats({ total, weekCount, topLink })
    } catch (err) {
      console.error('Failed to load scan stats', err)
      setScanStats(initialScanStats)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const handleLoadInsights = async (code) => {
    if (!code) return
    setPreviewLoading(true)
    try {
      const landingUrl = `${appOrigin}/qr/${code.slug}`
      const dataURL = await QRCode.toDataURL(landingUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeDataURL(dataURL)
      setLandingPageUrl(landingUrl)
      setGeneratedType(code.qr_type || 'multi')
      setQrRecord({ id: code.id, slug: code.slug })
      setLastUpdated(code.updated_at || code.created_at)
      setLinkHealthStatus('Link stack saved')
      setLinkHealthMessage('Each link is hosted on your landing page.')
      await refreshAnalytics(code.id)
    } catch (err) {
      console.error('Failed to load insights for QR', err)
    } finally {
      setPreviewLoading(false)
    }
  }

  const hasAnalytics = Boolean(qrRecord)
  const insightCards = [
    {
      id: 'scans',
      label: 'Scans this week',
      value: hasAnalytics ? (analyticsLoading ? 'Loading…' : (scanStats.weekCount ?? 0)) : 'Link stacks only',
      helper: hasAnalytics
        ? analyticsLoading
          ? 'Fetching the latest scan activity.'
          : `People scanned this QR ${scanStats.weekCount ?? 0} time(s) since Sunday.`
        : 'Create a link stack to start capturing scan analytics.'
    },
    {
      id: 'health',
      label: 'Link health',
      value: linkHealthStatus,
      helper: linkHealthMessage
    }
  ]

  if (hasAnalytics) {
    insightCards.push({
      id: 'top-link',
      label: 'Top performer',
      value: analyticsLoading ? 'Loading…' : scanStats.topLink || 'No scans yet',
      helper: analyticsLoading
        ? 'Crunching tap data.'
        : scanStats.topLink
          ? 'Most tapped link so far.'
          : 'We’ll highlight a link once it gets a scan.'
    })
  }

  const presetButtonsDisabled = links.length >= MAX_LINKS

  return (
    <div className="qr-generator">
        <div className="qr-generator__container">
          <header className="qr-generator__header">
            <p className="qr-generator__eyebrow">Free forever • sign in to save link stacks</p>
            <h1 className="qr-generator__title">Create a QR in under a minute</h1>
            <p className="qr-generator__subtitle">Choose a single spotlight link or build a tiny landing page.</p>
          </header>

          <section className="qr-generator__auth-card" aria-label="Account">
            {authLoading ? (
              <p className="qr-generator__muted">Checking your account…</p>
            ) : isAuthenticated ? (
              <div className="qr-generator__auth-signed">
                <div>
                  <span className="qr-generator__auth-label">Signed in as</span>
                  <strong>{session.user.email || session.user.user_metadata?.full_name || 'Account'}</strong>
                </div>
                <button
                  type="button"
                  className="qr-generator__button qr-generator__button--ghost"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="qr-generator__auth-actions">
                <button
                  type="button"
                  className="qr-generator__button qr-generator__button--secondary"
                  onClick={handleGoogleSignIn}
                >
                  Continue with Google
                </button>
                <div className="qr-generator__auth-divider">or</div>
                <form className="qr-generator__auth-form" onSubmit={handleEmailLogin}>
                  <input
                    type="email"
                    className="qr-generator__auth-input"
                    placeholder="you@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                  />
                  <button type="submit" className="qr-generator__button qr-generator__button--primary">
                    Email me a link
                  </button>
                </form>
                {emailStatus && (
                  <p className={`qr-generator__auth-status qr-generator__auth-status--${emailStatus.state}`}>
                    {emailStatus.message}
                  </p>
                )}
              </div>
            )}
          </section>

          <section aria-label="Choose what your QR should do" className="qr-generator__intent">
          <div className="qr-generator__intent-grid">
            {INTENT_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`qr-generator__intent-card ${qrType === option.id ? 'qr-generator__intent-card--active' : ''}`}
                onClick={() => handleIntentChange(option.id)}
                  disabled={isBusy}
              >
                <div className="qr-generator__intent-card-header">
                  <h2>{option.title}</h2>
                  {qrType === option.id && <span className="qr-generator__intent-pill">Selected</span>}
                </div>
                <p>{option.description}</p>
                <small>{option.helper}</small>
              </button>
            ))}
          </div>
        </section>

          {showAuthPrompt && !isAuthenticated && (
            <div className="qr-generator__notice" role="status">
              Sign in above to create and manage link stacks.
            </div>
          )}

        <section className="qr-generator__panel">
          <div className="qr-generator__form-column">
            {qrType === 'single' ? (
              <div className="qr-generator__card">
                <h3>Single link details</h3>
                <div className="qr-generator__field">
                  <label className="qr-generator__label" htmlFor="single-name">
                    Friendly name <span className="qr-generator__optional">optional</span>
                  </label>
                  <input
                    id="single-name"
                    type="text"
                    className="qr-generator__input"
                    placeholder="Menu, RSVP, promo..."
                    value={singleFriendlyName}
                    onChange={(e) => setSingleFriendlyName(e.target.value)}
                    disabled={isBusy}
                  />
                </div>
                <div className="qr-generator__field">
                  <label className="qr-generator__label" htmlFor="single-url">
                    Destination URL
                  </label>
                  <input
                    id="single-url"
                    type="text"
                    className="qr-generator__input"
                    placeholder="example.com or https://example.com"
                    value={singleUrl}
                    onChange={(e) => setSingleUrl(e.target.value)}
                    disabled={isBusy}
                  />
                  <p className="qr-generator__hint">We’ll keep it scan-safe and add HTTPS if you forget.</p>
                </div>
              </div>
            ) : (
              <div className="qr-generator__card">
                <h3>Link stack details</h3>
                <div className="qr-generator__field">
                  <label className="qr-generator__label" htmlFor="stack-title">
                    Card title <span className="qr-generator__optional">optional</span>
                  </label>
                  <input
                    id="stack-title"
                    type="text"
                    className="qr-generator__input"
                    placeholder="Pop-up menu, Launch day, Tour links..."
                    value={stackTitle}
                    onChange={(e) => setStackTitle(e.target.value)}
                    disabled={isBusy}
                  />
                </div>

                <div className="qr-generator__preset-row">
                  <span className="qr-generator__label">Quick add</span>
                  <div className="qr-generator__preset-buttons">
                    {LINK_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          className="qr-generator__preset-button"
                          onClick={() => addLinkRow(preset.id)}
                          disabled={isBusy || presetButtonsDisabled}
                        >
                        <span aria-hidden="true">{preset.icon}</span>
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="qr-generator__link-list">
                  {links.map((link, index) => (
                    <div key={link.id} className="qr-generator__link-row">
                      <div className="qr-generator__link-row-header">
                        <span>Link {index + 1}</span>
                        <div className="qr-generator__link-row-actions">
                          <button
                            type="button"
                            className="qr-generator__icon-button"
                            onClick={() => moveLink(link.id, -1)}
                            disabled={index === 0 || isBusy}
                            aria-label="Move link up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="qr-generator__icon-button"
                            onClick={() => moveLink(link.id, 1)}
                            disabled={index === links.length - 1 || isBusy}
                            aria-label="Move link down"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className="qr-generator__icon-button qr-generator__icon-button--danger"
                            onClick={() => removeLinkRow(link.id)}
                            disabled={links.length === 1 || isBusy}
                            aria-label="Remove link"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="qr-generator__link-grid">
                        <div className="qr-generator__field">
                          <label className="qr-generator__label" htmlFor={`link-label-${link.id}`}>
                            Label
                          </label>
                          <input
                            id={`link-label-${link.id}`}
                            type="text"
                            className="qr-generator__input"
                            placeholder="e.g., Menu, Tickets, Instagram"
                            value={link.label}
                            onChange={(e) => handleLinkChange(link.id, 'label', e.target.value)}
                            disabled={isBusy}
                          />
                        </div>
                        <div className="qr-generator__field">
                          <label className="qr-generator__label" htmlFor={`link-url-${link.id}`}>
                            URL
                          </label>
                          <input
                            id={`link-url-${link.id}`}
                            type="text"
                            className="qr-generator__input"
                            placeholder={link.placeholder}
                            value={link.url}
                            onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                            disabled={isBusy}
                          />
                        </div>
                      </div>
                      {link.helper && <p className="qr-generator__hint">{link.helper}</p>}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="qr-generator__button qr-generator__button--ghost"
                  onClick={() => addLinkRow()}
                  disabled={isBusy || links.length >= MAX_LINKS}
                >
                  + Add another link
                </button>
              </div>
            )}

            {error && (
              <div className="qr-generator__error" role="alert">
                {error}
              </div>
            )}

            <div className="qr-generator__submit">
              <button
                className="qr-generator__button qr-generator__button--primary"
                onClick={generateQRCode}
                disabled={isBusy}
              >
                {isGenerating ? 'Generating...' : 'Create QR code'}
              </button>
            </div>
          </div>

          <div className="qr-generator__preview-column">
            <div className="qr-generator__card qr-generator__card--preview">
              <div className="qr-generator__lifecycle">
                <span className={`qr-generator__status qr-generator__status--${status.toLowerCase()}`}>{status}</span>
                <div className="qr-generator__lifecycle-meta">
                  <div>
                    <p>Last updated</p>
                    <strong>{formatTimestamp(lastUpdated)}</strong>
                  </div>
                  <div>
                    <p>Next scheduled change</p>
                    <strong>Not scheduled</strong>
                  </div>
                </div>
              </div>

              <div className="qr-generator__preview">
                {qrCodeDataURL ? (
                  <>
                    <div className="qr-generator__qr-container">
                      <img src={qrCodeDataURL} alt="Generated QR Code" className="qr-generator__qr-image" />
                    </div>
                    <div className="qr-generator__landing-info">
                      <p className="qr-generator__landing-label">Destination</p>
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
                      >
                        Download PNG
                      </button>
                      <button
                        className="qr-generator__button qr-generator__button--ghost"
                        onClick={resetForm}
                      >
                        Start new
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="qr-generator__preview-placeholder">
                    <p>Fill in the details on the left to preview your QR code.</p>
                    <span>We’ll show link health and insights here once it’s created.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="qr-generator__card">
              <h3>Instant insights</h3>
              <div className="qr-generator__insight-grid">
                {insightCards.map((card) => (
                  <div key={card.id} className="qr-generator__insight-card">
                    <p className="qr-generator__insight-label">{card.label}</p>
                    <strong className="qr-generator__insight-value">{card.value}</strong>
                    <span className="qr-generator__insight-helper">{card.helper}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="qr-generator__card">
              <h3>My link stacks</h3>
              {authLoading ? (
                <p className="qr-generator__muted">Checking your account…</p>
              ) : !isAuthenticated ? (
                <p className="qr-generator__muted">Sign in above to view saved link stacks.</p>
              ) : myCodesLoading ? (
                <p className="qr-generator__muted">Loading your QR codes…</p>
              ) : myQRCodes.length === 0 ? (
                <p className="qr-generator__muted">You haven’t saved any link stacks yet.</p>
              ) : (
                <ul className="qr-generator__list">
                  {myQRCodes.map((code) => (
                    <li key={code.id} className="qr-generator__list-item">
                      <div className="qr-generator__list-info">
                        <strong>{code.title || 'Untitled link stack'}</strong>
                        <span>{formatTimestamp(code.updated_at || code.created_at)}</span>
                      </div>
                      <div className="qr-generator__list-actions">
                        <button
                          type="button"
                          className="qr-generator__button qr-generator__button--ghost"
                          onClick={() => handleLoadInsights(code)}
                          disabled={previewLoading}
                        >
                          {previewLoading ? 'Loading…' : 'View insights'}
                        </button>
                        <a
                          href={`${appOrigin}/qr/${code.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="qr-generator__button qr-generator__button--text"
                        >
                          Open
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default QRGenerator
