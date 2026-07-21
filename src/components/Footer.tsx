"use client";

import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo-sin-fondo.png";

const footerLinks = {
  Colecciones: [
    { label: "Collares", href: "#" },
    { label: "Anillos", href: "#" },
    { label: "Aretes", href: "#" },
    { label: "Pulseras", href: "#" },
    { label: "Sets", href: "#" },
  ],
  Empresa: [
    { label: "Nuestra Historia", href: "#nuestra-historia" },
    { label: "Artesanos", href: "#" },
    { label: "Materiales", href: "#" },
    { label: "Sostenibilidad", href: "#" },
  ],
  Ayuda: [
    { label: "Guía de Tallas", href: "#" },
    { label: "Cuidado de Joyas", href: "#" },
    { label: "Envíos y Entregas", href: "#" },
    { label: "Devoluciones", href: "#" },
    { label: "FAQ", href: "#" },
  ],
};

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 4L10.5 13.5L4 20H6L11.5 14.5L16 20H20L13.2 10L19.5 4H17.5L12.5 9L8 4H4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.54 6.42C22.4212 5.94541 22.1793 5.51057 21.8387 5.15941C21.498 4.80824 21.0708 4.55318 20.6 4.42C18.88 4 12 4 12 4C12 4 5.12 4 3.4 4.46C2.92925 4.55318 2.50198 4.80824 2.16135 5.15941C1.82072 5.51057 1.57879 5.94541 1.46 6.42C1.14521 8.18557 0.991227 9.97637 1 11.77C0.988687 13.5722 1.14266 15.3743 1.46 17.14C1.57879 17.6006 1.82072 18.0398 2.16135 18.3958C2.50198 18.7518 2.92925 19.0116 3.4 19.11C5.12 19.56 12 19.56 12 19.56C12 19.56 18.88 19.56 20.6 19.1C21.0708 18.9668 21.498 18.7118 21.8387 18.3606C22.1793 18.0094 22.4212 17.5746 22.54 17.1C22.8523 15.3422 23.0068 13.5601 23 11.77C23.0113 9.96757 22.8573 8.16428 22.54 6.42Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <polygon points="9.75,15.02 15.5,11.75 9.75,8.48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-white relative">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="font-heading text-3xl md:text-4xl font-light mb-4">
                Únete a <span className="italic text-primary-light">Finas</span>
              </h3>
              <p className="font-body text-sm text-white/60 max-w-md">
                Suscríbete para recibir primero nuestras nuevas colecciones,
                ofertas exclusivas y consejos de estilo.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-6 py-4 bg-white/5 border border-white/10 text-white font-body text-sm placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors duration-300"
                aria-label="Correo electrónico para newsletter"
              />
              <button className="btn-premium whitespace-nowrap">
                Suscribirme
              </button>
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
                width={100}
                height={40}
                className="h-10 w-auto opacity-80 hover:opacity-100 transition-opacity"
                style={{ width: "auto" }}
              />
            </Link>
            <p className="font-body text-sm text-white/60 mb-8 max-w-sm leading-relaxed">
              Joyería fina y exclusiva que cuenta historias. Cada pieza es
              diseñada con pasión y creada con los materiales más finos del mundo.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a href="#" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="#" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300" aria-label="Twitter">
                <TwitterIcon />
              </a>
              <a href="#" className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300" aria-label="YouTube">
                <YoutubeIcon />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading text-lg font-light mb-6">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-body text-sm text-white/50 hover:text-white transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body text-[11px] text-white/40">
              © 2025 Finas Joyería. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="font-body text-[11px] text-white/40 hover:text-white/70 transition-colors duration-300"
              >
                Términos y Condiciones
              </Link>
              <Link
                href="#"
                className="font-body text-[11px] text-white/40 hover:text-white/70 transition-colors duration-300"
              >
                Política de Privacidad
              </Link>
            </div>
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
