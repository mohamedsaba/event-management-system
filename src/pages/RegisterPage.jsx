import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEventContext } from "@/context/EventContext";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, Check, Ticket, User, Mail, ShieldCheck } from "lucide-react";
import { eventsApi } from "@/utils/api/eventsApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

function RegisterPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setRegistrationData, setSelectedEvent, selectedEvent } = useEventContext();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedEvent) {
      navigate("/events");
      return;
    }

    const fetchEvent = async () => {
      try {
        const data = await eventsApi.getEventById(selectedEvent.id);
        setEvent(data);
      } catch (error) {
        toast.error("Failed to load event data");
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [selectedEvent, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    setRegistrationData({
      username: user.username,
      email: user.email,
    });

    setSelectedEvent(event);
    navigate("/payment");
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-500">Preparing your registration...</p>
    </div>
  );

  if (!selectedEvent || !event) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 animate-fade-in">
      <button
        onClick={() => navigate(`/events/${event.id}`)}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary cursor-pointer transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Event
      </button>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Finalize Registration</h1>
        <p className="text-slate-500">Review your details before proceeding to payment.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
               <CardTitle className="text-lg flex items-center gap-2">
                 <User className="w-5 h-5 text-primary" />
                 Attendee Information
               </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="bg-white p-3 rounded-full shadow-sm">
                   <User className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Username</p>
                  <p className="font-semibold text-slate-900">{user?.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="bg-white p-3 rounded-full shadow-sm">
                   <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                  <p className="font-semibold text-slate-900">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20 border-dashed">
            <CardContent className="p-6 flex gap-4">
              <div className="bg-primary/10 p-3 rounded-xl h-fit">
                 <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-sm">Safe & Secure</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your payment is processed through a secure encrypted channel. Venuva does not store your credit card information.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-2 border-slate-900 shadow-xl">
            <CardHeader className="bg-slate-900 text-white pb-6 pt-6">
               <CardTitle className="text-sm uppercase tracking-widest opacity-70">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                   <p className="text-xs font-bold text-slate-400 uppercase">Event</p>
                   <p className="text-sm font-bold text-slate-900 line-clamp-2">{event.title}</p>
                </div>

                <div className="flex justify-between items-center py-3 border-y border-slate-100">
                   <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600">Standard Entry</span>
                   </div>
                   <span className="text-sm font-bold">x1</span>
                </div>

                <div className="pt-2 flex justify-between items-end">
                   <span className="font-bold text-slate-900">Total</span>
                   <span className="text-2xl font-black text-primary">${event.price.toFixed(2)}</span>
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20">
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;