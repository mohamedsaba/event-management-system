import { useState, useContext } from "react"
import { AuthContext } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { LogOut, Calendar, CreditCard, User, Download, Printer } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useRegistrations } from "@/hooks/useRegistrations"

export default function DashboardPage() {
  const { user, logout, updateUser } = useContext(AuthContext)
  
  const userName = user?.name || "User"
  const email = user?.email || ""

  const { data: myRegistrations, isLoading } = useRegistrations();

  const myPayments = [
    { 
      id: 1, 
      ref: "REF-928371", 
      title: "Tech Summit 2025", 
      date: "Oct 20, 2025", 
      amount: 525, 
      method: "Visa ****4242", 
      status: "Successful" 
    }
  ];

  const [selectedReceipt, setSelectedReceipt] = useState(null)

  const handleSaveProfile = (e) => {
    e.preventDefault()
    const newName = e.target.name.value;
    updateUser({ name: newName });
    toast.success("Profile updated successfully")
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return <div className="p-10 text-center text-muted-foreground">Loading your dashboard...</div>
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Welcome back, {userName}. Manage your events and payments.</p>
        </div>
        <Button variant="destructive" onClick={logout} className="gap-2 w-full md:w-auto">
          <LogOut className="w-4 h-4" /> Log Out
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myRegistrations?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,240.00</div>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
            <User className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className="bg-emerald-500">Verified</Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="registrations" className="space-y-4">
        <TabsList className="w-full sm:w-auto flex-wrap h-auto justify-start gap-1">
          <TabsTrigger value="registrations" className="flex-1 sm:flex-none">Registrations</TabsTrigger>
          <TabsTrigger value="payments" className="flex-1 sm:flex-none">Payment History</TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 sm:flex-none">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations">
          <Card>
            <CardHeader>
              <CardTitle>My Registrations</CardTitle>
              <CardDescription>Upcoming events you are attending.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead className="hidden sm:table-cell">Tickets</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myRegistrations?.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-medium whitespace-nowrap">{reg.title}</TableCell>
                        <TableCell className="hidden md:table-cell">{reg.date}</TableCell>
                        <TableCell className="hidden sm:table-cell">{reg.tickets}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 whitespace-nowrap">
                            {reg.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedReceipt(reg)}>View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Records of all your previous event purchases.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden sm:table-cell">Method</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="text-right">Receipt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-xs whitespace-nowrap">{payment.ref}</TableCell>
                        <TableCell className="font-semibold">${payment.amount.toFixed(2)}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">{payment.method}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary" className="whitespace-nowrap">{payment.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="icon" onClick={() => setSelectedReceipt(payment)}>
                            <Download className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md w-full">
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" defaultValue={userName} className="w-full" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue={email} disabled className="bg-muted w-full" />
                </div>
                <Button type="submit" className="w-full sm:w-auto">Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* The Receipt Modal Component */}
      <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-xl sm:text-2xl font-black tracking-tight text-primary">
              Eventa Receipt
            </DialogTitle>
          </DialogHeader>

          {selectedReceipt && (
            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-center border-b pb-4">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Reference Number</p>
                  <p className="font-mono text-sm sm:text-base font-medium">{selectedReceipt.ref}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">Date</p>
                  <p className="text-sm sm:text-base font-medium">{selectedReceipt.date}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-slate-600">Event</span>
                  <span className="text-sm sm:text-base font-bold text-right ml-4">{selectedReceipt.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base text-slate-600">Status</span>
                  <Badge className="bg-emerald-500 hover:bg-emerald-600">Paid in Full</Badge>
                </div>
              </div>

              <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="text-sm sm:text-base font-semibold text-slate-700">Total Amount</span>
                <span className="text-2xl sm:text-3xl font-black text-primary">${selectedReceipt.amount?.toFixed(2)}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button variant="outline" className="w-full sm:flex-1 gap-2" onClick={handlePrint}>
                  <Printer className="w-4 h-4" /> Print
                </Button>
                <Button className="w-full sm:flex-1" onClick={() => setSelectedReceipt(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}