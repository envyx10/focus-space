import { useEffect } from 'react'
import Sphere from '~/field/Sphere'
import { ScrollTrigger, setupReveals } from '~/motion/gsap'
import { useScenes } from '~/motion/useScenes'
import Breathe from '~/sections/Breathe'
import Details from '~/sections/Details'
import Faq from '~/sections/Faq'
import Local from '~/sections/Local'
import Rhythm from '~/sections/Rhythm'
import Enter from '~/sections/Enter'
import Features from '~/sections/Features'
import Hero from '~/sections/Hero'
import Chrome from '~/sections/Chrome'
import Atmosphere from '~/ui/Atmosphere'

export default function App() {
  const scene = useScenes()

  useEffect(() => {
    const undo = setupReveals()
    // images and web fonts change the page's height after load: re-measure the scroll-linked animations
    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    addEventListener('load', refresh)
    return () => {
      undo()
      removeEventListener('load', refresh)
    }
  }, [])

  return (
    <>
      <Atmosphere />
      <Sphere />
      <Chrome scene={scene} />
      <main>
        <Hero />
        <Features scene={scene} />
        <Rhythm />
        <Breathe />
        <Details />
        <Faq />
        <Local />
        <Enter />
      </main>
    </>
  )
}
