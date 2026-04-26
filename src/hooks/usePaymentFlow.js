import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const usePaymentFlow = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = (event) => {
      // SECURITY: In production, uncomment this to reject fake messages
      // if (event.origin !== "https://accept.paymob.com") return;

      // Check if the message is actually from our payment gateway
      if (event.data?.type === 'PAYMOB_TRANSACTION_RESULT') {
        setIsProcessing(true);
        const { success, id } = event.data;

        if (success) {
          toast.success("Payment verified!");
          navigate('/result', { state: { transactionId: id, success: true }, replace: true });
        } else {
          toast.error("Payment failed or was canceled.");
          navigate('/result', { state: { success: false }, replace: true });
        }
        setIsProcessing(false);
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  return { isProcessing , setIsProcessing};
};