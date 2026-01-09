"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Game() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const menuItems = [
    { label: "Continue", action: () => router.push("/game/level/1") },
    { label: "New game", action: () => router.push("/game/level/1") },
    { label: "Exit", action: () => router.push("/") },
  ];

  // Gestion du clavier
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "z") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1));
      } else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0));
            } else if (
        e.key === "Enter" ||
        e.key === " " ||
        e.key === "Spacebar" ||
        e.code === "Space"
            ) {
        e.preventDefault();
        menuItems[selectedIndex].action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, router]);

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col relative"
      style={{ 
        backgroundImage: "url('/bg/BG-home.png')",
      }}
    >
      {/* Overlay pour assombrir légèrement le fond */}
      <div className="absolute inset-0 bg-black/20 z-0"></div>

      {/* Contenu */}
      <div className="relative z-10 flex flex-col h-screen">
        {/* Titre en haut */}
        <div className="flex-none pt-12 pl-20 pb-8">
          <h1 
            className="text-8xl font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: "var(--font-pixelify-sans)" }}
          >
            Wizard Quest
          </h1>
        </div>

        {/* Menu à gauche */}
        <div className="flex-1 flex items-center pl-20">
          <div className="flex flex-col gap-6">
            {menuItems.map((item, index) => (
              <button
                key={item.label}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`
                  text-left text-4xl font-bold transition-all duration-200
                  ${selectedIndex === index 
                    ? "text-white scale-110 translate-x-4" 
                    : "text-white/70 hover:text-white/90"
                  }
                `}
                style={{ 
                  fontFamily: "var(--font-pixelify-sans)",
                  textShadow: selectedIndex === index 
                    ? "0 0 20px rgba(255,255,255,0.8), 0 4px 8px rgba(0,0,0,0.8)"
                    : "0 4px 8px rgba(0,0,0,0.8)"
                }}
              >
                {selectedIndex === index && (
                  <span className="inline-block mr-4 animate-pulse">▶</span>
                )}
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Silhouette du ninja (bas de l'écran) */}
        <div className="flex-none pb-8 text-center text-xs text-white/50">
          Use ↑↓ arrows and Enter to navigate
        </div>
      </div>
    </div>
  );
}
