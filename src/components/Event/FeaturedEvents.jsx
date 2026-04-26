import { eventsData } from "../../utils/eventsData"
import EventList from "./EventList"

function FeaturedEvents() {

  const featured = eventsData.slice(0, 3)

  return (
    <section className="py-20">

      <div className="max-w-6xl mx-auto px-6 space-y-10">

        <div className="text-center">

          <h2 className="text-3xl font-bold tracking-tight">
            Featured Events
          </h2>

          <p className="text-slate-500 mt-2">
            Popular upcoming tech events you shouldn't miss
          </p>

        </div>

        <EventList events={featured} />

      </div>

    </section>
  )
}

export default FeaturedEvents