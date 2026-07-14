"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { ImageWithSkeleton } from "./ui/ImageWithSkeleton";
import CollarPerlaClasica from "@/assets/producto-collar-perla-clasica.png";
import AnilloSolitarioOro from "@/assets/producto-anillo-solitario-oro.jpg";
import PulseraCadenaDelicada from "@/assets/producto-pulsera-cadena-delicada.png";
import AretesCascadaRosa from "@/assets/producto-aretes-cascada-rosa.png";
import SetCompletoElegance from "@/assets/producto-set-completo-elegance.png";
import CollarCordonDorado from "@/assets/producto-collar-cordon-dorado.png";
import AnilloCompromisoDiamante from "@/assets/producto-anillo-compromiso.png";
import AretesHojaDeOro from "@/assets/producto-aretes-hoja-oro.png";

const products = [
  {
    id: 1,
    name: "Collar Perla Clásica",
    price: 189,
    originalPrice: 229,
    image: CollarPerlaClasica,
    badge: "Nuevo",
  },
  {
    id: 2,
    name: "Anillo Solitario Oro",
    price: 349,
    image: AnilloSolitarioOro,
    badge: null,
  },
  {
    id: 3,
    name: "Aretes Cascada Rosa",
    price: 129,
    image: AretesCascadaRosa,
    badge: "Popular",
  },
  {
    id: 4,
    name: "Pulsera Cadena Delicada",
    price: 159,
    image: PulseraCadenaDelicada,
    badge: null,
  },
  {
    id: 5,
    name: "Set Completo Elegance",
    price: 499,
    originalPrice: 599,
    image: SetCompletoElegance,
    badge: "Oferta",
  },
  {
    id: 6,
    name: "Collar Cordón Dorado",
    price: 199,
    image: CollarCordonDorado,
    badge: null,
  },
  {
    id: 7,
    name: "Anillo Compromiso Diamante",
    price: 899,
    image: AnilloCompromisoDiamante,
    badge: "Premium",
  },
  {
    id: 8,
    name: "Aretes Hoja de Oro",
    price: 145,
    image: AretesHojaDeOro,
    badge: null,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export const FeaturedProducts = () => {
  return (
    <section id="productos" className="py-16 sm:py-20 lg:py-24 bg-white">
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
            Productos Destacados
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl text-text-heading mb-4">
            Lo más deseado
          </h2>
          <p className="text-text-body text-sm sm:text-base max-w-2xl mx-auto px-4">
            Nuestras piezas más populares, seleccionadas por nuestro equipo de
            expertos para ti.
          </p>
        </motion.div>

        {/* Products Grid - Mobile First */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
        >
          {products.map((product) => (
            <motion.article
              key={product.id}
              variants={item}
              className="group bg-white rounded-xl sm:rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-soft-pink/30">
                <ImageWithSkeleton
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {/* Badge */}
                {product.badge && (
                  <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-3 py-1 bg-primary text-white text-[10px] sm:text-xs font-medium rounded-full z-20">
                    {product.badge}
                  </span>
                )}

                {/* Wishlist Button - Always visible on mobile */}
                <button
                  aria-label={`Agregar ${product.name} a favoritos`}
                  className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 rounded-full flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white z-20"
                >
                  <Heart size={14} />
                </button>

                {/* Quick Add - Always visible on mobile */}
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 sm:translate-y-full sm:group-hover:translate-y-0 transition-transform duration-300 z-20">
                  <button
                    aria-label={`Agregar ${product.name} al carrito`}
                    className="w-full py-2 sm:py-2.5 bg-primary text-white text-xs sm:text-sm font-medium rounded-lg flex items-center justify-center gap-1 sm:gap-2 hover:bg-primary-hover transition-colors"
                  >
                    <ShoppingBag size={14} />
                    <span className="hidden sm:inline">Agregar</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4">
                <h3 className="font-heading text-sm sm:text-base lg:text-lg text-text-heading mb-1 sm:mb-2 group-hover:text-primary transition-colors overflow-hidden text-ellipsis whitespace-nowrap">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-semibold text-text-heading">
                    S/. {product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs sm:text-sm text-text-body/50 line-through">
                      S/. {product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-10 sm:mt-12"
        >
          <a
            href="https://wa.me/51962792303?text=Hola%2C%20me%20gustar%C3%ADa%20ver%20todos%20los%20productos%20disponibles"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border-2 border-border text-text-heading text-sm font-medium rounded-full hover:border-primary hover:text-primary transition-all duration-300"
          >
            Ver todos los productos
          </a>
        </motion.div>
      </div>
    </section>
  );
};
