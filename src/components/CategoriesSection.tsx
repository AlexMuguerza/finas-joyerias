"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ImageWithSkeleton } from "./ui/ImageWithSkeleton";
import Anillos from "@/assets/categoria-anillos.jpg";
import Collares from "@/assets/categroia-collares.jpg";
import Aretes from "@/assets/categoria-aretes.jpg";
import Pulseras from "@/assets/categoria-pulseras.jpg";
import Accesorios from "@/assets/categoria-accesorios.png";
import Sets from "@/assets/categoria-sets.png";

const categories = [
  {
    name: "Collares",
    image: Collares,
    count: 48,
  },
  {
    name: "Anillos",
    image: Anillos,
    count: 64,
  },
  {
    name: "Aretes",
    image: Aretes,
    count: 52,
  },
  {
    name: "Pulseras",
    image: Pulseras,
    count: 36,
  },
  {
    name: "Sets",
    image: Sets,
    count: 24,
  },
  {
    name: "Accesorios",
    image: Accesorios,
    count: 28,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export const CategoriesSection = () => {
  return (
    <section id="categorias" className="py-16 sm:py-20 lg:py-24 bg-white">
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
            Explora por Categoría
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-text-heading mb-4">
            Encuentra tu estilo
          </h2>
          <p className="text-text-body text-sm sm:text-base max-w-2xl mx-auto px-4">
            Descubre nuestra colección organizada para que encuentres la pieza
            perfecta para cada ocasión.
          </p>
        </motion.div>

        {/* Categories Grid - Mobile First */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
        >
          {categories.map((category) => (
            <motion.a
              key={category.name}
              href={`https://wa.me/51962792303?text=Hola%2C%20me%20gustar%C3%ADa%20ver%20los%20productos%20de%20la%20categor%C3%ADa%20${encodeURIComponent(category.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              variants={item}
              aria-label={`Ver colección de ${category.name}`}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl cursor-pointer aspect-[3/4]"
            >
              {/* Image with Skeleton */}
              <ImageWithSkeleton
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 lg:p-6 text-white z-10">
                <h3 className="font-heading text-lg sm:text-xl lg:text-2xl mb-1">
                  {category.name}
                </h3>
                <p className="text-xs sm:text-sm opacity-80">
                  {category.count} productos
                </p>
              </div>

              {/* Hover Arrow */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 z-10">
                <ArrowRight size={16} className="text-text-heading" />
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
