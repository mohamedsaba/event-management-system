import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const usePaymentFlow = (setBookingResult) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event) => {
      // SECURITY: Reject messages from unknown origins
      if (event.origin !== "https://accept.paymob.com") return;

      if (event.data?.type === 'PAYMOB_TRANSACTION_RESULT') {
        setIsProcessing(true);
        // PLAN FIX: use txn_id instead of id
        const { success, txn_id, amount, eventTitle } = event.data;

        const result = {
          success,
          bookingRef: success ? txn_id : null,
          amount: amount,
          eventTitle: eventTitle,
          date: new Date().toLocaleDateString(),
          errorMessage: success ? null : "Transaction failed"
        };

        if (setBookingResult) setBookingResult(result);

        if (success) {
          toast.success("Payment verified!");
          navigate('/result', { replace: true });
        } else {
          toast.error("Payment failed or was canceled.");
          navigate('/result', { replace: true });
        }
        setIsProcessing(false);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate, setBookingResult]);

  return { isProcessing, setIsProcessing };
};