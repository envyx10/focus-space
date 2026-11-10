import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/tokens.css'
import '~/styles/base.css'
import '~/styles/controls.css'
import '~/styles/atmosphere.css'
import '~/styles/chrome.css'
import '~/styles/hero.css'
import '~/styles/room.css'
import '~/styles/radio.css'
import '~/styles/walk.css'
import '~/styles/rhythm.css'
import '~/styles/breathe.css'
import '~/styles/faq.css'
import '~/styles/details.css'
import '~/styles/enter.css'
import '~/styles/responsive.css'
import '~/styles/types.css'
import App from '~/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
