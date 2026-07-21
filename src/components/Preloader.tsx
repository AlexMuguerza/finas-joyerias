"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Logo from "@/assets/logo-sin-fondo.png";

export const Preloader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(onComplete, 600);
          }, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream"
          role="status"
          aria-live="polite"
          aria-label="Cargando página"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="text-center"
          >
            <Image
              src={Logo}
              alt="Finas Joyería"
              width={150}
              height={150}
              className="h-37 w-auto"
              style={{ width: "auto" }}
              priority
            />
          </motion.div>

          {/* Progress Line */}
          <div className="w-40 h-px bg-border/50 overflow-hidden mt-10">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
              className="h-full bg-primary"
            />
          </div>

          {/* Loading Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-[10px] text-text-body font-light tracking-[0.2em] uppercase"
          >
            Cargando
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
