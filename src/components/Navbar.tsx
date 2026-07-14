"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { User, ShoppingBag, Menu, X } from "lucide-react";
import Image from "next/image";
import Logo from "@/assets/logo-sin-fondo.png";

const navLinks = [
  { label: "Inicio", href: "#inicio" },
  { label: "Categorías", href: "#categorias" },
  { label: "Productos", href: "#productos" },
  { label: "Contacto", href: "#contacto" },
];

const NAV_OFFSET = 80;

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      const id = href.replace("#", "");
      const el = document.getElementById(id);
      if (!el) return;

      const scrollToTarget = () => {
        const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
        window.scrollTo({ top, behavior: "smooth" });
      };

      if (mobileOpen) {
        setMobileOpen(false);
        // esperamos a que termine la animación de cierre (300ms) antes de scrollear
        setTimeout(scrollToTarget, 320);
      } else {
        scrollToTarget();
      }
    },
    [mobileOpen]
  );

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      style={scrolled ? {
        background: "rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5)",
        borderBottom: "1px solid rgba(255,255,255,0.5)",
      } : undefined}
      className="fixed top-0 left-0 right-0 z-50 py-4 transition-[background,box-shadow] duration-300 ease-out"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center">
            <Image
              src={Logo}
              alt="Finas Joyería"
              width={60}
              height={54}
              className="h-12 w-auto"
              style={{ width: "auto" }}
              priority
            />

            Finas Joyería
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-text-body hover:text-primary transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-3">
            {/* <button
              aria-label="Mi cuenta"
              className="p-2 text-text-body hover:text-primary transition-colors duration-300"
            >
              <User size={20} strokeWidth={1.5} />
            </button>
            <button
              aria-label="Carrito de compras"
              className="p-2 text-text-body hover:text-primary transition-colors duration-300 relative"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
                0
              </span>
            </button> */}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-text-body"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: mobileOpen ? "auto" : 0,
            opacity: mobileOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="md:hidden overflow-hidden"
          aria-hidden={!mobileOpen}
        >
          <div className="py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="block text-sm font-medium text-text-body hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};
