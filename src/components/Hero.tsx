"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import heroHorizontal from "@/assets/hero/hero-horizontal.png";
import heroVertical from "@/assets/hero/hero-vertical.png";

export const Hero = () => {
  const titleVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.6,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 60, rotateX: -40 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  const title = "Finas";

  return (
    <section
      id="inicio"
      className="relative h-screen min-h-[700px] overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        {/* Desktop - Horizontal */}
        <Image
          src={heroHorizontal}
          alt="Joyería Finas - Colección exclusiva"
          className="w-full h-full object-cover object-center hidden md:block"
        />
        {/* Mobile - Vertical */}
        <Image
          src={heroVertical}
          alt="Joyería Finas - Colección exclusiva"
          className="w-full h-full object-cover object-center md:hidden"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-white/40" />

      {/* Decorative Elements */}
      {/* <div className="absolute top-20 left-10 w-32 h-32 border border-heading/10 rounded-full hidden md:block" />
      <div className="absolute bottom-32 right-16 w-20 h-20 border border-heading/10 rounded-full hidden md:block" /> */}

      {/* Decorative Diamond */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-1/4 right-[15%] hidden lg:block"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-heading/30">
          <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl mx-auto">
              {/* Pre-title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center gap-4 mb-8"
              >
                <div className="w-12 h-px bg-gradient-to-r from-transparent to-heading/40" />
                <span className="font-body text-[10px] font-medium tracking-[0.3em] uppercase text-heading/60">
                  Colección Exclusiva 2025
                </span>
                <div className="w-12 h-px bg-gradient-to-l from-transparent to-heading/40" />
              </motion.div>

              {/* Main Title with Letter Animation */}
              <motion.h1
                variants={titleVariants}
                initial="hidden"
                animate="visible"
                className="font-heading text-7xl md:text-8xl lg:text-9xl font-light text-heading mb-6 tracking-tight"
                style={{ perspective: "1000px" }}
              >
                {title.split("").map((letter, i) => (
                  <motion.span
                    key={i}
                    variants={letterVariants}
                    className="inline-block"
                    style={{ transformOrigin: "bottom" }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="font-heading text-xl md:text-2xl lg:text-3xl font-light text-heading/80 mb-4 italic"
              >
                Donde cada joya cuenta tu historia
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="font-body text-sm md:text-base text-text-body mb-12 max-w-xl mx-auto font-light leading-relaxed"
              >
            Descubre nuestra colección de joyería fina y exclusiva.
            Diseños que trascienden el tiempo y celebran tu esencia.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => {
                const el = document.getElementById("colecciones");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="px-10 py-4 bg-foreground text-white font-body text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-foreground/90 transition-all duration-500 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
            >
              Explorar Colección
            </button>
            <button
              onClick={() => {
                const el = document.getElementById("nuestra-historia");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="px-10 py-4 border border-foreground/40 text-foreground font-body text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-foreground/10 transition-all duration-500 cursor-pointer"
            >
              Nuestra Historia
            </button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-3"
          >
            <span className="font-body text-[9px] tracking-[0.3em] uppercase text-heading/50">
              Scroll
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-heading/50 to-transparent" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
