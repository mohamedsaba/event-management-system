export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

export const containerVariants = {
  animate: {
    transition: {
      staggerChildren: 0.1 // This creates the "waterfall" effect for cards/rows
    }
  }
};

export const itemVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100 } }
};

export const springIn = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: "spring", damping: 15, stiffness: 200 } }
};