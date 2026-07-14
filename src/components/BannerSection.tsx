"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ImageWithSkeleton } from "./ui/ImageWithSkeleton";

export const BannerSection = () => {
  return (
    <section className="relative h-[350px] sm:h-[400px] lg:h-[500px] overflow-hidden">
      {/* Background Image with Skeleton */}
      <ImageWithSkeleton
        src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1920&q=80"
        alt="Colección de joyas elegantes con detalles dorados"
        fill
        className="object-cover"
        sizes="100vw"
        priority
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30 z-10" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center text-center px-5 sm:px-6 z-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-white mb-4 sm:mb-6 leading-tight">
            La elegancia está en los{" "}
            <span className="italic text-soft-pink">pequeños detalles</span>
          </h2>
          <p className="text-white/80 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
            Descubre piezas únicas que transforman momentos ordinarios en
            recuerdos extraordinarios.
          </p>
          <a
            href="https://wa.me/51962792303?text=Hola%2C%20me%20gustar%C3%ADa%20realizar%20una%20compra"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Comprar ahora"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-text-heading text-sm font-medium rounded-full hover:bg-soft-pink transition-colors duration-300 group"
          >
            Comprar ahora
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
};
