import { useNavigate, Navigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { CheckCircle2, XCircle, Download, ArrowLeft, LayoutDashboard } from "lucide-react"
import { useBooking } from "@/hooks/useBooking"

// Animation variants for the card and the icon
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
  const navigate = useNavigate()

  if (!bookingResult) return <Navigate to="/payment" replace />

  const isSuccess = bookingResult.success

  return (
    // Dynamic padding so it doesn't hug the screen edges on mobile
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-8">
      
      {/* Animated Wrapper around the Card */}
      <motion.div 
        className="w-full max-w-lg"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <Card className="overflow-hidden border-2 shadow-xl">
          
          <CardHeader className={`text-center pb-6 sm:pb-8 pt-8 sm:pt-10 ${isSuccess ? "bg-emerald-50/50" : "bg-red-50/50"}`}>
            <div className="flex justify-center mb-4 sm:mb-6">
              <motion.div variants={iconVariants}>
                {isSuccess ? (
                  <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-500 drop-shadow-sm" />
                ) : (
                  <XCircle className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 drop-shadow-sm" />
                )}
              </motion.div>
            </div>
            
            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
              {isSuccess ? "Payment Confirmed!" : "Payment Failed"}
            </CardTitle>
            
            <p className="text-sm sm:text-base text-muted-foreground mt-2 max-w-xs mx-auto">
              {isSuccess 
                ? "Your tickets have been successfully issued." 
                : bookingResult.errorMessage}
            </p>
          </CardHeader>

          <CardContent className="pt-6 sm:pt-8 px-4 sm:px-8">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground py-3 sm:py-4">Booking Ref</TableCell>
                  <TableCell className="text-right font-mono text-xs sm:text-sm">{bookingResult.bookingRef || "N/A"}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground py-3 sm:py-4">Event</TableCell>
                  <TableCell className="text-right font-semibold text-sm sm:text-base">{bookingResult.eventTitle}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground py-3 sm:py-4">Date</TableCell>
                  <TableCell className="text-right text-sm sm:text-base">{bookingResult.date}</TableCell>
                </TableRow>
                <TableRow className="border-b-0">
                  <TableCell className="font-medium text-muted-foreground py-3 sm:py-4">Total Paid</TableCell>
                  <TableCell className="text-right text-lg sm:text-2xl font-black text-primary">
                    ${Number(bookingResult.amount).toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>

          {/* Buttons naturally stack on mobile and sit side-by-side on desktop */}
          <CardFooter className="flex flex-col sm:flex-row gap-3 bg-muted/20 border-t p-4 sm:p-6">
            {isSuccess ? (
              <>
                <Button onClick={() => navigate('/dashboard')} className="w-full sm:flex-1 h-11 sm:h-12 gap-2 text-sm sm:text-base">
                  <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5" /> Go to Dashboard
                </Button>
                <Button variant="outline" className="w-full sm:flex-1 h-11 sm:h-12 gap-2 text-sm sm:text-base" onClick={() => window.print()}>
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" /> Print Ticket
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => navigate('/payment')} className="w-full sm:flex-1 h-11 sm:h-12 gap-2 text-sm sm:text-base">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Try Again
                </Button>
                <Button variant="ghost" className="w-full sm:flex-1 h-11 sm:h-12 text-sm sm:text-base" onClick={() => alert("Contacting support...")}>
                  Contact Support
                </Button>
              </>
            )}
          </CardFooter>

        </Card>
      </motion.div>
    </div>
  )
}