"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Preloader } from "@/components/Preloader";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Categories } from "@/components/Categories";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { Lifestyle } from "@/components/Lifestyle";
import { BrandStory } from "@/components/BrandStory";
import { CTA } from "@/components/CTA";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <AnimatePresence>
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Navbar />
        <Hero />
        <Marquee />
        <Categories />
        <FeaturedProducts />
        <Lifestyle />
        <BrandStory />
        <CTA />
        <Contact />
        <Footer />
      </motion.main>
    </>
  );
}
