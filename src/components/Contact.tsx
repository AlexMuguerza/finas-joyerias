"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Mail, Clock, Send, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
	WHATSAPP_DISPLAY,
	whatsappContactUrl,
	whatsappUrl,
} from "@/lib/whatsapp";

// Nota: el número y el correo salen de las constantes del negocio.
// `WHATSAPP_DISPLAY` y `whatsappUrl()` comparten `WHATSAPP_NUMBER` (ver
// `src/lib/whatsapp.ts`), así que el teléfono que ve el visitante y el que
// recibe el mensaje nunca se desincronizan.
const BUSINESS_EMAIL = "info@finasjoyeria.com";

const contactInfo = [
	{
		icon: MapPin,
		title: "Visítanos",
		details: ["Av. La Marina 2020", "San Isidro, Lima - Perú"],
	},
	{
		icon: MessageCircle,
		title: "Escríbenos",
		details: [WHATSAPP_DISPLAY],
		href: whatsappUrl("Hola, me gustaría hacer una consulta sobre joyería."),
	},
	{
		icon: Mail,
		title: "Correo",
		details: [BUSINESS_EMAIL],
		href: `mailto:${BUSINESS_EMAIL}`,
	},
	{
		icon: Clock,
		title: "Horario",
		details: ["Lun - Vie: 10:00 - 20:00", "Sáb: 10:00 - 18:00"],
	},
];

export const Contact = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(containerRef, { once: true, margin: "-100px" });
	const [formState, setFormState] = useState({
		name: "",
		email: "",
		phone: "",
		message: "",
	});

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		const name = formState.name.trim();
		const message = formState.message.trim();
		if (!name || !message) {
			toast.error("Completa tu nombre y tu mensaje.");
			return;
		}

		// La tienda vende por WhatsApp: el formulario entrega el mensaje ya
		// escrito en lugar de guardarlo en un backend que no existe (los
		// leads se perdían con el antiguo `console.log`).
		const url = whatsappContactUrl({
			name,
			email: formState.email.trim() || undefined,
			phone: formState.phone.trim() || undefined,
			message,
		});

		window.open(url, "_blank", "noopener,noreferrer");
		toast.success("Abrimos WhatsApp con tu consulta. Te responderemos enseguida.");

		setFormState({ name: "", email: "", phone: "", message: "" });
	}

  return (
    <section
      id="contacto"
      ref={containerRef}
      className="section-padding bg-white"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <span className="font-body text-eyebrow font-medium tracking-eyebrow uppercase text-primary-strong block mb-4">
            Contáctanos
          </span>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-light text-heading mb-6">
            Estamos <span className="italic text-primary-strong">para ti</span>
          </h2>
          <div className="w-16 h-px bg-gold mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="input-luxury">
                <input
                  type="text"
                  id="name"
                  placeholder=" "
                  value={formState.name}
                  onChange={(e) =>
                    setFormState({ ...formState, name: e.target.value })
                  }
                  required
                />
                <label htmlFor="name">Nombre completo</label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="input-luxury">
                  <input
                    type="email"
                    id="email"
                    placeholder=" "
                    value={formState.email}
                    onChange={(e) =>
                      setFormState({ ...formState, email: e.target.value })
                    }
                    required
                  />
                  <label htmlFor="email">Correo electrónico</label>
                </div>
                <div className="input-luxury">
                  <input
                    type="tel"
                    id="phone"
                    placeholder=" "
                    value={formState.phone}
                    onChange={(e) =>
                      setFormState({ ...formState, phone: e.target.value })
                    }
                  />
                  <label htmlFor="phone">Teléfono</label>
                </div>
              </div>

              <div className="input-luxury">
                <textarea
                  id="message"
                  rows={4}
                  placeholder=" "
                  value={formState.message}
                  onChange={(e) =>
                    setFormState({ ...formState, message: e.target.value })
                  }
                  required
                />
                <label htmlFor="message">Tu mensaje</label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="btn-premium w-full sm:w-auto flex items-center justify-center gap-3 cursor-pointer"
              >
                <Send size={14} strokeWidth={1.5} />
                <span>Enviar Mensaje</span>
              </motion.button>
              <p className="font-body text-xs text-muted-foreground">
                Te llevamos la consulta a WhatsApp con el mensaje ya escrito.
              </p>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  delay: 0.5 + index * 0.1,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex gap-6 group"
              >
                <div className="w-14 h-14 bg-soft-pink flex items-center justify-center flex-shrink-0 group-hover:bg-primary-strong transition-colors duration-300">
                  <info.icon
                    size={20}
                    strokeWidth={1.5}
                    className="text-primary-strong group-hover:text-white transition-colors duration-300"
                  />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-light text-heading mb-2">
                    {info.title}
                  </h3>
                  {info.details.map((detail, i) =>
                    info.href ? (
                      <a
                        key={i}
                        href={info.href}
                        target={info.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          info.href.startsWith("http")
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className="block font-body text-sm text-text-body transition-colors duration-300 hover:text-primary-strong"
                      >
                        {detail}
                      </a>
                    ) : (
                      <p key={i} className="font-body text-sm text-text-body">
                        {detail}
                      </p>
                    )
                  )}
                </div>
              </motion.div>
            ))}

            {/* Map Placeholder */}
            {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="relative aspect-[4/3] bg-soft-pink overflow-hidden mt-10"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={32} strokeWidth={1} className="text-primary-strong mx-auto mb-4" />
                  <p className="font-body text-sm text-text-body">
                    San Isidro, Lima - Perú
                  </p>
                </div>
              </div>
              
              <div className="absolute inset-4 border border-primary/20 pointer-events-none" />
            </motion.div> */}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
