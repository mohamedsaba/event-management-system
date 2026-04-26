import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { eventsApi } from '@/utils/api/eventsApi';
import { registrationApi } from '@/utils/api/registrationApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  Plus, 
  ChevronRight,
  BarChart3,
  Rocket,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { Link } from 'react-router-dom';
import { toast } from "sonner";

export default function OrganizerDashboardPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 0, totalRegistrations: 0, upcomingEvents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const allEvents = await eventsApi.getEvents();
        // Filter events owned by this organizer
        const myEvents = allEvents.filter(e => Number(e.organizerId) === Number(user.id));
        
        // Fetch registration counts for each of my events
        let totalRegs = 0;
        await Promise.all(myEvents.map(async (e) => {
          try {
             const count = await registrationApi.getEventRegistrationCount(e.id);
             totalRegs += count;
          } catch (err) {}
        }));

        setEvents(myEvents);
        setStats({
          totalEvents: myEvents.length,
          totalRegistrations: totalRegs,
          upcomingEvents: myEvents.filter(e => e.eventStatus === 'SCHEDULED').length
        });
      } catch (error) {
        toast.error("Failed to load organizer dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Preparing your workspace...</p>
      </div>
    );
  }

  const statCards = [
    { title: "Hosted Events", value: stats.totalEvents, icon: Calendar, color: "text-blue-600 bg-blue-50" },
    { title: "Total Attendees", value: stats.totalRegistrations, icon: Users, color: "text-emerald-600 bg-emerald-50" },
    { title: "Active Scheduled", value: stats.upcomingEvents, icon: Rocket, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">
            Hi, <span className="text-primary">{user?.username}</span> 👋
          </h1>
          <p className="text-slate-500 font-medium text-sm">Managing your event empire from one place.</p>
        </div>
        <Button asChild size="lg" className="font-bold gap-2 shadow-xl shadow-primary/20 h-12 rounded-xl">
          <Link to="/organizer/events"><Plus className="w-5 h-5" /> Launch New Event</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <Card key={idx} className="border-2 rounded-3xl overflow-hidden transition-all hover:border-primary/20 shadow-none">
            <CardContent className="p-8 flex items-center gap-6">
              <div className={`p-4 rounded-2xl ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{card.title}</span>
                <span className="text-3xl font-black text-slate-900">{card.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        <Card className="rounded-3xl border-2 overflow-hidden shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 py-6 px-8">
            <div className="flex items-center gap-3">
               <div className="bg-primary/10 p-2 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-primary" />
               </div>
               <CardTitle className="text-xl font-black">Your Events</CardTitle>
            </div>
            <Button variant="ghost" asChild className="text-primary font-bold">
               <Link to="/organizer/events">Manage All <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {events.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="w-8 h-8 text-slate-300" />
                 </div>
                 <p className="text-slate-500 font-bold italic">No events found yet. Let's create your first one!</p>
                 <Button asChild variant="outline" className="rounded-xl border-2">
                    <Link to="/organizer/events">Create Event</Link>
                 </Button>
              </div>
            ) : (
              <div className="divide-y">
                {events.slice(0, 5).map((event) => (
                  <Link 
                    key={event.id} 
                    to="/organizer/events"
                    className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{event.title}</span>
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-tighter flex items-center gap-2">
                         <Clock className="w-3 h-3" /> {new Date(event.date).toLocaleDateString()} • {event.location}
                      </span>
                    </div>
                    <Badge className={`font-black text-[10px] uppercase ${
                      event.eventStatus === 'SCHEDULED' ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}>
                      {event.eventStatus}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="rounded-3xl border-2 p-8 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <Rocket className="w-24 h-24 rotate-12" />
              </div>
              <h3 className="text-xl font-black mb-2 relative z-10">Scale Your Reach</h3>
              <p className="text-sm text-slate-400 leading-relaxed relative z-10 mb-6">
                 Professional organizers using Venuva see a <strong>40% increase</strong> in registrations by enabling social sharing features.
              </p>
              <Button className="w-full bg-white text-slate-900 font-black rounded-xl hover:bg-slate-100 h-11 relative z-10">
                 Explore Marketing Toolkit
              </Button>
           </Card>

           <Card className="rounded-3xl border-2 p-6 bg-slate-50 border-dashed space-y-4">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Insights</span>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-600">Profile Completion</span>
                    <span className="text-xs font-black text-primary">85%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[85%] rounded-full" />
                 </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Add a profile picture and bio to increase attendee trust.</p>
           </Card>
        </div>
      </div>
    </div>
  );
}
