import { useEffect, useRef, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import { pageVariants } from "@/lib/animations";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Layout() {
  const location = useLocation();
  const { logout, user } = useAuth();
  const timerRef = useRef(null);

  const handleLogout = useCallback(() => {
    logout();
    toast.info("Session expired due to inactivity");
  }, [logout]);

  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleLogout, 30 * 60 * 1000); // 30 minutes
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    
    // Initial start
    resetTimer();

    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [user, handleLogout]);

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname} 
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Outlet /> 
        </motion.main>
      </AnimatePresence>
    </div>
  );
}