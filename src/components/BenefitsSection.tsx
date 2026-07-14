"use client";

import { motion } from "framer-motion";
import { Truck, RefreshCw, ShieldCheck } from "lucide-react";

const benefits = [
  {
    icon: Truck,
    title: "Envíos a todo el Perú",
    description:
      "Realizamos envíos seguros a cualquier ciudad del país para que recibas tus joyas donde estés.",
  },
  {
    icon: RefreshCw,
    title: "Cambios y devoluciones en 30 días",
    description:
      "Si tu compra no fue lo que esperabas, podrás solicitar un cambio o devolución dentro de los primeros 30 días.",
  },
  {
    icon: ShieldCheck,
    title: "Garantía de satisfacción",
    description:
      "Trabajamos con productos cuidadosamente seleccionados para ofrecerte calidad y confianza en cada compra.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export const BenefitsSection = () => {
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
            Beneficios
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-text-heading mb-4">
            Tu confianza es nuestra prioridad
          </h2>
        </motion.div>

        {/* Benefits Grid - Mobile First (stacked, then 3 columns) */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.title}
              variants={item}
              className="text-center p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl border border-border hover:shadow-lg transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 bg-soft-pink rounded-full flex items-center justify-center">
                <benefit.icon className="text-primary" size={26} strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="font-heading text-lg sm:text-xl text-text-heading mb-3 sm:mb-4">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-text-body text-sm leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
