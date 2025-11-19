import { useEffect } from 'react'
import './Notification.css'

const Notification = ({ type = 'success', message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'info':
        return 'ℹ'
      default:
        return '✓'
    }
  }

  return (
    <div className={`notification notification--${type}`}>
      <div className="notification__content">
        <span className="notification__icon">{getIcon()}</span>
        <span className="notification__message">{message}</span>
      </div>
      <button className="notification__close" onClick={onClose} aria-label="Close notification">
        ✕
      </button>
    </div>
  )
}

export default Notification
