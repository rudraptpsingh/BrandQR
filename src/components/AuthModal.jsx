import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './AuthModal.css'

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { signIn, signUp } = useAuth()

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'signin') {
        await signIn(email, password)
        onClose()
      } else {
        await signUp(email, password)
        setSuccess('Account created successfully! You can now sign in.')
        setEmail('')
        setPassword('')
      }
    } catch (err) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setError('')
    setSuccess('')
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="auth-modal__overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <button className="auth-modal__close" onClick={onClose}>
          ×
        </button>

        <h2 className="auth-modal__title">
          {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="auth-modal__subtitle">
          {mode === 'signin'
            ? 'Sign in to access your QR codes'
            : 'Sign up to start creating QR codes'}
        </p>

        <form className="auth-modal__form" onSubmit={handleSubmit}>
          <div className="auth-modal__input-group">
            <label className="auth-modal__label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="auth-modal__input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-modal__input-group">
            <label className="auth-modal__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="auth-modal__input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <p className="auth-modal__error">{error}</p>}
          {success && <p className="auth-modal__success">{success}</p>}

          <button
            type="submit"
            className="auth-modal__submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : mode === 'signin'
              ? 'Sign In'
              : 'Sign Up'}
          </button>
        </form>

        <div className="auth-modal__toggle">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <span className="auth-modal__toggle-link" onClick={toggleMode}>
                Sign up
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span className="auth-modal__toggle-link" onClick={toggleMode}>
                Sign in
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
