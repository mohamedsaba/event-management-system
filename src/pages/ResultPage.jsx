import { useNavigate, Navigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, Download, ArrowLeft, LayoutDashboard, Share2 } from "lucide-react"
import { useBooking } from "@/hooks/useBooking"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
}

const iconVariants = {
  hidden: { scale: 0 },
  visible: { scale: 1, transition: { delay: 0.2, type: "spring", stiffness: 200, damping: 15 } }
}

export default function ResultPage() {
  const { bookingResult } = useBooking();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);

  useEffect(() => {
    // 1. Try context result (from usePaymentFlow hook)
    if (bookingResult) {
      setResult(bookingResult);
      return;
    }

    // 2. Try URL params (from Paymob redirect)
    // Paymob appends params like ?success=true&txn_id=... to the redirect URL
    // In HashRouter, this might be inside the hash: #/result?success=true...
    const hash = window.location.hash;
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);

    if (params.has('success') || params.has('id')) {
      setResult({
        success: params.get('success') === 'true',
        bookingRef: params.get('txn_id') || params.get('id'),
        amount: params.get('amount') ? params.get('amount') / 100 : 0,
        eventTitle: "Your Registered Event",
        date: new Date().toLocaleDateString(),
        errorMessage: params.get('message') || "Transaction failed"
      });
    }
  }, [bookingResult, location]);

  useEffect(() => {
    if (window.self !== window.top) {
      window.top.location.href = window.location.href;
    }
  }, []);

  if (!result && !bookingResult) return <Navigate to="/events" replace />

  const isSuccess = result?.success

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-8 bg-slate-50/30">
      
      <motion.div 
        className="w-full max-w-xl"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card className="overflow-hidden border-none shadow-2xl rounded-3xl">
          
          <CardHeader className={`text-center pb-10 pt-12 relative overflow-hidden ${isSuccess ? "bg-emerald-500" : "bg-red-500"}`}>
            {/* Background patterns */}
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
                     <TableCell className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4">Reference</TableCell>
                     <TableCell className="text-right font-mono font-bold text-slate-900">{result?.bookingRef || "N/A"}</TableCell>
                   </TableRow>
                   <TableRow className="border-slate-200">
                     <TableCell className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4">Event</TableCell>
                     <TableCell className="text-right font-black text-slate-900 line-clamp-1">{result?.eventTitle}</TableCell>
                   </TableRow>
                   <TableRow className="border-slate-200">
                     <TableCell className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4">Issued On</TableCell>
                     <TableCell className="text-right font-bold text-slate-900">{result?.date}</TableCell>
                   </TableRow>
                   <TableRow className="border-transparent">
                     <TableCell className="font-bold text-slate-400 uppercase tracking-widest text-[10px] py-4">Total Paid</TableCell>
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
                <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full sm:flex-1 h-12 gap-2 font-bold shadow-xl shadow-primary/20">
                  <LayoutDashboard className="w-5 h-5" /> Go to Dashboard
                </Button>
                <Button variant="outline" size="lg" className="w-full sm:flex-1 h-12 gap-2 font-bold border-2" onClick={() => window.print()}>
                  <Download className="w-5 h-5" /> Print Receipt
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/events')} size="lg" className="w-full sm:flex-1 h-12 gap-2 font-bold shadow-xl shadow-slate-200">
                  <ArrowLeft className="w-5 h-5" /> Back to Events
                </Button>
                <Button variant="ghost" size="lg" className="w-full sm:flex-1 h-12 font-bold text-slate-500" onClick={() => toast.info("Support ticket created")}>
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