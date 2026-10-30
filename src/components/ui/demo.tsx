"use client";

import React from "react";
import GlassyCarousel, { type GlassyCarouselItem } from "@/components/ui/glassy-coverflow-carousel";

export const films: GlassyCarouselItem[] = [
  {
    id: "john-wick-chapter-4",
    title: "John Wick: Chapter 4",
    subtitle: "2023 · Action thriller",
    image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
    accent: "#b34b32",
    description: "John Wick takes his fight against the High Table across the world in pursuit of his freedom.",
    trailerUrl: "https://www.youtube.com/watch?v=qEVUtrk8_B4"
  },
  {
    id: "mad-max-fury-road",
    title: "Mad Max: Fury Road",
    subtitle: "2015 · Post-apocalyptic action",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    accent: "#b67c35",
    description: "Max and Furiosa race across the wasteland with a ruthless warlord in pursuit.",
    trailerUrl: "https://www.youtube.com/watch?v=hEJnMQG9ev8"
  },
  {
    id: "mission-impossible-fallout",
    title: "Mission: Impossible - Fallout",
    subtitle: "2018 · Spy action",
    image: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
    accent: "#4d7d96",
    description: "Ethan Hunt and his team race to recover stolen plutonium after a mission goes wrong.",
    trailerUrl: "https://www.youtube.com/watch?v=wb49-oV0F78"
  },
  {
    id: "extraction-2",
    title: "Extraction 2",
    subtitle: "2023 · Action thriller",
    image: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80",
    accent: "#537d83",
    description: "Tyler Rake returns for a dangerous rescue mission to extract a family from a Georgian prison.",
    trailerUrl: "https://www.youtube.com/watch?v=Y274jZs5s7s"
  },
  {
    id: "the-fall-guy",
    title: "The Fall Guy",
    subtitle: "2024 · Action comedy",
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
    accent: "#b45172",
    description: "A stunt performer searches for a missing movie star while trying to save the film and win back its director.",
    trailerUrl: "https://www.youtube.com/watch?v=j7jPnwVGdZ8"
  }
];

const brandTheme = {
  "--color-background": "light-dark(#f5f8ff, #06122d)",
  "--color-foreground": "light-dark(#10244a, #f1f7ff)",
  "--color-card": "light-dark(#ffffff, #101e37)",
  "--color-card-foreground": "light-dark(#10244a, #f1f7ff)",
  "--color-muted-foreground": "light-dark(#49617f, #b7cbee)",
  "--color-border": "light-dark(#c7d3e7, #7891b94d)",
  "--color-primary": "light-dark(#2457d6, #91abff)",
  "--color-primary-foreground": "light-dark(#ffffff, #10244a)",
  "--carousel-shadow-color": "#020817"
} as React.CSSProperties;

const settings = { autoPlay: false, useHostTheme: true };

export default function GlassyCarouselDemo(props: Partial<typeof settings> = {}) {
  const s = { ...settings, ...props };
  return (
    <div style={{ width: "100%", minWidth: 0, alignSelf: "stretch" }}>
      <GlassyCarousel
        items={films}
        layout="poster"
        initialIndex={2}
        autoPlay={s.autoPlay}
        label="Action movie trailers"
        style={{
          ...(s.useHostTheme ? {} : brandTheme),
          "--carousel-font-body": "Inter, sans-serif",
          "--carousel-font-display": "Outfit, sans-serif"
        } as React.CSSProperties}
      />
    </div>
  );
}
