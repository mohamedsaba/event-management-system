import { Link } from "react-router-dom";
import RegisterButton from "../RegisterButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Ticket } from "lucide-react";

function EventList({ events }) {
  if (!events || events.length === 0) {
    return (
      <p className="text-slate-500 text-center py-12">
        No events available.
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {events.map((event) => (
        <Card
          key={event.id}
          className="hover:shadow-lg transition-shadow duration-200"
        >
          <CardHeader>
            <CardTitle className="text-xl">
              <Link
                to={`/events/${event.id}`}
                className="hover:text-primary transition-colors"
              >
                {event.title}
              </Link>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">

            <div className="flex flex-wrap gap-6 text-sm text-slate-600">

              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {event.venue}
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {event.date}
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                {event.registered} / {event.capacity}
              </div>

            </div>

            <div className="flex justify-between items-center pt-2">

              <Badge variant="secondary" className="flex items-center gap-1">
                <Ticket className="w-3 h-3" />
                {event.price === 0 ? "Free" : `$${event.price}`}
              </Badge>

              <div className="flex gap-2">

                <Link
                  to={`/events/${event.id}`}
                  className="
                  px-3 py-2
                  text-sm
                  border
                  border-slate-300
                  rounded-lg
                  hover:bg-slate-50
                  transition
                  cursor-pointer
                  "
                >
                  View Details
                </Link>

                <RegisterButton event={event} />

              </div>

            </div>

          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default EventList;