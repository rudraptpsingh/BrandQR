import { useState, useEffect, useRef } from 'react'
import './DownloadGateModal.css'

export default function DownloadGateModal({ isOpen, onClose, onProceedDownload, onSignUp }) {
  const [countdown, setCountdown] = useState(5)
  const timerRef = useRef(null)
  const proceedCallbackRef = useRef(onProceedDownload)

  // Update the callback ref when it changes
  useEffect(() => {
    proceedCallbackRef.current = onProceedDownload
  }, [onProceedDownload])

  useEffect(() => {
    if (isOpen) {
      setCountdown(5)
      
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current)
            }
            proceedCallbackRef.current()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onProceedDownload()
    }
  }

  return (
    <div className="download-gate__overlay" onClick={handleOverlayClick}>
      <div className="download-gate">
        <button className="download-gate__close" onClick={onProceedDownload}>
          ×
        </button>

        <div className="download-gate__icons">
          <div className="download-gate__icon download-gate__icon--tracking">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 17C9 17 10 17 12 19C12 19 16.1765 13 20 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C13.3571 3 14.6458 3.30476 15.8005 3.85124" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M22 4L12 14L9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="download-gate__icon download-gate__icon--editing">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <h2 className="download-gate__title">
          Unlock Tracking & Editing for This Code!
        </h2>
        
        <p className="download-gate__description">
          You're downloading a <strong>Basic QR Code</strong> without analytics or editing capabilities. To save this code to your dashboard, track real-time scans, and update the destination link anytime without reprinting, create a free BrandQR account.
        </p>

        <div className="download-gate__benefits">
          <div className="download-gate__benefit">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Track every scan in real-time</span>
          </div>
          <div className="download-gate__benefit">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Edit destination anytime</span>
          </div>
          <div className="download-gate__benefit">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 21V5C19 4.46957 18.7893 3.96086 18.4142 3.58579C18.0391 3.21071 17.5304 3 17 3H7C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V21L12 17.5L19 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Save to your dashboard</span>
          </div>
        </div>

        <div className="download-gate__actions">
          <button
            className="download-gate__button download-gate__button--primary"
            onClick={onSignUp}
          >
            Sign Up & Unlock Smart Features
          </button>
          <button
            className="download-gate__button download-gate__button--secondary"
            onClick={onProceedDownload}
          >
            Continue Download (No Tracking)
            {countdown > 0 && <span className="download-gate__countdown"> · Auto-starting in {countdown}s</span>}
          </button>
        </div>
      </div>
    </div>
  )
}

