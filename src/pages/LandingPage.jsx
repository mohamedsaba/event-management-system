import Navbar from "../components/Navbar"
import HeroSection from "../components/Landing/HeroSection"
import FeaturedEvents from "../components/Event/FeaturedEvents"
import HowItWorks from "../components/Landing/HowItWorks"
import CTASection from "../components/Landing/CTASection"
import Footer from "../components/Landing/Footer"

function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 animate-fade-in-up">

      <Navbar />

      <HeroSection />

      <FeaturedEvents />

      <HowItWorks />

      <CTASection />

      <Footer />

    </div>
  )
}

export default LandingPage