"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo-sin-fondo.png";

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#colecciones", label: "Colecciones" },
  { href: "#productos", label: "Productos" },
  { href: "#nuestra-historia", label: "Nuestra Historia" },
  { href: "#contacto", label: "Contacto" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#inicio");

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

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const sectionId = href.replace("#", "");
    const section = document.getElementById(sectionId);
    if (section) {
      const offset = 0;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
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
          <nav className="hidden lg:flex items-center gap-10" role="navigation" aria-label="Navegación principal">
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
            <button
              className="text-text-body hover:text-foreground transition-colors duration-300 cursor-pointer"
              aria-label="Buscar"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <button
              className="text-text-body hover:text-foreground transition-colors duration-300 cursor-pointer"
              aria-label="Favoritos"
            >
              <Heart size={18} strokeWidth={1.5} />
            </button>
            <button
              className="relative text-text-body hover:text-foreground transition-colors duration-300 cursor-pointer"
              aria-label="Carrito de compras"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[9px] font-medium rounded-full flex items-center justify-center">
                0
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden relative z-10 text-foreground cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-cream lg:hidden"
          >
            <nav className="flex flex-col items-center justify-center h-full gap-8" role="navigation" aria-label="Navegación móvil">
              {navLinks.map((link, i) => (
                <motion.button
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  onClick={() => scrollToSection(link.href)}
                  className="font-heading text-3xl text-foreground hover:text-primary transition-colors duration-300 cursor-pointer"
                >
                  {link.label}
                </motion.button>
              ))}

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-8 mt-8"
              >
                <button
                  className="text-text-body hover:text-foreground transition-colors duration-300 cursor-pointer"
                  aria-label="Buscar"
                >
                  <Search size={20} strokeWidth={1.5} />
                </button>
                <button
                  className="text-text-body hover:text-foreground transition-colors duration-300 cursor-pointer"
                  aria-label="Favoritos"
                >
                  <Heart size={20} strokeWidth={1.5} />
                </button>
                <button
                  className="relative text-text-body hover:text-foreground transition-colors duration-300 cursor-pointer"
                  aria-label="Carrito de compras"
                >
                  <ShoppingBag size={20} strokeWidth={1.5} />
                </button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
