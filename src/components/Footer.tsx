"use client";

import { motion } from "framer-motion";
import { ArrowUp, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo-sin-fondo.png";
import { WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/whatsapp";

const WHATSAPP_FALLBACK_MESSAGE =
	"Hola, quiero recibir las novedades de Finas Joyería.";

const WHATSAPP_GENERIC_HREF = whatsappUrl(WHATSAPP_FALLBACK_MESSAGE);

// Nota: "Ayuda" (tallas, envíos, devoluciones, FAQ) y los textos legales se
// eliminaron del footer. Apuntaban a `/#contacto` o a `href="#"`, es decir,
// prometían contenido que no existía. Cuando estén las páginas reales, se
// reincorporan con su href definitivo.
const footerLinks: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Colecciones",
    links: [
      { label: "Ver colecciones", href: "/categorias" },
      { label: "Catálogo completo", href: "/shop" },
      { label: "Novedades", href: "/shop?featured=1" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Nuestra Historia", href: "/#nuestra-historia" },
      { label: "Contacto", href: "/#contacto" },
    ],
  },
  {
    title: "Comprar",
    links: [
      { label: "Mi carrito", href: "/carrito" },
      { label: "Pedir por WhatsApp", href: WHATSAPP_GENERIC_HREF },
    ],
  },
];

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-white relative">
      {/* CTA de WhatsApp: sustituye al "newsletter" anterior, que pedía el
          correo y lo descartaba (el botón no tenía acción y no había backend
          ni servicio de correo). Ahora la captación llega por el canal que la
          tienda realmente usa. */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-heading text-3xl md:text-4xl font-light mb-4">
                Escríbenos a <span className="italic text-primary-light">Finas</span>
              </h3>
              <p className="font-body text-sm text-white/60 max-w-md">
                ¿Dudas sobre una pieza, materiales o medidas? Te respondemos
                personalmente por WhatsApp, {WHATSAPP_DISPLAY}.
              </p>
            </div>
            <div className="flex justify-start lg:justify-end">
              <a
                href={WHATSAPP_GENERIC_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-premium inline-flex items-center gap-3 whitespace-nowrap"
              >
                <MessageCircle size={16} strokeWidth={1.5} />
                Escríbenos por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6" aria-label="Finas Joyería - Inicio">
              <Image
                src={logo}
                alt="Finas Joyería"
                // Sin props `width`/`height`: Next toma el tamaño intrínseco del
                // import estático para los atributos. Fijarlos aquí provocaba el
                // warning de next/image, porque `height={40}` coincidía
                // exactamente con `h-10` (40px): la altura renderizada no
                // "modificaba" nada y solo se detectaba el cambio en la anchura.
                className="h-10 w-auto opacity-80 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="font-body text-sm text-white/60 mb-8 max-w-sm leading-relaxed">
              Joyería fina y exclusiva que cuenta historias. Cada pieza es
              diseñada con pasión y creada con los materiales más finos del mundo.
            </p>
            <a
              href={WHATSAPP_GENERIC_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm text-white/60 transition-colors duration-300 hover:text-white"
            >
              <MessageCircle size={16} strokeWidth={1.5} />
              {WHATSAPP_DISPLAY}
            </a>
          </div>

          {/* Link Columns */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-heading text-lg font-light mb-6">{group.title}</h4>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("http") ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-sm text-white/50 hover:text-white transition-colors duration-300"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-body text-sm text-white/50 hover:text-white transition-colors duration-300"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <p className="font-body text-[11px] text-white/40">
              © {new Date().getFullYear()} Finas Joyería. Todos los derechos
              reservados.
            </p>
            <a
              href={WHATSAPP_GENERIC_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-[11px] text-white/40 hover:text-white/70 transition-colors duration-300"
            >
              Términos, envíos y devoluciones
            </a>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-primary text-white flex items-center justify-center shadow-medium hover:bg-primary-hover transition-all duration-300 z-40 cursor-pointer"
        aria-label="Volver arriba"
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowUp size={18} strokeWidth={1.5} />
      </motion.button>
    </footer>
  );
};
