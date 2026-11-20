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

// The top of the page is the home itself: "#top" links scroll up without leaving "#top" in the address bar.
const home = () => history.replaceState(null, '', location.pathname + location.search)
if (location.hash === '#top') home()
document.addEventListener('click', (e) => {
  const link = (e.target as Element).closest?.('a[href="#top"]')
  if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  e.preventDefault()
  home()
  scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
