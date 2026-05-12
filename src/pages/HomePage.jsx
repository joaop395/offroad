import About from '../components/About'
import Cta from '../components/Cta'
import Events from '../components/Events'
import Gallery from '../components/Gallery'
import Hero from '../components/Hero'
import Sponsors from '../components/Sponsors'

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Gallery />
      <Sponsors />
      <Events />
      <Cta />
    </>
  )
}
