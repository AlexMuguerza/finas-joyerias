"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Heart, Eye } from "lucide-react";
import Image from "next/image";

const products = [
  {
    id: 1,
    name: "Anillo Compromiso Eternity",
    price: "S/ 4,850",
    category: "Anillos",
    image: "/productos/producto-anillo-compromiso.png",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Collar Perla Clásica",
    price: "S/ 2,320",
    category: "Collares",
    image: "/productos/producto-collar-perla-clasica.png",
    badge: null,
  },
  {
    id: 3,
    name: "Aretes Cascada Rosa",
    price: "S/ 1,180",
    category: "Aretes",
    image: "/productos/producto-aretes-cascada-rosa.png",
    badge: "Nuevo",
  },
  {
    id: 4,
    name: "Pulsera Cadena Delicada",
    price: "S/ 1,650",
    category: "Pulseras",
    image: "/productos/producto-pulsera-cadena-delicada.png",
    badge: null,
  },
  {
    id: 5,
    name: "Set Elegance Completo",
    price: "S/ 6,990",
    category: "Sets",
    image: "/productos/producto-set-completo-elegance.png",
    badge: "Exclusivo",
  },
  {
    id: 6,
    name: "Anillo Solitario Oro",
    price: "S/ 3,450",
    category: "Anillos",
    image: "/productos/producto-anillo-solitario-oro.jpg",
    badge: null,
  },
];

const filters = ["Todos", "Anillos", "Collares", "Aretes", "Pulseras", "Sets"];

export const FeaturedProducts = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  const filteredProducts =
    activeFilter === "Todos"
      ? products
      : products.filter((p) => p.category === activeFilter);

  return (
    <section id="productos" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8" ref={containerRef}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="font-body text-[10px] font-medium tracking-[0.3em] uppercase text-primary block mb-4">
            Piezas Seleccionadas
          </span>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-heading mb-6">
            Nuestras <span className="italic text-primary">joyas</span> destacadas
          </h2>
          <div className="w-16 h-px bg-gold mx-auto" />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 font-body text-[11px] font-medium tracking-[0.15em] uppercase transition-all duration-300 cursor-pointer ${
                activeFilter === filter
                  ? "bg-primary text-white"
                  : "bg-muted text-text-body hover:bg-soft-pink hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product, index) => (
              <motion.article
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group relative"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {/* Image Container */}
                <div className="relative aspect-square bg-soft-pink mb-5 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={`${product.name} - ${product.category} Finas Joyería`}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-white font-body text-[9px] font-medium tracking-[0.15em] uppercase">
                      {product.badge}
                    </div>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <motion.button
                      initial={{ y: 20, opacity: 0 }}
                      animate={
                        hoveredProduct === product.id
                          ? { y: 0, opacity: 1 }
                          : { y: 20, opacity: 0 }
                      }
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="w-12 h-12 bg-white/95 flex items-center justify-center text-foreground hover:bg-white transition-colors duration-300 cursor-pointer"
                      aria-label={`Ver detalles de ${product.name}`}
                    >
                      <Eye size={18} strokeWidth={1.5} />
                    </motion.button>
                    <motion.button
                      initial={{ y: 20, opacity: 0 }}
                      animate={
                        hoveredProduct === product.id
                          ? { y: 0, opacity: 1 }
                          : { y: 20, opacity: 0 }
                      }
                      transition={{
                        duration: 0.3,
                        delay: 0.05,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="w-12 h-12 bg-white/95 flex items-center justify-center text-foreground hover:bg-white transition-colors duration-300 cursor-pointer"
                      aria-label={`Agregar ${product.name} a favoritos`}
                    >
                      <Heart size={18} strokeWidth={1.5} />
                    </motion.button>
                  </div>

                  {/* Quick View Bar */}
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={
                      hoveredProduct === product.id ? { y: 0 } : { y: "100%" }
                    }
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute bottom-0 left-0 right-0 bg-foreground text-white py-3 px-4"
                  >
                    <span className="font-body text-[10px] font-medium tracking-[0.15em] uppercase">
                      Vista rápida
                    </span>
                  </motion.div>
                </div>

                {/* Product Info */}
                <div className="text-center">
                  <span className="font-body text-[10px] font-medium tracking-[0.2em] uppercase text-primary block mb-2">
                    {product.category}
                  </span>
                  <h3 className="font-heading text-xl font-light text-heading mb-2 group-hover:text-primary transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="font-body text-base font-medium text-foreground">
                    {product.price}
                  </p>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16"
        >
          <button className="btn-outline">
            Ver Todo el Catálogo
          </button>
        </motion.div>
      </div>
    </section>
  );
};
