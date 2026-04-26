import React, { useState, useEffect, useMemo } from 'react';
import { organizerApi } from '@/utils/api/organizerApi';
import { authApi } from '@/utils/api/authApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Mail,
  User,
  Loader2,
  ShieldCheck,
  Lock,
  Building2,
  Trash2,
  Edit2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { organizerSchema } from "@/lib/schemas";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const updateOrganizerSchema = z.object({
  newName: z.string().min(2, "Name must be at least 2 characters"),
  newEmail: z.string().email("Invalid email address"),
});

export default function AdminOrganizersPage() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentOrganizer, setCurrentOrganizer] = useState(null);
  const [organizerToDelete, setOrganizerToDelete] = useState(null);

  const createForm = useForm({
    resolver: zodResolver(organizerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: ""
    }
  });

  const editForm = useForm({
    resolver: zodResolver(updateOrganizerSchema),
    defaultValues: {
      newName: "",
      newEmail: ""
    }
  });

  const fetchOrganizers = async () => {
    setLoading(true);
    try {
      const data = await organizerApi.getOrganizers();
      setOrganizers(data);
    } catch (error) {
      toast.error("Failed to load organizer directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const onCreateSubmit = async (data) => {
    setIsSubmitting(true);
    const toastId = toast.loading("Creating organizer account...");
    try {
      await authApi.registerOrganizer(data);
      toast.success("Organizer account created successfully", { id: toastId });
      setIsCreateDialogOpen(false);
      createForm.reset();
      fetchOrganizers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create organizer", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (org) => {
    setCurrentOrganizer(org);
    editForm.reset({
      newName: org.username,
      newEmail: org.email,
    });
    setIsEditDialogOpen(true);
  };

  const onEditSubmit = async (data) => {
    if (!currentOrganizer) return;
    setIsSubmitting(true);
    const toastId = toast.loading("Updating organizer...");
    try {
      await organizerApi.updateOrganizer(currentOrganizer.id, data);
      toast.success("Organizer updated successfully", { id: toastId });
      setIsEditDialogOpen(false);
      fetchOrganizers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update organizer", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (org) => {
    setOrganizerToDelete(org);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!organizerToDelete) return;
    const toastId = toast.loading("Deleting organizer...");
    try {
      await organizerApi.deleteOrganizer(organizerToDelete.id);
      toast.success("Organizer removed", { id: toastId });
      setIsDeleteDialogOpen(false);
      fetchOrganizers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete organizer", { id: toastId });
    }
  };

  const filtered = useMemo(() => {
    return organizers.filter(o =>
      o.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [organizers, searchTerm]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Partner Organizers</h1>
          <p className="text-slate-500 font-medium">Manage professional partners who host events on Venuva.</p>
        </div>
        <Button className="font-bold gap-2 px-6 shadow-lg shadow-primary/20 h-12 rounded-xl" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-5 h-5" /> New Organizer
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-6">
          <Card className="rounded-3xl border-2 shadow-none overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b py-6 px-8">
               <div className="relative max-w-md">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                 <Input
                   placeholder="Search by name or email..."
                   className="pl-10 h-11 border-2 focus-visible:ring-primary rounded-xl"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
               </div>
            </CardHeader>
            <CardContent className="p-0">
               <div className="overflow-x-auto">
                 <table className="w-full">
                   <thead>
                     <tr className="bg-slate-50/20 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                       <th className="text-left py-4 px-8">Partner Info</th>
                       <th className="text-left py-4 px-6">ID / Reference</th>
                       <th className="text-left py-4 px-6">Access Level</th>
                       <th className="text-right py-4 px-8">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {loading ? (
                        <tr><td colSpan="4" className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
                     ) : filtered.length === 0 ? (
                        <tr><td colSpan="4" className="py-20 text-center text-slate-500 font-medium">No partners found in the system.</td></tr>
                     ) : filtered.map((org) => (
                       <tr key={org.id} className="hover:bg-slate-50 transition-colors group">
                         <td className="py-5 px-8">
                           <div className="flex items-center gap-3">
                              <div className="bg-primary/10 p-2 rounded-xl text-primary font-black text-xs">
                                 {(org.username || '??').substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                 <span className="font-bold text-slate-900">{org.username}</span>
                                 <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> {org.email}
                                 </span>
                              </div>
                           </div>
                         </td>
                         <td className="py-5 px-6">
                           <code className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">{org.id}</code>
                         </td>
                         <td className="py-5 px-6">
                           <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[10px] uppercase">
                              Verified Organizer
                           </Badge>
                         </td>
                         <td className="py-5 px-8 text-right">
                           <div className="flex justify-end gap-2">
                             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white hover:shadow-sm" onClick={() => handleOpenEdit(org)}>
                               <Edit2 className="w-4 h-4 text-slate-400" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => confirmDelete(org)}>
                               <Trash2 className="w-4 h-4" />
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
        </div>

        <div className="space-y-6">
           <Card className="rounded-3xl border-2 p-8 bg-slate-900 text-white space-y-6 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 opacity-10">
                 <ShieldCheck className="w-40 h-40" />
              </div>
              <div className="space-y-2 relative z-10">
                 <h3 className="text-xl font-black">Security Policy</h3>
                 <p className="text-sm text-slate-400 leading-relaxed">
                    Organizers have full control over their events but cannot access global platform settings or financial records of other partners.
                 </p>
              </div>
              <div className="pt-4 border-t border-white/10 relative z-10">
                 <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>Verified Partners</span>
                    <span className="text-white">{organizers.length}</span>
                 </div>
              </div>
           </Card>

           <Card className="rounded-3xl border-2 p-6 bg-slate-50/50 flex flex-col items-center text-center gap-4 border-dashed">
              <div className="bg-white p-3 rounded-2xl shadow-sm">
                 <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1">
                 <h4 className="font-bold text-slate-900">Partner Program</h4>
                 <p className="text-xs text-slate-500 max-w-[200px]">Interested in more features? Checkout the extended partner API documentation.</p>
              </div>
              <Button variant="link" className="text-xs font-bold p-0 h-auto">Learn More</Button>
           </Card>
        </div>
      </div>

      {/* Create Organizer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Register Partner</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">Create a professional organizer account to host events on the platform.</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-5 pt-4">
              <FormField
                control={createForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Username</FormLabel>
                    <FormControl>
                       <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input placeholder="tech_events_inc" className="pl-10 h-12 border-2 rounded-xl font-bold" {...field} />
                       </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</FormLabel>
                    <FormControl>
                       <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input type="email" placeholder="partner@domain.com" className="pl-10 h-12 border-2 rounded-xl font-bold" {...field} />
                       </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Temporary Password</FormLabel>
                    <FormControl>
                       <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input type="password" placeholder="••••••••" className="pl-10 h-12 border-2 rounded-xl font-bold" {...field} />
                       </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" className="w-full font-bold shadow-lg shadow-primary/20 h-12 rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Organizer"}
                </Button>
                <Button type="button" variant="ghost" className="font-bold text-slate-400" onClick={() => setIsCreateDialogOpen(false)}>Discard</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Organizer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md rounded-3xl border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Edit Organizer</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">Update organizer name and email address.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-5 pt-4">
              <FormField
                control={editForm.control}
                name="newName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Name</FormLabel>
                    <FormControl>
                       <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input placeholder="Organizer name" className="pl-10 h-12 border-2 rounded-xl font-bold" {...field} />
                       </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="newEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</FormLabel>
                    <FormControl>
                       <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input type="email" placeholder="partner@domain.com" className="pl-10 h-12 border-2 rounded-xl font-bold" {...field} />
                       </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 pt-4">
                <Button type="submit" className="w-full font-bold shadow-lg shadow-primary/20 h-12 rounded-xl" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Organizer"}
                </Button>
                <Button type="button" variant="ghost" className="font-bold text-slate-400" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black flex items-center gap-2 text-red-600">
               <AlertCircle className="w-6 h-6" /> Remove Organizer
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-slate-600 pt-2">
              Are you sure you want to delete <strong>{organizerToDelete?.username}</strong>? This will revoke their access and may affect events they manage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6">
            <AlertDialogCancel className="font-bold border-2 rounded-xl">Keep Organizer</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 font-bold rounded-xl px-8 h-11">
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
