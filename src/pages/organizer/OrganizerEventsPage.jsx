import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { eventsApi } from '@/utils/api/eventsApi';
import { categoryApi } from '@/utils/api/categoryApi';
import { registrationApi } from '@/utils/api/registrationApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Edit2,
  ExternalLink,
  Loader2, 
  Calendar as CalendarIcon,
  MapPin,
  BarChart2
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema } from "@/lib/schemas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function OrganizerEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [regCounts, setRegCounts] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      price: 0,
      maxAttendance: 100,
      eventStatus: "SCHEDULED",
      paymentRequired: false,
      categoryId: undefined
    }
  });

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [allEvents, categoriesData] = await Promise.all([
        eventsApi.getEvents(),
        categoryApi.getCategories()
      ]);
      
      const myEvents = allEvents.filter(e => Number(e.organizerId) === Number(user.id));
      setEvents(myEvents);
      setCategories(categoriesData);

      const counts = {};
      await Promise.all(myEvents.map(async (e) => {
        try {
          counts[e.id] = await registrationApi.getEventRegistrationCount(e.id);
        } catch (err) {
          counts[e.id] = 0;
        }
      }));
      setRegCounts(counts);
    } catch (error) {
      toast.error("Failed to load your events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleOpenDialog = (event = null) => {
    setCurrentEvent(event);
    if (event) {
      form.reset({
        title: event.title,
        description: event.description || "",
        date: event.date,
        location: event.location,
        price: event.price || 0,
        maxAttendance: event.maxAttendance,
        eventStatus: event.eventStatus,
        paymentRequired: event.paymentRequired,
        categoryId: String(event.categoryId)
      });
    } else {
      form.reset({
        title: "",
        description: "",
        date: "",
        location: "",
        price: 0,
        maxAttendance: 100,
        eventStatus: "SCHEDULED",
        paymentRequired: false,
        categoryId: ""
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const payload = {
      ...data,
      organizerId: user?.id ? Number(user.id) : undefined,
      categoryId: Number(data.categoryId),
      price: data.paymentRequired ? Number(data.price) : 0
    };

    if (!payload.organizerId) {
      toast.error("Could not determine organizer identity. Please re-login.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (currentEvent) {
        await eventsApi.updateEvent(currentEvent.id, payload);
        toast.success("Event updated successfully");
      } else {
        await eventsApi.createEvent(payload);
        toast.success("Event published successfully");
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Operation failed. Ensure all fields are correct.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(e => 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">My Event Factory</h1>
          <p className="text-slate-500 font-medium text-sm">Create and control the events you organize.</p>
        </div>
        <Button className="font-bold gap-2 px-6 shadow-xl shadow-primary/20 h-12 rounded-xl" onClick={() => handleOpenDialog()}>
          <Plus className="w-5 h-5" /> Launch New Event
        </Button>
      </div>

      <Card className="rounded-3xl border-2 shadow-none overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b py-6 px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <Input
               placeholder="Filter your events..."
               className="pl-10 h-11 border-2 focus-visible:ring-primary rounded-xl"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <Badge variant="outline" className="font-black text-[10px] tracking-widest text-slate-400 border-2">
              {events.length} OWNED EVENTS
           </Badge>
        </CardHeader>
        <CardContent className="p-0">
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead>
                 <tr className="bg-slate-50/20 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                   <th className="text-left py-4 px-8">Identity</th>
                   <th className="text-left py-4 px-6">Date / Venue</th>
                   <th className="text-left py-4 px-6">Registrations</th>
                   <th className="text-left py-4 px-6">Entry</th>
                   <th className="text-right py-4 px-8">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {loading ? (
                    <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
                 ) : filteredEvents.length === 0 ? (
                    <tr><td colSpan="5" className="py-20 text-center text-slate-500 font-medium italic">No events created by you yet.</td></tr>
                 ) : filteredEvents.map((event) => (
                   <tr key={event.id} className="hover:bg-slate-50 transition-colors group">
                     <td className="py-5 px-8">
                       <div className="flex flex-col">
                         <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{event.title}</span>
                         <span className="text-xs text-slate-400 font-medium uppercase tracking-tighter">{event.categoryName || 'General'}</span>
                       </div>
                     </td>
                     <td className="py-5 px-6">
                       <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                             <CalendarIcon className="w-3 h-3 text-primary" /> {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">{event.location}</div>
                       </div>
                     </td>
                     <td className="py-5 px-6">
                       <div className="flex flex-col gap-1.5 w-32">
                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                             <span>{regCounts[event.id] || 0} / {event.maxAttendance}</span>
                             <BarChart2 className="w-3 h-3" />
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-primary rounded-full" 
                               style={{ width: `${Math.min(100, ((regCounts[event.id] || 0) / event.maxAttendance) * 100)}%` }}
                             />
                          </div>
                       </div>
                     </td>
                     <td className="py-5 px-6">
                       <Badge variant={event.paymentRequired ? "default" : "secondary"} className="font-black text-[10px]">
                          {event.paymentRequired ? `$${event.price}` : "FREE"}
                       </Badge>
                     </td>
                     <td className="py-5 px-8 text-right">
                       <div className="flex justify-end gap-2">
                         <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-sm" onClick={() => handleOpenDialog(event)}>
                           <Edit2 className="w-4 h-4 text-slate-400" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" asChild>
                           <a href={`/#/events/${event.id}`} target="_blank" rel="noreferrer">
                             <ExternalLink className="w-4 h-4" />
                           </a>
                         </Button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic">{currentEvent ? "Modify Masterpiece" : "Publish Masterpiece"}</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">Provide the details for your event below.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Event Title</FormLabel>
                      <FormControl><Input placeholder="Workshop: Design Systems" className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Time</FormLabel>
                      <FormControl><Input type="datetime-local" className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Venue / Link</FormLabel>
                      <FormControl><Input placeholder="Google Meet / NYC Studio" className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxAttendance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Capacity</FormLabel>
                      <FormControl><Input type="number" className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Industry Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-2 rounded-xl font-bold">
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(c => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Description</FormLabel>
                    <FormControl><Textarea placeholder="What should attendees expect?" className="border-2 rounded-xl min-h-[120px]" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border-2 border-dashed">
                 <FormField
                    control={form.control}
                    name="paymentRequired"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg p-3">
                        <div className="space-y-0.5">
                          <FormLabel className="font-bold text-slate-900">Ticketing</FormLabel>
                          <div className="text-[10px] text-slate-500 font-medium italic">Make this a paid entry event</div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {form.watch("paymentRequired") && (
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-tighter">Ticket Price ($)</FormLabel>
                          <FormControl><Input type="number" className="h-10 border-2 rounded-lg font-bold" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" className="font-bold" onClick={() => setIsDialogOpen(false)}>Save Draft</Button>
                <Button type="submit" className="px-10 font-bold shadow-xl shadow-primary/20 h-12 rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : currentEvent ? "Update Event" : "Launch Event"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
