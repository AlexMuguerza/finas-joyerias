"use client";

import { motion } from "framer-motion";
import { ArrowRight, Diamond } from "lucide-react";
import Image from "next/image";
import heroImageMobile from "@/assets/hero-vertical.png";
import heroImageDesktop from "@/assets/hero-horizontal.png";

export const HeroSection = () => {
  return (
    <section
      id="inicio"
      className="relative min-h-screen lg:h-screen lg:max-h-screen flex items-center overflow-hidden"
    >
      {/* Background Image - Mobile */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src={heroImageMobile}
          alt="Mujer elegante con joyas"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
      </div>

      {/* Background Image - Desktop */}
      <div className="absolute inset-0 hidden md:block">
        <Image
          src={heroImageDesktop}
          alt="Mujer elegante luciendo joyas de oro"
          fill
          className="object-cover object-top"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 640px"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 w-full pt-36 pb-14 md:pt-60 md:pb-16 lg:py-20">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6"
          >
            <Diamond size={14} className="text-white" />
            <span className="text-xs font-medium text-white tracking-wider uppercase">
              Colección Exclusiva 2026
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="font-heading text-[2.5rem] sm:text-4xl md:text-5xl lg:text-6xl text-white leading-[1.1] mb-4 md:mb-6"
          >
            Cada joya cuenta
            <br />
            <span className="text-soft-pink italic font-light">una historia.</span>
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl ">
              Haz que la tuya brille.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-white/90 text-base sm:text-lg leading-relaxed mb-6 md:mb-8 max-w-lg"
          >
            Descubre nuestra colección de joyas artesanales diseñadas para
            momentos que merecen ser recordados. Elegancia, calidad y
            sofisticación en cada pieza.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="https://wa.me/51962792303?text=Hola%2C%20me%20gustar%C3%ADa%20explorar%20su%20colecci%C3%B3n%20de%20joyas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-text-heading text-sm font-medium rounded-full hover:bg-soft-pink transition-all duration-300 hover:shadow-lg group"
            >
              Explorar colección
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </a>
            <a
              href="https://wa.me/51962792303?text=Hola%2C%20me%20gustar%C3%ADa%20ver%20las%20novedades%20que%20tienen"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white text-white text-sm font-medium rounded-full hover:bg-white/10 transition-all duration-300"
            >
              Ver novedades
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex items-center gap-6 sm:gap-8 mt-6 lg:mt-8 pt-6 lg:pt-8 border-t border-white/30"
          >
            <div>
              <p className="text-2xl sm:text-3xl font-heading text-white">500+</p>
              <p className="text-xs text-white/70 uppercase tracking-wider">Productos</p>
            </div>
            <div className="w-px h-10 bg-white/30" />
            <div>
              <p className="text-2xl sm:text-3xl font-heading text-white">4.9</p>
              <p className="text-xs text-white/70 uppercase tracking-wider">Calificación</p>
            </div>
            <div className="w-px h-10 bg-white/30" />
            <div>
              <p className="text-2xl sm:text-3xl font-heading text-white">10K+</p>
              <p className="text-xs text-white/70 uppercase tracking-wider">Clientes</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};
