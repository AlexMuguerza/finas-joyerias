"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import elegante from "@/assets/estilo_vida/estilo-vida-elegante.png";
import natural from "@/assets/estilo_vida/estilo-vida-natural.jpg";

export const BrandStory = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section
      id="nuestra-historia"
      ref={containerRef}
      className="section-padding bg-soft-pink relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <span className="font-body text-[10px] font-medium tracking-[0.3em] uppercase text-primary block mb-4">
            Nuestra Esencia
          </span>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-heading mb-6">
            Historia de <span className="italic text-primary">pasi&oacute;n</span>
          </h2>
          <div className="w-16 h-px bg-gold mx-auto" />
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src={elegante}
                alt="Mujer elegante con joyería Finas"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-4 border border-white/30 pointer-events-none" />
            </div>

            {/* Floating Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="absolute -bottom-8 -right-4 lg:-right-8 bg-white p-6 shadow-medium"
            >
              <div className="text-center">
                <span className="font-heading text-4xl font-light text-primary block">
                  15+
                </span>
                <span className="font-body text-[10px] font-medium tracking-[0.15em] uppercase text-text-body">
                  Años de Experiencia
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Center Text */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 text-center lg:text-left"
          >
            <h3 className="font-heading text-3xl md:text-4xl font-light text-heading mb-6 leading-tight">
              Cada joya es una{' '}
              <span className="italic text-primary">obra de arte</span>
            </h3>
            <p className="font-body text-sm text-text-body leading-relaxed mb-6">
              En Finas, cada pieza nace de la pasi&oacute;n por la excelencia.
              Nuestros artesanos combinan t&eacute;cnicas tradicionales con dise&ntilde;os
              contempor&aacute;neos para crear joyas &uacute;nicas que trascienden el tiempo.
            </p>
            <p className="font-body text-sm text-text-body leading-relaxed mb-8">
              Utilizamos solo los materiales más finos: oro de ley, diamantes certificados
              y perlas naturales. Cada detalle cuenta una historia de dedicaci&oacute;n y arte.
            </p>

            {/* Values */}
            <div className="grid grid-cols-2 gap-6">
              {[
                { number: "500+", label: "Diseños Únicos" },
                { number: "100%", label: "Materiales Nobles" },
                { number: "50+", label: "Artesanos Expertos" },
                { number: "1000+", label: "Clientes Felices" },
              ].map((stat, i) => (
                <div key={i} className="text-center lg:text-left">
                  <span className="font-heading text-2xl font-light text-primary block">
                    {stat.number}
                  </span>
                  <span className="font-body text-[10px] font-medium tracking-[0.1em] uppercase text-text-body">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-3"
          >
            <div className="relative aspect-[2/3] overflow-hidden">
              <Image
                src={natural}
                alt="Artesana trabajando en taller Finas"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 25vw"
              />
              <div className="absolute inset-4 border border-white/30 pointer-events-none" />
            </div>
          </motion.div>
        </div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-24 text-center"
        >
          <div className="max-w-2xl mx-auto">
            <svg
              width="32"
              height="24"
              viewBox="0 0 32 24"
              fill="none"
              className="mx-auto mb-6 text-primary/40"
            >
              <path
                d="M0 24V14.4C0 10.4 0.8 7.2 2.4 4.8C4 2.4 6.4 0.8 9.6 0L12.8 4C10.4 4.8 8.8 6 8 7.6C7.2 9.2 6.8 10.8 6.8 12.4H12V24H0ZM20 24V14.4C20 10.4 20.8 7.2 22.4 4.8C24 2.4 26.4 0.8 29.6 0L32 4C29.6 4.8 28 6 27.2 7.6C26.4 9.2 26 10.8 26 12.4H32V24H20Z"
                fill="currentColor"
              />
            </svg>
            <p className="font-heading text-2xl md:text-3xl font-light text-heading italic leading-relaxed mb-6">
              &ldquo;La elegancia es la &uacute;nica belleza que nunca se desvanece&rdquo;
            </p>
            <span className="font-body text-[11px] font-medium tracking-[0.2em] uppercase text-primary">
              &mdash; Filosofía Finas
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
