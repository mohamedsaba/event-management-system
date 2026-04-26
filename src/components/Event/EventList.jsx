import { Link } from "react-router-dom";
import RegisterButton from "../RegisterButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Ticket, User, Tag } from "lucide-react";

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
          className="hover:shadow-lg transition-shadow duration-200 overflow-hidden"
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl">
                <Link
                  to={`/events/${event.id}`}
                  className="hover:text-primary transition-colors"
                >
                  {event.title}
                </Link>
              </CardTitle>
              {event.categoryName && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {event.categoryName}
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                {event.location}
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                {new Date(event.date).toLocaleDateString()}
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                {event.organizerName || "Organizer"}
              </div>

              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4 text-muted-foreground" />
                Max: {event.maxAttendance}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Badge variant={event.paymentRequired ? "default" : "secondary"} className="flex items-center gap-1 px-3 py-1">
                {event.paymentRequired ? `$${event.price}` : "Free"}
              </Badge>

              <div className="flex gap-2">
                <Link
                  to={`/events/${event.id}`}
                  className="
                  px-4 py-2
                  text-sm
                  font-medium
                  border
                  border-slate-200
                  rounded-lg
                  hover:bg-slate-50
                  transition-colors
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