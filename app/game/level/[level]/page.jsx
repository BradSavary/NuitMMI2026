"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LevelPage({ params }) {
  const { level } = use(params);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [characterFrame, setCharacterFrame] = useState(1);
  const [bgWidth, setBgWidth] = useState(1920);
  const animationRef = useRef(null);
  
  // Vitesse de défilement (pixels par frame)
  const scrollSpeed = 3;

  // Calcul de la largeur du background basé sur la hauteur de l'écran
  useEffect(() => {
    const calculateBgWidth = () => {
      const screenHeight = window.innerHeight;
      // Ratio original des images : 1920/1080 = 16/9
      const bgRatio = 1920 / 1080;
      const calculatedWidth = Math.ceil(screenHeight * bgRatio);
      setBgWidth(calculatedWidth);
    };

    calculateBgWidth();
    window.addEventListener('resize', calculateBgWidth);
    return () => window.removeEventListener('resize', calculateBgWidth);
  }, []);

  // Animation du background qui défile
  useEffect(() => {
    if (isPaused) return;

    const animate = () => {
      setScrollPosition((prev) => {
        // Réinitialiser la position quand on a parcouru 2 backgrounds (pour la boucle infinie)
        const newPos = prev + scrollSpeed;
        return newPos >= bgWidth * 2 ? newPos - bgWidth * 2 : newPos;
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPaused, scrollSpeed, bgWidth]);

  // Animation du personnage (alternance des poses)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCharacterFrame((prev) => (prev === 1 ? 2 : 1));
    }, 300); // Change de frame toutes les 300ms

    return () => clearInterval(interval);
  }, [isPaused]);

  // Gestion de la pause avec Échap
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Container du jeu */}
      <div className="relative w-full h-full">
        {/* Backgrounds défilants - 4 images pour assurer la continuité */}
        <div className="absolute inset-0">
          {[0, 1, 2, 3].map((index) => {
            // Calcule la position de chaque background (arrondie pour éviter les gaps)
            const position = Math.floor(index * bgWidth - scrollPosition);
            
            return (
              <div
                key={index}
                className="absolute top-0 left-0"
                style={{
                  transform: `translateX(${position}px)`,
                  height: "100vh",
                  width: `${bgWidth + 1}px`, // +1px pour éviter les micro-gaps
                }}
              >
                {/* Alterne entre BG-1 et BG-2 */}
                <Image
                  src={index % 2 === 0 ? "/bg/BG-1.png" : "/bg/BG-2.png"}
                  alt={`Background ${index % 2 + 1}`}
                  fill
                  className="object-cover"
                  priority={index < 2}
                />
              </div>
            );
          })}
        </div>

        {/* Le personnage (fixe sur le sol à gauche de l'écran) */}
        <div className="absolute left-[5%] bottom-[14%] z-10">
          <div className="relative w-32 h-32 md:w-48 md:h-48">
            <Image
              src={`/MC/MC-pose-neutral-${characterFrame}.svg`}
              alt="Main Character"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Interface overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            {/* Info du niveau */}
            <div className="text-white">
              <h2 className="text-2xl font-bold">Niveau {level}</h2>
              <p className="text-sm opacity-75">Exploration en cours...</p>
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-4 py-2 bg-slate-700/80 hover:bg-slate-600 text-white rounded-lg transition-colors backdrop-blur-sm"
              >
                {isPaused ? "▶️ Reprendre" : "⏸️ Pause"}
              </button>
              <Link
                href="/game"
                className="px-4 py-2 bg-red-700/80 hover:bg-red-600 text-white rounded-lg transition-colors backdrop-blur-sm"
              >
                ❌ Quitter
              </Link>
            </div>
          </div>
        </div>

        {/* Menu Pause (overlay complet) */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex items-center justify-center">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-purple-500">
              <h2 className="text-4xl font-bold text-white text-center mb-6">
                ⏸️ PAUSE
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => setIsPaused(false)}
                  className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors text-lg"
                >
                  ▶️ Continuer
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors"
                >
                  🔄 Recommencer
                </button>
                
                <Link
                  href="/game"
                  className="block w-full px-6 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors text-center"
                >
                  🏠 Menu Principal
                </Link>
              </div>

              <p className="text-gray-400 text-center mt-6 text-sm">
                Appuyez sur <kbd className="px-2 py-1 bg-slate-700 rounded">Échap</kbd> pour reprendre
              </p>
            </div>
          </div>
        )}

        {/* Instructions en bas */}
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center">
          <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full text-white text-sm">
            <span className="opacity-75">Appuyez sur</span>{" "}
            <kbd className="px-2 py-1 bg-slate-700 rounded mx-1">Échap</kbd>{" "}
            <span className="opacity-75">pour mettre en pause</span>
          </div>
        </div>
      </div>
    </div>
  );
}
