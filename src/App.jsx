import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import BrandQRLanding from './components/BrandQRLanding'
import QRGenerator from './components/QRGenerator'
import PlatformLanding from './components/PlatformLanding'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<BrandQRLanding />} />
            <Route path="/generator" element={<QRGenerator />} />
            <Route path="/qr/:slug" element={<PlatformLanding />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
