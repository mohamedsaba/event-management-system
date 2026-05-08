import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEventContext } from "../context/EventContext";
import { useAuth } from "@/hooks/useAuth";
import { registrationApi } from "@/utils/api/registrationApi";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

function RegisterButton({ event }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setSelectedEvent, setReturnPath } = useEventContext();
  const [isRegistering, setIsRegistering] = useState(false);

  const isFree = !event.paymentRequired;
  const isDisabled = isRegistering || event.eventStatus !== 'SCHEDULED';

  const handleRegisterFree = async () => {
    setIsRegistering(true);
    const toastId = toast.loading("Processing your registration...");
    
    try {
      await registrationApi.registerForEvent(user.id, event.id);
      toast.success("Successfully registered!", { id: toastId });
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed", { id: toastId });
      setIsRegistering(false);
    }
  };

  const handleClick = (e) => {
    if (isDisabled) return;
    
    if (!user) {
      toast.info("Please sign in to register for events");
      navigate("/auth", { state: { from: { pathname: "/events" } } });
      return;
    }

    if (!isFree) {
      setSelectedEvent(event);
      // If we are in the list, returning to /events is better than current location if we want to be specific
      setReturnPath(window.location.hash.includes('/events/') ? window.location.hash.replace('#', '') : "/events");
      navigate("/register");
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      {isFree ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              onClick={handleClick}
              disabled={isDisabled}
              className={`
                text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer
                transition-all duration-200
                ${isDisabled
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-slate-900 text-white hover:bg-slate-800 active:scale-95"
                }
              `}
            >
              {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : 
               event.eventStatus !== 'SCHEDULED' ? "Unavailable" : "Register"}
            </button>
          </AlertDialogTrigger>
          {user && !isDisabled && (
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Registration</AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to register for <strong>"{event.title}"</strong>. 
                  Your registration will be under <strong>{user.username || user.email}</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRegisterFree} className="bg-primary">
                  Confirm Registration
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
        </AlertDialog>
      ) : (
        <button
          onClick={handleClick}
          disabled={isDisabled}
          className={`
            text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm cursor-pointer
            transition-all duration-200
            ${isDisabled
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-slate-900 text-white hover:bg-slate-800 active:scale-95"
            }
          `}
        >
          {event.eventStatus !== 'SCHEDULED' ? "Unavailable" : "Register"}
        </button>
      )}
    </div>
  );
}

export default RegisterButton;