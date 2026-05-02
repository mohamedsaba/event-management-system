import { useNavigate, Navigate, useLocation, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import {
  CheckCircle2,
  XCircle,
  Download,
  ArrowLeft,
  LayoutDashboard,
  Share2,
  Loader2,
} from "lucide-react"
import { useBooking } from "@/hooks/useBooking"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PAYMENT_RETURN_EVENT_ID_KEY } from "@/constants/payment"

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
}

const iconVariants = {
  hidden: { scale: 0 },
  visible: { scale: 1, transition: { delay: 0.2, type: "spring", stiffness: 200, damping: 15 } },
}

function mergePaymentUrlParams(location, routerSearchParams) {
  const mergedParams = new URLSearchParams(location.search)
  routerSearchParams.forEach((value, key) => {
    if (!mergedParams.has(key)) mergedParams.set(key, value)
  })
  const hash = window.location.hash
  const qi = hash.indexOf("?")
  if (qi >= 0) {
    const hashQuery = hash.slice(qi + 1).split("#")[0]
    const hashParams = new URLSearchParams(hashQuery)
    hashParams.forEach((value, key) => {
      if (!mergedParams.has(key)) mergedParams.set(key, value)
    })
  }
  return mergedParams
}

function resolveEventId(mergedParams) {
  const fromUrl = mergedParams.get("eventId") ?? mergedParams.get("event_id")
  if (fromUrl) return String(fromUrl)
  const stored = sessionStorage.getItem(PAYMENT_RETURN_EVENT_ID_KEY)
  return stored ? String(stored) : null
}

export default function ResultPage() {
  const { bookingResult, setBookingResult } = useBooking()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [result, setResult] = useState(null)
  const [resolution, setResolution] = useState("loading")

  useEffect(() => {
    if (window.self !== window.top) {
      window.top.location.href = window.location.href
    }
  }, [])

  useEffect(() => {
    const mergedParams = mergePaymentUrlParams(location, searchParams)
    const successParam = mergedParams.get("success")
    const txnId =
      mergedParams.get("txn_id") ||
      mergedParams.get("id") ||
      mergedParams.get("transaction_id")
    const hasPaymobRedirect = successParam !== null || Boolean(txnId)

    const isSuccessUrl =
      successParam === "true" ||
      successParam === "1" ||
      mergedParams.get("status") === "success"

    const buildFailurePayload = () => ({
      success: false,
      bookingRef: txnId,
      amount: mergedParams.get("amount_cents")
        ? Number(mergedParams.get("amount_cents")) / 100
        : mergedParams.get("amount")
          ? Number(mergedParams.get("amount")) / 100
          : 0,
      eventTitle: "Your Registered Event",
      date: new Date().toLocaleDateString(),
      errorMessage: mergedParams.get("message") || "Transaction failed",
    })

    const finishSuccessRedirect = () => {
      sessionStorage.removeItem(PAYMENT_RETURN_EVENT_ID_KEY)
      setBookingResult(null)
      const eventId = resolveEventId(mergedParams)
      if (eventId) {
        navigate(`/events/${eventId}`, { replace: true, state: { paymentSuccess: true } })
      } else {
        toast.success("Payment successful! Your booking is confirmed.")
        navigate("/dashboard", { replace: true })
      }
      setResolution("redirected")
    }

    if (hasPaymobRedirect) {
      if (isSuccessUrl) {
        finishSuccessRedirect()
      } else {
        setBookingResult(null)
        setResult(buildFailurePayload())
        setResolution("failure")
      }
      return
    }

    if (bookingResult?.success) {
      finishSuccessRedirect()
      return
    }

    if (bookingResult && !bookingResult.success) {
      setResult(bookingResult)
      setResolution("failure")
      return
    }

    setResolution("empty")
  }, [bookingResult, location, searchParams, navigate, setBookingResult])

  if (resolution === "loading" || resolution === "redirected") {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center gap-4 bg-slate-50/30 p-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500">Confirming payment…</p>
      </div>
    )
  }

  if (resolution === "empty") {
    return <Navigate to="/events" replace />
  }

  const isSuccess = result?.success

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-8 bg-slate-50/30">
      <motion.div className="w-full max-w-xl" initial="hidden" animate="visible" variants={cardVariants}>
        <Card className="overflow-hidden border-none shadow-2xl rounded-3xl">
          <CardHeader
            className={`text-center pb-10 pt-12 relative overflow-hidden ${isSuccess ? "bg-emerald-500" : "bg-red-500"}`}
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="flex justify-center mb-6 relative z-10">
              <motion.div variants={iconVariants}>
                {isSuccess ? (
                  <div className="bg-white p-4 rounded-full shadow-lg">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-full shadow-lg">
                    <XCircle className="w-16 h-16 text-red-500" />
                  </div>
                )}
              </motion.div>
            </div>

            <CardTitle className="text-3xl font-black tracking-tight text-white relative z-10">
              {isSuccess ? "Payment Confirmed!" : "Transaction Failed"}
            </CardTitle>

            <p className="text-white/80 font-medium mt-2 max-w-xs mx-auto relative z-10">
              {isSuccess
                ? "You're all set! Your ticket has been generated and added to your dashboard."
                : result?.errorMessage || "There was an error processing your payment."}
            </p>
          </CardHeader>

          <CardContent className="pt-10 px-8">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <Table>
                <TableBody>
                  <TableRow className="border-slate-200">
                    <TableCell className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4">
                      Reference
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-slate-900">
                      {result?.bookingRef || "N/A"}
                    </TableCell>
                  </TableRow>
                  <TableRow className="border-slate-200">
                    <TableCell className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4">
                      Event
                    </TableCell>
                    <TableCell className="text-right font-black text-slate-900 line-clamp-1">{result?.eventTitle}</TableCell>
                  </TableRow>
                  <TableRow className="border-slate-200">
                    <TableCell className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4">
                      Issued On
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900">{result?.date}</TableCell>
                  </TableRow>
                  <TableRow className="border-transparent">
                    <TableCell className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4">
                      Total Paid
                    </TableCell>
                    <TableCell className="text-right text-2xl font-black text-primary">
                      ${Number(result?.amount || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {isSuccess && (
              <div className="mt-6 flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="bg-white p-2 rounded-lg text-primary shadow-sm">
                  <Share2 className="w-4 h-4" />
                </div>
                <p className="text-[11px] text-slate-600 leading-tight font-medium">
                  Share your attendance with friends! A confirmation email has been sent to your inbox.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-4 p-8 pt-4">
            {isSuccess ? (
              <>
                <Button
                  onClick={() => navigate("/dashboard")}
                  size="lg"
                  className="w-full sm:flex-1 h-12 gap-2 font-bold shadow-xl shadow-primary/20"
                >
                  <LayoutDashboard className="w-5 h-5" /> Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:flex-1 h-12 gap-2 font-bold border-2"
                  onClick={() => window.print()}
                >
                  <Download className="w-5 h-5" /> Print Receipt
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate("/events")}
                  size="lg"
                  className="w-full sm:flex-1 h-12 gap-2 font-bold shadow-xl shadow-slate-200"
                >
                  <ArrowLeft className="w-5 h-5" /> Back to Events
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full sm:flex-1 h-12 font-bold text-slate-500"
                  onClick={() => toast.info("Support ticket created")}
                >
                  Help Center
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
