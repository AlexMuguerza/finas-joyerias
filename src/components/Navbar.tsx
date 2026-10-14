"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo-sin-fondo.png";
import { AccountNav } from "@/components/account-nav";
import { CartButton } from "@/components/cart-button";
import {
	MobileNavAnchorLink,
	MobileNavMenu,
} from "@/components/mobile-nav-menu";

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#colecciones", label: "Colecciones" },
  { href: "#productos", label: "Productos" },
  { href: "#nuestra-historia", label: "Nuestra Historia" },
  { href: "#contacto", label: "Contacto" },
];

const DESKTOP_QUERY = "(min-width: 1024px)";

/**
 * Barra de navegación de la landing. Comparte el overlay móvil con la tienda a
 * través de `MobileNavMenu`.
 *
 * Lo propio de esta barra son las anclas a secciones (`#colecciones`) con su
 * resaltado por scroll-spy, la entrada animada con framer-motion y el fondo
 * `glass` al hacer scroll.
 *
 * Antes el menú móvil llevaba su propio overlay, con dos consecuencias
 * visibles: aparecía **el botón de cerrar duplicado** (este toggle cambiaba a
 * "X" mientras el overlay tenía además su propio "X" en `top-6 right-6`, justo
 * encima) y el orden de los botones quedaba invertido respecto a la tienda.
 * El overlay manual además arrastraba los mismos fallos de móvil que el de la
 * tienda: sin trampa de foco, sin Escape, sin `aria-modal`, con el scroll
 * bloqueado sin liberarse al rotar a horizontal y con objetivos táctiles de
 * 26px.
 */
export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("#inicio");
  // El menú solo existe en la landing, así que no hace falta guardar la ruta
  // para cerrarlo al navegar (como sí hacía falta en `ShopHeader`, que vive en
  // varias páginas).
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections = navLinks.map((link) => link.href.replace("#", ""));
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(`#${sections[i]}`);
            break;
          }
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cierra al cruzar a escritorio. El overlay es `lg:hidden`, así que al rotar
  // el móvil o redimensionar la ventana el menú se volvería invisible pero el
  // bloqueo de scroll seguiría activo: la página se quedaría sin poder
  // desplazarse, sin ninguna pista visual de por qué.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMobileMenuOpen(false);
    };
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  const scrollToSection = (href: string) => {
    const sectionId = href.replace("#", "");
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.getBoundingClientRect().top + window.scrollY,
        behavior: "smooth",
      });
    }
    // El cierre del diálogo lo hace `MobileNavAnchorLink` (es un
    // `Dialog.Close`); aquí solo falta el scroll.
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,padding] duration-300 ${
          isScrolled
            ? "glass shadow-soft py-4"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="relative z-10"
            aria-label="Finas Joyería - Inicio"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={logo}
                alt="Finas Joyería"
                className="h-10 md:h-12 w-auto"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center gap-10"
            role="navigation"
            aria-label="Navegación principal"
          >
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className={`relative font-body text-[11px] font-medium tracking-[0.15em] uppercase transition-colors duration-300 cursor-pointer ${
                  activeSection === link.href
                    ? "text-primary"
                    : "text-text-body hover:text-foreground"
                }`}
                aria-current={activeSection === link.href ? "page" : undefined}
              >
                {link.label}
                {activeSection === link.href && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-primary"
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <AccountNav />
            <CartButton />
          </div>

          {/* Mobile Actions. Mismo orden que la tienda: carrito y luego
              hamburguesa. */}
          <div className="lg:hidden flex items-center gap-2">
            <CartButton className="text-foreground" />
            <button
              type="button"
              className="flex h-11 w-11 cursor-pointer items-center justify-center text-foreground transition-colors duration-300 hover:text-primary"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isMobileMenuOpen}
            >
              {/* Solo hamburguesa: con el menú abierto el overlay (z-60) tapa
                  el header, así que el estado "cerrando" nunca se ve. El
                  cierre vive en el propio overlay. */}
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.header>

      <MobileNavMenu
        open={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
        label="Menú principal"
        navLabel="Navegación móvil"
      >
        {navLinks.map((link, index) => (
          <MobileNavAnchorLink
            key={link.href}
            index={index}
            isActive={activeSection === link.href}
            onSelect={() => scrollToSection(link.href)}
          >
            {link.label}
          </MobileNavAnchorLink>
        ))}

        <div className="mt-6 flex flex-col items-center gap-6">
          <AccountNav
            variant="mobile"
            onNavigate={() => setIsMobileMenuOpen(false)}
          />
          <CartButton
            className="py-2 text-foreground"
            onNavigate={() => setIsMobileMenuOpen(false)}
          />
        </div>
      </MobileNavMenu>
    </>
  );
};
