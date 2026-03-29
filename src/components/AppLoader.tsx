import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const AppLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [show, setShow] = useState(true);
  const isChapathi = Math.random() > 0.5;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500);
    }, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-7xl md:text-8xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            {isChapathi ? "🫓" : "🥟"}
          </motion.div>
          <motion.h1
            className="mt-6 font-display text-3xl md:text-4xl font-black tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-primary">fam</span>
            <span className="text-secondary">Food</span>
            <span className="text-primary">6</span>
          </motion.h1>
          <motion.p
            className="mt-2 text-sm text-muted-foreground font-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Homemade goodness, delivered fresh
          </motion.p>
          <motion.div
            className="mt-8 h-1 w-48 overflow-hidden rounded-full bg-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppLoader;
