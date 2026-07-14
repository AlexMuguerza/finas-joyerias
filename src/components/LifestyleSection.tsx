"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ImageWithSkeleton } from "./ui/ImageWithSkeleton";
import LifeStyleElegante from "@/assets/estilo-vida-elegante.png";
import LifeStyleNatural from "@/assets/estilo-vida-natural.jpg";

export const LifestyleSection = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-cream">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <p className="text-primary text-xs sm:text-sm font-medium tracking-widest uppercase mb-3 sm:mb-4">
            Estilo de Vida
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-text-heading mb-4">
            Momentos que brillan
          </h2>
        </motion.div>

        {/* Two Column Layout - Mobile First (stacked, then side by side) */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Image 1 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="group relative overflow-hidden rounded-xl sm:rounded-2xl h-[300px] sm:h-[400px] lg:h-[500px]"
          >
            <ImageWithSkeleton
              src={LifeStyleElegante}
              alt="Mujer elegante con collar de perlas"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:bg-black/50 transition-colors duration-300 z-10" />
            <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 text-white z-20">
              <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3">
                Elegancia en cada detalle
              </h3>
              <p className="text-white/80 text-sm sm:text-base mb-4 sm:mb-6 max-w-md hidden sm:block">
                Nuestras perlas cultivadas son seleccionadas cuidadosamente para
                garantizar brillo y calidad excepcionales.
              </p>
              <a
                href="https://wa.me/51962792303?text=Hola%2C%20me%20gustar%C3%ADa%20ver%20su%20colecci%C3%B3n%20de%20perlas"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver colección de perlas"
                className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors w-fit"
              >
                Ver colección
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>

          {/* Image 2 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative overflow-hidden rounded-xl sm:rounded-2xl h-[300px] sm:h-[400px] lg:h-[500px]"
          >
            <ImageWithSkeleton
              src={LifeStyleNatural}
              alt="Mujer con aretes dorados"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:bg-black/50 transition-colors duration-300 z-10" />
            <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 text-white z-20">
              <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3">
                Brillo natural
              </h3>
              <p className="text-white/80 text-sm sm:text-base mb-4 sm:mb-6 max-w-md hidden sm:block">
                Aretes diseñados para resaltar tu belleza natural con
                materiales de la más alta calidad.
              </p>
              <a
                href="https://wa.me/51962792303?text=Hola%2C%20me%20gustar%C3%ADa%20explorar%20su%20colecci%C3%B3n%20de%20aretes"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Explorar aretes dorados"
                className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors w-fit"
              >
                Explorar
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
