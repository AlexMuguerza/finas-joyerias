"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Phone, Clock, Mail } from "lucide-react";

const WHATSAPP_NUMBER = "51962792303";

export const ContactSection = () => {
  const [message, setMessage] = useState("");

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(
      message || "Hola, me gustaría recibir información sobre sus joyas."
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
  };

  return (
    <section id="contacto" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <p className="text-primary text-xs sm:text-sm font-medium tracking-widest uppercase mb-3 sm:mb-4">
              Contacto
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-text-heading mb-4">
              ¿Cómo podemos ayudarte?
            </h2>
            <p className="text-text-body text-sm sm:text-base">
              Escríbenos y te responderemos lo antes posible a través de WhatsApp.
            </p>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-6 sm:p-8 lg:p-10 rounded-2xl border border-border shadow-sm"
          >
            {/* Text Input */}
            <div className="mb-5 sm:mb-6">
              <label htmlFor="whatsapp-message" className="block text-sm font-medium text-text-heading mb-2">
                Tu mensaje
              </label>
              <textarea
                id="whatsapp-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Cuéntanos cómo podemos ayudarte..."
                rows={4}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 bg-cream border border-border rounded-xl text-text-heading placeholder-text-body/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none text-sm sm:text-base"
              />
            </div>

            {/* WhatsApp Button */}
            <button
              onClick={handleWhatsAppClick}
              className="w-full py-3 sm:py-4 bg-[#25D366] hover:bg-[#20BD5C] text-white font-medium rounded-xl flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-[#25D366]/30 text-sm sm:text-base"
            >
              <MessageCircle size={20} />
              Enviar por WhatsApp
              <Send size={16} />
            </button>

            {/* Info */}
            <p className="text-center text-xs sm:text-sm text-text-body/60 mt-4 sm:mt-6">
              Responderemos en menos de 24 horas
            </p>
          </motion.div>

          {/* Contact Info - Mobile First */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center"
          >
            <div className="p-4 sm:p-6 bg-cream rounded-xl">
              <Phone size={20} className="text-primary mx-auto mb-2" />
              <p className="text-xs text-text-body/60 mb-1">Teléfono</p>
              <p className="text-text-heading font-medium text-sm">+51 962 792 303</p>
            </div>
            <div className="p-4 sm:p-6 bg-cream rounded-xl">
              <Clock size={20} className="text-primary mx-auto mb-2" />
              <p className="text-xs text-text-body/60 mb-1">Horario</p>
              <p className="text-text-heading font-medium text-sm">Lun - Sáb: 9am - 7pm</p>
            </div>
            <div className="p-4 sm:p-6 bg-cream rounded-xl">
              <Mail size={20} className="text-primary mx-auto mb-2" />
              <p className="text-xs text-text-body/60 mb-1">Email</p>
              <p className="text-text-heading font-medium text-sm">hola@finas.pe</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
