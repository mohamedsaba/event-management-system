import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { BookingContext } from "@/context/BookingContext"
import { useEventContext } from "@/context/EventContext"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2, ShieldCheck, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { usePaymentFlow } from "@/hooks/usePaymentFlow"

export default function PaymentPage() {
  const { selectedEvent } = useEventContext()
  const { setBookingResult } = useContext(BookingContext)
  const navigate = useNavigate()

  if (!selectedEvent) {
    return (
      <div className="p-10 text-center">
        No event selected. Please register first.
      </div>
    )
  }

  const normalizedEvent = {
    ...selectedEvent,
    tickets: selectedEvent.tickets || 1,
    pricePerTicket:
      selectedEvent.pricePerTicket ??
      selectedEvent.price ??
      0,
  }

  const { isProcessing, setIsProcessing } =
    usePaymentFlow(normalizedEvent, setBookingResult)

  const subtotal =
    normalizedEvent.tickets * normalizedEvent.pricePerTicket
  const platformFee = 25
  const total = subtotal + platformFee

  const handlePayment = (isSuccess) => {
    setIsProcessing(true)
    const toastId = toast.loading("Connecting to payment gateway...")

    setTimeout(() => {
      setIsProcessing(false)

      const result = {
        success: isSuccess,
        bookingRef: isSuccess
          ? `REF-${Math.floor(Math.random() * 1000000)}`
          : null,
        amount: total,
        eventTitle: normalizedEvent.title,
        date: new Date().toLocaleDateString(),
        errorMessage: isSuccess
          ? null
          : "Your card was declined. Please try another method.",
      }

      setBookingResult(result)

      if (isSuccess) {
        toast.success("Payment successful!", { id: toastId })
        navigate("/result", { replace: true })
      } else {
        toast.error("Payment failed", {
          id: toastId,
          description: result.errorMessage,
        })
      }
    }, 2000)
  }

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-12 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <Card className="border-2 shadow-lg">

            <CardHeader className="border-b bg-muted/30 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Payment Method
                </CardTitle>
                <Badge variant="outline" className="bg-white">
                  Secure Checkout
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="min-h-[300px] sm:min-h-[400px] flex flex-col items-center justify-center bg-slate-50/50 p-4 sm:p-8">

                {isProcessing ? (
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm font-medium text-slate-600">
                      Verifying transaction...
                    </p>
                  </div>
                ) : (
                  <div className="w-full max-w-sm space-y-6">

                    <div className="text-center space-y-3">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">
                        Secure Payment Terminal
                      </p>

                      <div className="h-40 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-white">
                        <span className="text-xs text-slate-300 italic">
                          Embedded Payment UI
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button onClick={() => handlePayment(true)}>
                        Demo Success
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => handlePayment(false)}
                      >
                        Demo Fail
                      </Button>
                    </div>

                  </div>
                )}

              </div>
            </CardContent>

            <CardFooter className="border-t bg-muted/10 py-4 flex flex-col sm:flex-row justify-center gap-3 text-center">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                256-bit SSL Encryption
              </div>
              <div className="text-xs text-slate-500">
                PCI-DSS Compliant
              </div>
            </CardFooter>

          </Card>
        </div>

        {/* RIGHT SIDE */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <Card className="sticky top-6">

            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">

              <div>
                <p className="text-sm text-muted-foreground">Event</p>
                <p className="font-bold">{normalizedEvent.title}</p>
              </div>

              <Separator />

              <div className="flex justify-between text-sm">
                <span>{normalizedEvent.tickets}x Tickets</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Platform Fee</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>

            </CardContent>

          </Card>
        </div>

      </div>
    </div>
  )
}