import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

function HeroSection() {
  return (
    <section className="py-24">

      <div className="max-w-5xl mx-auto text-center px-6 space-y-6">

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Discover Tech Events Near You
        </h1>

        <p className="text-slate-600 text-lg">
          Browse conferences, workshops, and networking events happening across Egypt.
        </p>

        <div className="flex justify-center gap-4">

          <Button size="lg" asChild>
            <Link to="/events">
              Browse Events
            </Link>
          </Button>

        </div>

      </div>

    </section>
  )
}

export default HeroSection