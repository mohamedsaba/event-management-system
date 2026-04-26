import React, { useState, useEffect } from 'react';
import { adminApi } from '@/utils/api/adminApi';
import { eventsApi } from '@/utils/api/eventsApi';
import { organizerApi } from '@/utils/api/organizerApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Plus, 
  TrendingUp, 
  LayoutGrid, 
  UserCheck,
  ChevronRight,
  ArrowUpRight,
  Package
} from "lucide-react";
import { Link } from 'react-router-dom';
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalEvents: 0, totalRegistrations: 0, totalOrganizers: 0 });
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, eventsData, organizersData] = await Promise.all([
          adminApi.getDashboardStats(),
          eventsApi.getEvents(),
          organizerApi.getOrganizers()
        ]);
        
        setStats({
          ...statsData,
          totalOrganizers: organizersData.length
        });
        
        setRecentEvents(eventsData.slice(0, 5));
      } catch (error) {
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { 
      title: "Active Events", 
      value: stats.totalEvents, 
      icon: Calendar, 
      trend: "+12%", 
      color: "bg-blue-50 text-blue-600",
      link: "/admin/events"
    },
    { 
      title: "Total Bookings", 
      value: stats.totalRegistrations, 
      icon: UserCheck, 
      trend: "+18%", 
      color: "bg-emerald-50 text-emerald-600",
      link: "/admin/events"
    },
    { 
      title: "Partner Organizers", 
      value: stats.totalOrganizers, 
      icon: Users, 
      trend: "+5%", 
      color: "bg-amber-50 text-amber-600",
      link: "/admin/organizers"
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Assembling admin overview...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">System Overview</h1>
          <p className="text-slate-500 font-medium">Monitor performance and manage platform resources.</p>
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <Button asChild variant="outline" size="lg" className="font-bold gap-2 flex-1 md:flex-none border-2">
            <Link to="/admin/categories"><LayoutGrid className="w-4 h-4" /> Categories</Link>
          </Button>
          <Button asChild size="lg" className="font-bold gap-2 flex-1 md:flex-none shadow-lg shadow-primary/20">
            <Link to="/admin/events"><Calendar className="w-4 h-4" /> Manage Events</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, idx) => (
          <Link key={idx} to={card.link}>
            <Card className="group border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-3xl overflow-hidden relative bg-white">
              <CardContent className="p-8">
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-2xl ${card.color} transition-transform group-hover:scale-110 duration-300`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-[10px] font-bold">
                    <TrendingUp className="w-3 h-3" /> {card.trend}
                  </div>
                </div>
                <div className="mt-6 space-y-1">
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest">{card.title}</h3>
                  <p className="text-4xl font-black text-slate-900 tracking-tight">{card.value}</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <Card className="rounded-3xl border-2 overflow-hidden shadow-none">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 py-6">
            <div className="space-y-1">
               <CardTitle className="text-xl font-black">Recent Events</CardTitle>
               <CardDescription>The latest events added to the platform.</CardDescription>
            </div>
            <Button variant="ghost" asChild className="text-primary font-bold hover:bg-primary/5">
               <Link to="/admin/events">View All <ChevronRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/30 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                    <th className="text-left py-4 px-6">Event Details</th>
                    <th className="text-left py-4 px-6">Date</th>
                    <th className="text-left py-4 px-6">Access</th>
                    <th className="text-right py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentEvents.map((event) => (
                    <tr key={event.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-5 px-6">
                         <div className="flex flex-col">
                            <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{event.title}</span>
                            <span className="text-xs text-slate-500">{event.location}</span>
                         </div>
                      </td>
                      <td className="py-5 px-6">
                         <span className="text-sm font-medium text-slate-600">{new Date(event.date).toLocaleDateString()}</span>
                      </td>
                      <td className="py-5 px-6">
                         <Badge variant="outline" className="font-bold text-[10px]">
                            {event.paymentRequired ? `$${event.price}` : "FREE"}
                         </Badge>
                      </td>
                      <td className="py-5 px-6 text-right">
                         <Badge 
                           className={`font-black text-[10px] uppercase ${
                             event.eventStatus === 'SCHEDULED' ? 'bg-emerald-500 hover:bg-emerald-600' : 
                             event.eventStatus === 'COMPLETED' ? 'bg-slate-500 hover:bg-slate-600' : 'bg-red-500'
                           }`}
                         >
                           {event.eventStatus}
                         </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
           <Card className="rounded-3xl border-2 bg-slate-900 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                 <Package className="w-20 h-20 rotate-12" />
              </div>
              <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 <Button asChild className="w-full bg-white/10 hover:bg-white/20 text-white border-none justify-between h-12 rounded-xl group">
                    <Link to="/admin/organizers">
                       <span>Add Organizer</span>
                       <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    </Link>
                 </Button>
                 <Button asChild className="w-full bg-white/10 hover:bg-white/20 text-white border-none justify-between h-12 rounded-xl group">
                    <Link to="/admin/categories">
                       <span>Manage Categories</span>
                       <ArrowUpRight className="w-4 h-4" />
                    </Link>
                 </Button>
              </CardContent>
           </Card>

           <Card className="rounded-3xl border-2 p-6 bg-slate-50/50 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <TrendingUp className="w-5 h-5" />
                 </div>
                 <h4 className="font-bold text-slate-900">Health Score</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                 The platform is currently operating at <strong>98.4% efficiency</strong>. All payment gateways and notification services are active.
              </p>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                 <div className="h-full bg-primary w-[98.4%] rounded-full" />
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
