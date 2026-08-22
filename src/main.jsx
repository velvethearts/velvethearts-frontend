import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Prevent automatic browser install prompts / banners on Android & mobile browsers
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
