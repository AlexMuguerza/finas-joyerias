"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import elegante from "@/assets/estilo_vida/estilo-vida-elegante.png";
import natural from "@/assets/estilo_vida/estilo-vida-natural.jpg";
import collar from "@/assets/productos/producto-collar-perla-clasica.png";

export const Lifestyle = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={containerRef}
      className="py-32 md:py-40 bg-cream overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <span className="font-body text-[10px] font-medium tracking-[0.3em] uppercase text-primary block mb-4">
            Momentos Especiales
          </span>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-heading mb-6">
            Vivir con <span className="italic text-primary">elegancia</span>
          </h2>
          <div className="w-16 h-px bg-gold mx-auto" />
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[300px]">
          {/* Large Left Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-2 md:row-span-2 relative group overflow-hidden"
          >
            <Image
              src={elegante}
              alt="Estilo de vida elegante con joyería Finas"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="font-heading text-2xl font-light text-white mb-2">
                Elegancia Contemporánea
              </h3>
              <p className="font-body text-sm text-white/80">
                Diseños que definen tendencias
              </p>
            </div>
          </motion.div>

          {/* Top Right */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative group overflow-hidden"
          >
            <Image
              src={natural}
              alt="Artesanía natural en joyería Finas"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="font-heading text-xl font-light text-white">
                Artesanía Pura
              </h3>
            </div>
          </motion.div>

          {/* Middle Right - Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative group overflow-hidden bg-primary flex items-center justify-center"
          >
            <div className="text-center p-6">
              <span className="font-heading text-5xl md:text-6xl font-light text-white block mb-2">
                15+
              </span>
              <span className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-white/80">
                Años creando momentos
              </span>
            </div>
          </motion.div>

          {/* Bottom Right */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative group overflow-hidden"
          >
            <Image
              src={collar}
              alt="Collar de perla clásica Finas"
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="font-heading text-xl font-light text-white">
                Perfección en Cada Detaille
              </h3>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
