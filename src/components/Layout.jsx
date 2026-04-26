import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import { pageVariants } from "@/lib/animations";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <AnimatePresence mode="wait">
        {/* The 'key' must be location.pathname to trigger animations */}
        <motion.main
          key={location.pathname} 
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* CRITICAL: Without this tag, the Dashboard content won't show! */}
          <Outlet /> 
        </motion.main>
      </AnimatePresence>
    </div>
  );
}