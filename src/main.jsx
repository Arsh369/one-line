import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import InstallPrompt from "./pwa/InstallPrompt.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <InstallPrompt appName="Your App" description="..." iconSrc="/pwa-80.png" />
  </StrictMode>,
)
