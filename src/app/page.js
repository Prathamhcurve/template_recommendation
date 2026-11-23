"use client";

import Navigation from "@/components/Navigation";
import Showcase, { HeroShowcase } from "@/components/Showcase";

export default function Home() {
  return (
    <main className="gallery-main-wrapper">
      {/* 1. Hero Deck Carousel */}
      <HeroShowcase />

      {/* 2. Library Navigation & Filter Bar */}
      <Navigation />

      {/* 3. Main Netflix-Style Category Rows / Masonry View */}
      <Showcase />
    </main>
  );
}