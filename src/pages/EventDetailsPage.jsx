import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, Ticket, User, Tag, Info, CheckCircle2 } from "lucide-react";
import { useEventContext } from "../context/EventContext";
import { useAuth } from "@/hooks/useAuth";
import { eventsApi } from "@/utils/api/eventsApi";
import { registrationApi } from "@/utils/api/registrationApi";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setSelectedEvent } = useEventContext();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [celebratePaidOpen, setCelebratePaidOpen] = useState(false);

  useEffect(() => {
    if (location.state?.paymentSuccess !== true) return;
    navigate(`/events/${id}`, { replace: true, state: null });
    toast.success("Payment confirmed! You are registered for this event.", { duration: 5000 });
    setCelebratePaidOpen(true);
  }, [id, location.state?.paymentSuccess, navigate]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await eventsApi.getEventById(id);
        setEvent(data);
      } catch (error) {
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-500">Loading event details...</p>
    </div>
  );

  if (!event) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="bg-slate-50 inline-flex p-4 rounded-full text-slate-400">
           <Info className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold">Event not found</h2>
        <p className="text-slate-500">The event you are looking for may have been removed or is unavailable.</p>
        <Button onClick={() => navigate("/events")}>Back to Events</Button>
      </div>
    );
  }

  const handleRegister = async () => {
    if (!user) {
      toast.info("Please sign in to register");
      navigate("/auth", { state: { from: { pathname: `/events/${id}` } } });
      return;
    }

    if (!event.paymentRequired) {
      setShowConfirmDialog(true);
      return;
    } else {
      setSelectedEvent(event);
      // Capture the current path as the return path after payment
      setReturnPath(location.pathname);
      navigate("/register");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 animate-fade-in">
      <button
        onClick={() => navigate("/events")}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary mb-8 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Events
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                <Tag className="w-3 h-3 mr-1" />
                {event.categoryName || "Event"}
              </Badge>
              <Badge variant="outline">
                {event.eventStatus}
              </Badge>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-slate-600">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-slate-400" />
                <span>By <span className="font-semibold text-slate-900">{event.organizerName || "Organizer"}</span></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-50/50 border-none shadow-none">
              <CardContent className="p-5 flex flex-col gap-2">
                <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</p>
                  <p className="font-bold text-slate-900">{event.location}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-50/50 border-none shadow-none">
              <CardContent className="p-5 flex flex-col gap-2">
                <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date & Time</p>
                  <p className="font-bold text-slate-900">{new Date(event.date).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-50/50 border-none shadow-none">
              <CardContent className="p-5 flex flex-col gap-2">
                <div className="bg-white w-10 h-10 rounded-lg flex items-center justify-center shadow-sm">
                  <Ticket className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance</p>
                  <p className="font-bold text-slate-900">Up to {event.maxAttendance} guests</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-900">Description</h2>
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {event.description || "No description provided for this event."}
              </p>
            </div>
          </div>
        </div>

        {(!user || user.role === 'attendee') && (
        <div className="space-y-6">
          <Card className="sticky top-24 border-2">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Registration Price</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">
                    {event.paymentRequired ? `$${event.price}` : "Free"}
                  </span>
                  {event.paymentRequired && <span className="text-slate-500 font-medium">USD</span>}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <Button
                  size="lg"
                  className="w-full text-base font-bold h-12 shadow-md shadow-primary/20"
                  disabled={isRegistering || event.eventStatus !== 'SCHEDULED'}
                  onClick={handleRegister}
                >
                  {isRegistering ? "Processing..." : 
                   event.eventStatus !== 'SCHEDULED' ? "Not Available" :
                   "Register Now"}
                </Button>
                
                <p className="text-center text-xs text-slate-500">
                  Secure checkout and instant confirmation.
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                 <div className="bg-white p-2 rounded-lg text-primary shadow-sm">
                    <Info className="w-4 h-4" />
                 </div>
                 <p className="text-[11px] text-slate-500 leading-tight">
                    You can cancel your registration at any time from your dashboard.
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </div>

      <AlertDialog open={celebratePaidOpen} onOpenChange={setCelebratePaidOpen}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              Registration complete
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-600 pt-2 text-base leading-relaxed">
              Your payment was successful.{event?.title ? ` You are registered for "${event.title}".` : ""}{" "}
              You can manage your booking from your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4">
            <AlertDialogAction
              onClick={() => setCelebratePaidOpen(false)}
              className="bg-primary hover:bg-primary/90 font-bold rounded-xl px-8"
            >
              Got it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" /> Confirm Registration
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-600 pt-2">
              You are about to register for <strong>"{event.title}"</strong>. 
              Your registration will be officially recorded under <strong>{user?.username || user?.email}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="font-bold border-2 rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                setIsRegistering(true);
                const toastId = toast.loading("Processing registration...");
                try {
                  await registrationApi.registerForEvent(user.id, event.id);
                  toast.success("Successfully registered!", { id: toastId });
                  navigate("/dashboard");
                } catch (error) {
                  toast.error(error.response?.data?.message || "Registration failed", { id: toastId });
                } finally {
                  setIsRegistering(false);
                }
              }} 
              className="bg-primary hover:bg-primary/90 font-bold rounded-xl px-8 h-11"
            >
              Confirm & Register
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default EventDetailsPage;