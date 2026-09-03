"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import heroVertical from "@/assets/hero/hero-vertical.png";

export const CTA = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={containerRef}
      className="relative py-32 md:py-40 overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={heroVertical}
          alt="Joyería Finas - Exclusividad"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />

      {/* Noise Texture */}
      <div className="absolute inset-0 noise-overlay" />

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1 }}
        className="absolute top-12 left-12 w-24 h-24 border border-white/10 rotate-45 hidden md:block"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.3 }}
        className="absolute bottom-16 right-16 w-16 h-16 border border-white/10 rotate-12 hidden md:block"
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Decorative Diamond */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mx-auto text-gold">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" strokeWidth="1" />
            </svg>
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-body text-[10px] font-medium tracking-[0.3em] uppercase text-white/70 block mb-6"
          >
            Hazlo Especial
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6 leading-tight"
          >
            Regala algo que{' '}
            <span className="italic text-primary-light">trascienda</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-body text-sm md:text-base text-white/70 mb-12 max-w-xl mx-auto font-light leading-relaxed"
          >
            Cada joya Finas es más que un accesorio: es un momento, una emoción,
            un recuerdo que perdura para siempre. Descubre la pieza perfecta para
            esa persona especial.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/#contacto" className="btn-premium">
              Solicitar Asesoría Personal
            </Link>
            <Link
              href="/shop"
              className="px-10 py-4 border border-white/30 text-white font-body text-[11px] font-medium tracking-[0.2em] uppercase hover:bg-white/10 transition-all duration-500 cursor-pointer"
            >
              Ver Catálogo Completo
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-12"
          >
            {[
              "Envío gratis en Lima",
              "Garantía de por vida",
              "Certificado de autenticidad",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-gold"
                >
                  <path
                    d="M13.3 4L6 11.3L2.7 8"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-body text-[11px] text-white/70">
                  {item}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
