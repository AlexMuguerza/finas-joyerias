"use client";

import { motion } from "framer-motion";

const items = [
  "Diseños Exclusivos",
  "Oro de Ley 18k",
  "Diamantes Certificados",
  "Perlas Naturales",
  "Artesanía Peruana",
  "Garantía de Por Vida",
  "Envío Gratis en Lima",
  "Hecho con Amor",
];

export const Marquee = () => {
  return (
    <div className="py-6 bg-foreground overflow-hidden">
      <div className="flex">
        <motion.div
          animate={{ x: [0, -1920] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
          className="flex items-center gap-12 whitespace-nowrap"
        >
          {[...items, ...items, ...items].map((item, index) => (
            <div key={index} className="flex items-center gap-12">
              <span className="font-body text-[11px] font-medium tracking-[0.2em] uppercase text-white/70">
                {item}
              </span>
              <svg
                width="6"
                height="6"
                viewBox="0 0 6 6"
                fill="none"
                className="text-gold flex-shrink-0"
              >
                <path d="M3 0L6 3L3 6L0 3L3 0Z" fill="currentColor" />
              </svg>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
