import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import InstallPrompt from "./pwa/InstallPrompt.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <InstallPrompt appName="One line
    " description="One line block puzzle" iconSrc="/one_line_block_puzzle-80-80.png" />
  </StrictMode>,
)
