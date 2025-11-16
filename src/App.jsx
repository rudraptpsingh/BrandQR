import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import QRGenerator from './components/QRGenerator'
import PlatformLanding from './components/PlatformLanding'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<QRGenerator />} />
          <Route path="/qr/:slug" element={<PlatformLanding />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
