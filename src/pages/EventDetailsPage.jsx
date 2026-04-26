import { useParams, useNavigate } from "react-router-dom";
import { eventsData } from "../utils/eventsData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, Ticket } from "lucide-react";

function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const event = eventsData.find((e) => e.id === Number(id));

  if (!event) {
    return (
      <div className="p-10 text-center text-slate-500">
        Event not found
      </div>
    );
  }

  const isFull = event.registered >= event.capacity;

  const capacityPercent = Math.round(
    (event.registered / event.capacity) * 100
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-fade-in-up">

      {/* Back Button */}
      <button
        onClick={() => navigate("/events")}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

        {/* LEFT SIDE */}
        <div className="space-y-6">

          {/* HERO */}
          <div className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 text-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <p className="text-slate-200 mt-2">
              Join this event and level up your skills
            </p>
          </div>

          {/* METADATA */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-slate-500">Venue</p>
                  <p className="font-medium">{event.venue}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="font-medium">{event.date}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Ticket className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-slate-500">Price</p>
                  <p className="font-medium">
                    {event.price === 0 ? "Free" : `$${event.price}`}
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* DESCRIPTION */}
          <Card>
            <CardContent className="p-6 space-y-2">
              <h2 className="font-semibold text-lg">About this event</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                This event is designed to help developers improve practical skills,
                connect with other engineers, and gain real-world experience through
                workshops, talks, and networking sessions.
              </p>
            </CardContent>
          </Card>

          {/* CAPACITY BAR */}
          <Card>
            <CardContent className="p-6 space-y-3">

              <div className="flex justify-between text-sm text-slate-600">
                <span>
                  Registered {event.registered} / {event.capacity}
                </span>

                <span className="font-medium text-slate-800">
                  {capacityPercent}% filled
                </span>
              </div>

              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>

              <p className="text-xs text-slate-500">
                {event.capacity - event.registered} seats remaining
              </p>

            </CardContent>
          </Card>

        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-4 lg:sticky lg:top-10 h-fit">

          <Card>
            <CardContent className="p-5 space-y-4">

              <div>
                <p className="text-sm text-slate-500">Price</p>
                <p className="text-2xl font-bold">
                  {event.price === 0 ? "Free" : `$${event.price}`}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-500">Availability</p>
                <p className="font-medium">
                  {event.capacity - event.registered} seats left
                </p>
              </div>

              {/* 🔴 FIXED BUTTON */}
              <Button
                className="w-full"
                disabled={isFull}
                onClick={() => {
                  if (isFull) return;
                  navigate("/register");
                }}
              >
                {isFull ? "Registration Closed" : "Register Now"}
              </Button>

              {isFull && (
                <p className="text-xs text-red-500 text-center">
                  This event is fully booked
                </p>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/events")}
              >
                Back to Events
              </Button>

            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}

export default EventDetailsPage;