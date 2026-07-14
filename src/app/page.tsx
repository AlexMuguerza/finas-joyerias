"use client";

import { useState } from "react";
import { Preloader } from "@/components/Preloader";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { CategoriesSection } from "@/components/CategoriesSection";
import { LifestyleSection } from "@/components/LifestyleSection";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { BannerSection } from "@/components/BannerSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      
      <main className={`min-h-screen bg-cream transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <Navbar />
        <HeroSection />
        <CategoriesSection />
        <LifestyleSection />
        <FeaturedProducts />
        <BannerSection />
        <BenefitsSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
}
