import { Link } from "react-router-dom"

const CTASection = () => {
  return (
    <section className="py-20 text-center bg-blue-600 text-white">

      <h2 className="text-3xl font-bold mb-6">
        Ready to find your next event?
      </h2>

      <Link
        to="/events"
        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold"
      >
        Explore Events
      </Link>

    </section>
  )
}

export default CTASection