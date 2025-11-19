import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import BrandQRLanding from './components/BrandQRLanding'
import PlatformLanding from './components/PlatformLanding'
import GuidesListing from './components/guides/GuidesListing'
import GuideRouter from './components/guides/GuideRouter'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/" element={<BrandQRLanding />} />
            <Route path="/qr/:slug" element={<PlatformLanding />} />
            <Route path="/guides" element={<GuidesListing />} />
            <Route path="/guides/:slug" element={<GuideRouter />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
