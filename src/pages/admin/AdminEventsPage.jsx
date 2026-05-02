import React, { useState, useEffect, useMemo } from 'react';
import { eventsApi } from '@/utils/api/eventsApi';
import { organizerApi } from '@/utils/api/organizerApi';
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
  Trash2, 
  ExternalLink, 
  Loader2, 
  Filter,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  AlertCircle
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
import { Switch } from "@/components/ui/switch";

export default function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [regCounts, setRegCounts] = useState({});
  const [categories, setCategories] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpenState] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

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
      organizerId: undefined,
      categoryId: undefined
    }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, categoriesRes, organizersRes] = await Promise.allSettled([
        eventsApi.getEvents(),
        categoryApi.getCategories(),
        organizerApi.getOrganizers()
      ]);

      const eventsData = eventsRes.status === "fulfilled" ? eventsRes.value : [];
      setEvents(eventsData);
      setCategories(categoriesRes.status === "fulfilled" ? categoriesRes.value : []);
      setOrganizers(organizersRes.status === "fulfilled" ? organizersRes.value : []);

      const counts = {};
      await Promise.all(eventsData.map(async (e) => {
        try {
          counts[e.id] = await registrationApi.getEventRegistrationCount(e.id);
        } catch (err) {
          counts[e.id] = 0;
        }
      }));
      setRegCounts(counts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
        organizerId: String(event.organizerId),
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
        organizerId: "",
        categoryId: ""
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const payload = {
      ...data,
      organizerId: Number(data.organizerId),
      categoryId: Number(data.categoryId),
      price: data.paymentRequired ? Number(data.price) : 0
    };

    try {
      if (currentEvent) {
        await eventsApi.updateEvent(currentEvent.id, payload);
        toast.success("Event updated successfully");
      } else {
        await eventsApi.createEvent(payload);
        toast.success("Event created successfully");
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Operation failed. Please check your data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (event) => {
    setEventToDelete(event);
    setIsDeleteDialogOpenState(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    try {
      await eventsApi.deleteEvent(eventToDelete.id);
      toast.success("Event removed forever");
      setIsDeleteDialogOpenState(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete event");
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Events Management</h1>
          <p className="text-slate-500 font-medium">Control all platform events and their registrations.</p>
        </div>
        <Badge variant="outline" className="font-bold text-xs tracking-widest text-slate-400 border-2 px-4 py-2">
          ADMIN VIEW
        </Badge>
      </div>

      <Card className="rounded-3xl border-2 shadow-none overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b py-6 px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <Input
               placeholder="Search by title or location..."
               className="pl-10 h-11 border-2 focus-visible:ring-primary rounded-xl"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <Filter className="w-4 h-4" /> 
              Showing {filteredEvents.length} Events
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead>
                 <tr className="bg-slate-50/20 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                   <th className="text-left py-4 px-8">Event Content</th>
                   <th className="text-left py-4 px-6">Logistics</th>
                   <th className="text-left py-4 px-6">Attendance</th>
                   <th className="text-left py-4 px-6">Type</th>
                   <th className="text-right py-4 px-8">Manage</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {loading ? (
                    <tr><td colSpan="5" className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
                 ) : filteredEvents.length === 0 ? (
                    <tr><td colSpan="5" className="py-20 text-center text-slate-500 font-medium">No events matched your search.</td></tr>
                 ) : filteredEvents.map((event) => (
                   <tr key={event.id} className="hover:bg-slate-50 transition-colors group">
                     <td className="py-5 px-8">
                       <div className="flex flex-col">
                         <span className="font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{event.title}</span>
                         <span className="text-xs text-slate-400 font-medium">{event.categoryName || 'Uncategorized'}</span>
                       </div>
                     </td>
                     <td className="py-5 px-6">
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                             <CalendarIcon className="w-3 h-3 text-primary" /> {new Date(event.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium uppercase tracking-tighter">
                             <MapPin className="w-3 h-3" /> {event.location}
                          </div>
                       </div>
                     </td>
                     <td className="py-5 px-6">
                       <div className="flex flex-col gap-1.5 w-32">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                             <span>{regCounts[event.id] || 0} Registered</span>
                             <span>{Math.round(((regCounts[event.id] || 0) / event.maxAttendance) * 100)}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-primary rounded-full transition-all duration-500" 
                               style={{ width: `${Math.min(100, ((regCounts[event.id] || 0) / event.maxAttendance) * 100)}%` }}
                             />
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold">Capacity: {event.maxAttendance}</span>
                       </div>
                     </td>
                     <td className="py-5 px-6">
                       <Badge variant={event.paymentRequired ? "default" : "secondary"} className="font-black text-[10px]">
                          {event.paymentRequired ? `$${event.price}` : "FREE"}
                       </Badge>
                     </td>
                     <td className="py-5 px-8 text-right">
                       <div className="flex justify-end gap-2">
                         <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-sm" onClick={() => handleOpenDialog(event)}>
                           <Edit2 className="w-4 h-4" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => confirmDelete(event)}>
                           <Trash2 className="w-4 h-4" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg" asChild>
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
            <DialogTitle className="text-2xl font-black">{currentEvent ? "Modify Event" : "Launch New Event"}</DialogTitle>
            <DialogDescription className="font-medium">Fill in the details below to publish or update an event on the platform.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Title</FormLabel>
                      <FormControl><Input placeholder="Event Name" className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Date & Time</FormLabel>
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
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Location</FormLabel>
                      <FormControl><Input placeholder="Venue or Virtual link" className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxAttendance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Capacity</FormLabel>
                      <FormControl><Input type="number" className="h-12 border-2 rounded-xl font-bold" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Category</FormLabel>
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
                <FormField
                  control={form.control}
                  name="organizerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Organizer</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 border-2 rounded-xl font-bold">
                            <SelectValue placeholder="Assign Organizer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organizers.map(o => (
                            <SelectItem key={o.id} value={String(o.id)}>{o.username}</SelectItem>
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
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</FormLabel>
                    <FormControl><Textarea placeholder="Full event description..." className="border-2 rounded-xl min-h-[120px]" {...field} /></FormControl>
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
                          <FormLabel className="font-bold text-slate-900">Paid Entry</FormLabel>
                          <div className="text-[10px] text-slate-500 font-medium">Ticketing enabled for this event</div>
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
                <Button type="button" variant="ghost" className="font-bold" onClick={() => setIsDialogOpen(false)}>Discard</Button>
                <Button type="submit" className="px-10 font-bold shadow-lg shadow-primary/20 h-12 rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : currentEvent ? "Update Platform" : "Publish Event"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpenState}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black flex items-center gap-2 text-red-600">
               <AlertCircle className="w-6 h-6" /> Destructive Action
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-600 pt-2">
              Are you absolutely sure you want to delete <strong>{eventToDelete?.title}</strong>? This will purge all associated registrations and payment records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="font-bold border-2 rounded-xl">Keep Event</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 font-bold rounded-xl px-8 h-11">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
