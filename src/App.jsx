import Nav     from './components/Nav'
import Hero    from './components/Hero'
import About   from './components/About'
import Gallery from './components/Gallery'
import Events  from './components/Events'
import Cta     from './components/Cta'

export default function App() {
  return (
    <div className="bg-offblack text-white overflow-x-hidden">
      <Nav />
      <Hero />
      <About />
      <Gallery />
      <Events />
      <Cta />
    </div>
  )
}
