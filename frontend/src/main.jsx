import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ShieldyAssistant from './components/ShieldyAssistant.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <App />
      <ShieldyAssistant />
    </>
  </StrictMode>,
)
