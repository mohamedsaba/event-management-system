import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useEventContext } from "@/context/EventContext"
import { useAuth } from "@/hooks/useAuth"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, ShieldCheck, CreditCard, AlertCircle, ArrowLeft, Ticket } from "lucide-react"
import { paymentApi } from "@/utils/api/paymentApi"
import { PAYMENT_RETURN_EVENT_ID_KEY } from "@/constants/payment"

export default function PaymentPage() {
  const { selectedEvent } = useEventContext()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [iframeUrl, setIframeUrl] = useState(null)
  const [error, setError] = useState(null)
  const paymentStarted = useRef(false)

  useEffect(() => {
    if (!selectedEvent) {
      navigate("/events")
      return
    }

    if (paymentStarted.current) return;
    paymentStarted.current = true;

    const startPayment = async () => {
      setIsProcessing(true)
      try {
        sessionStorage.setItem(PAYMENT_RETURN_EVENT_ID_KEY, String(selectedEvent.id))
        const amountCents = Math.round((selectedEvent.price || 0) * 100);
        const url = await paymentApi.initiatePayment(amountCents, user.id, selectedEvent.id);
        if (!url) {
          throw new Error("Missing iframe URL from payment initialization response");
        }
        setIframeUrl(url);
      } catch (err) {
        console.error("Payment init error:", err);
        setError("Failed to initialize payment gateway. Please try again.");
        toast.error("Payment initialization failed");
      } finally {
        setIsProcessing(false)
      }
    }

    startPayment()
  }, [selectedEvent, navigate])

  if (!selectedEvent) return null

  const total = selectedEvent.price || 0;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in">
      
      <button
        onClick={() => navigate(`/events/${selectedEvent.id}`)}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary mb-8 transition-colors group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Cancel & Go Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT SIDE: Payment Terminal */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <Card className="border-2 shadow-xl overflow-hidden rounded-2xl">
            <CardHeader className="border-b bg-slate-50/50 px-6 py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <CreditCard className="w-6 h-6 text-primary" />
                  Secure Checkout
                </CardTitle>
                <div className="flex items-center gap-2 bg-white border px-3 py-1 rounded-full shadow-sm">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Gateway</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="min-h-[600px] flex flex-col items-center justify-center bg-slate-50/30 relative">
                
                {isProcessing && !error && (
                  <div className="text-center space-y-6 z-10">
                    <div className="relative">
                       <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                       <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-slate-900">
                        Connecting to Secure Server
                      </p>
                      <p className="text-sm text-slate-500">Please do not close or refresh this page.</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-center space-y-6 p-12 z-10 animate-fade-in">
                    <div className="bg-red-50 text-red-500 p-4 rounded-full inline-block">
                       <AlertCircle className="w-12 h-12 mx-auto" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xl font-bold text-slate-900">{error}</p>
                      <p className="text-slate-500">There was an issue communicating with the payment processor.</p>
                    </div>
                    <Button 
                      size="lg" 
                      onClick={() => window.location.reload()}
                      className="px-8 font-bold"
                    >
                      Try Again
                    </Button>
                  </div>
                )}

                {iframeUrl && !isProcessing && !error && (
                  <iframe
                    src={iframeUrl}
                    className="w-full h-[650px] border-0"
                    title="Payment Terminal"
                    allow="payment"
                  />
                )}

                {!iframeUrl && !isProcessing && !error && (
                  <div className="flex flex-col items-center gap-4">
                     <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin" />
                     <p className="text-slate-400 font-medium">Waiting for gateway response...</p>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="border-t bg-slate-50/50 py-5 flex flex-col sm:flex-row justify-between gap-4 px-8">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                PCI-DSS Certified Connection
              </div>
              <div className="flex gap-4">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" alt="Visa" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" alt="Mastercard" />
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* RIGHT SIDE: Summary */}
        <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
          <Card className="rounded-2xl border-2">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Registration Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                 <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                    <Ticket className="w-8 h-8 text-slate-400" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Event Title</p>
                    <p className="text-sm font-bold text-slate-900 leading-tight line-clamp-2">{selectedEvent.title}</p>
                 </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Admission Ticket</span>
                  <span className="font-bold text-slate-900">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Quantity</span>
                  <span className="font-bold text-slate-900">1</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-end">
                <div className="space-y-0.5">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Payable</p>
                   <p className="text-2xl font-black text-slate-900">${total.toFixed(2)}</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-none shadow-none text-[10px] mb-1 px-3">USD</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center text-center gap-3">
             <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-slate-400" />
             </div>
             <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Payments are processed via Paymob. If you experience any issues, please contact our support team.
             </p>
          </div>
        </div>

      </div>
    </div>
  )
}