import { useState, useContext, useEffect } from "react"
import { AuthContext } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { LogOut, Calendar, CreditCard, User, Download, Printer, Ticket, Trash2, Settings, History, ShieldCheck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRegistrations } from "@/hooks/useRegistrations"
import { registrationApi } from "@/utils/api/registrationApi"
import { useQueryClient } from "@tanstack/react-query"

export default function DashboardPage() {
  const { user, logout } = useContext(AuthContext)
  const { data: myRegistrations, isLoading: registrationsLoading, refetch } = useRegistrations();
  const queryClient = useQueryClient();
  
  const [totalSpent, setTotalSpent] = useState(0);
  const [spendingLoading, setSpendingLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null)
  const [isCancelling, setIsCancelling] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.id) return;
      try {
        const spent = await registrationApi.getUserTotalSpending(user.id);
        setTotalSpent(spent);
      } catch (error) {
        console.error("Failed to fetch spending stats");
      } finally {
        setSpendingLoading(false);
      }
    };
    fetchStats();
  }, [user?.id]);

  const handleCancelRegistration = async (eventId) => {
    if (!window.confirm("Are you sure you want to cancel this registration?")) return;
    
    setIsCancelling(eventId);
    const toastId = toast.loading("Cancelling registration...");
    try {
      await registrationApi.cancelRegistration(user.id, eventId);
      toast.success("Registration cancelled successfully", { id: toastId });
      queryClient.invalidateQueries(['registrations']);
      refetch();
    } catch (error) {
      toast.error("Failed to cancel registration", { id: toastId });
    } finally {
      setIsCancelling(null);
    }
  };

  const handleDownloadTicket = (regId) => {
    toast.success("Ticket download started...");
  };

  if (registrationsLoading || spendingLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500">Loading your personal dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Attendee Dashboard</h1>
          <p className="text-slate-500 font-medium">Welcome back, <span className="text-primary font-bold">{user?.username || user?.email}</span></p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" size="lg" className="gap-2 flex-1 md:flex-none font-bold" onClick={() => toast.info("Profile settings coming soon")}>
             <Settings className="w-4 h-4" /> Profile
          </Button>
          <Button variant="destructive" size="lg" onClick={logout} className="gap-2 flex-1 md:flex-none font-bold shadow-lg shadow-destructive/20">
            <LogOut className="w-4 h-4" /> Log Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        <Card className="border-none bg-primary/5 shadow-none rounded-2xl overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-10">
             <Ticket className="w-24 h-24 rotate-12" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-primary uppercase tracking-widest">Active Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">{myRegistrations?.length || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-none bg-emerald-50 shadow-none rounded-2xl overflow-hidden relative">
          <div className="absolute -right-4 -bottom-4 opacity-10">
             <CreditCard className="w-24 h-24 rotate-12" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Total Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">${totalSpent.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border-none bg-slate-900 shadow-none rounded-2xl overflow-hidden relative">
           <div className="absolute -right-4 -bottom-4 opacity-10">
             <User className="w-24 h-24 rotate-12 text-white" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white capitalize">{user?.role}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="registrations" className="space-y-8">
        <div className="flex justify-between items-center border-b pb-2">
          <TabsList className="bg-transparent h-auto p-0 gap-8">
            <TabsTrigger value="registrations" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-0 font-bold text-sm">
              <Ticket className="w-4 h-4 mr-2" /> My Tickets
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-0 font-bold text-sm">
              <User className="w-4 h-4 mr-2" /> Profile Info
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="registrations" className="space-y-6">
          {myRegistrations?.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
               <div className="bg-white p-4 rounded-full inline-block shadow-sm mb-4">
                  <Calendar className="w-8 h-8 text-slate-300" />
               </div>
               <h3 className="text-lg font-bold text-slate-900">No active tickets</h3>
               <p className="text-slate-500 mb-6 max-w-xs mx-auto">Explore upcoming events and secure your spot today!</p>
               <Button variant="default" className="font-bold" onClick={() => window.location.href = '#/events'}>Browse Events</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myRegistrations?.map((reg) => (
                <Card key={reg.id} className="group overflow-hidden border-2 hover:border-primary/20 transition-all duration-300 rounded-2xl">
                   <div className="flex flex-col md:flex-row">
                      <div className="p-6 flex-1 flex flex-col justify-between">
                         <div className="space-y-2">
                            <div className="flex items-center gap-2">
                               <Badge variant="outline" className="text-[10px] font-bold tracking-tighter uppercase">{reg.categoryName || 'General'}</Badge>
                               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(reg.date).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">{reg.title}</h3>
                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                               <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {reg.location}
                               </div>
                               <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" /> By {reg.organizerName}
                               </div>
                            </div>
                         </div>
                      </div>
                      
                      <div className="bg-slate-50 p-6 flex flex-row md:flex-col justify-between items-center md:items-end border-t md:border-t-0 md:border-l border-slate-100 gap-4 min-w-[200px]">
                         <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Entry Type</p>
                            <p className="font-black text-slate-900">{reg.paymentRequired ? 'Paid Access' : 'Free Pass'}</p>
                         </div>
                         <div className="flex gap-2 w-full md:w-auto">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="font-bold border-2 hover:bg-slate-100"
                              onClick={() => handleDownloadTicket(reg.id)}
                            >
                               <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="font-bold text-slate-400 hover:text-destructive hover:bg-destructive/5"
                              disabled={isCancelling === reg.id}
                              onClick={() => handleCancelRegistration(reg.id)}
                            >
                               <Trash2 className="w-4 h-4" />
                            </Button>
                         </div>
                      </div>
                   </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings">
          <Card className="rounded-3xl border-2">
            <CardHeader><CardTitle className="text-xl font-black">Personal Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Username</Label>
                      <Input defaultValue={user?.username} className="h-12 border-2 focus-visible:ring-primary rounded-xl font-bold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email Address</Label>
                      <Input defaultValue={user?.email} disabled className="h-12 border-2 bg-slate-50 rounded-xl font-bold" />
                    </div>
                    <Button size="lg" className="font-bold rounded-xl px-8" onClick={() => toast.success("Feature coming soon")}>Update Profile</Button>
                 </div>
                 
                 <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center gap-4">
                    <div className="bg-white p-4 rounded-full shadow-sm">
                       <ShieldCheck className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-1">
                       <h4 className="font-bold text-slate-900">Secure Account</h4>
                       <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">Your account is verified and protected by industry-standard encryption.</p>
                    </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const MapPin = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);