"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * SpellHUD - Affiche le sort détecté en bas à gauche
 * - Affiche le nom du sort et son icône
 * - Disparaît après 5 secondes sans détection
 * - Clignote quand prêt à être lancé
 */
export default function SpellHUD({ detectedSpell, onSpellReady }) {
  const [showSpell, setShowSpell] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  // Mapping des gestes vers les sorts
  const spellMapping = {
    circle: {
      name: "Fireball",
      icon: "/spell/fire/particle.svg",
      element: "fire",
      description: "Boule de feu destructrice"
    }
    // Ajouter d'autres sorts ici plus tard
  };

  useEffect(() => {
    if (detectedSpell && spellMapping[detectedSpell]) {
      setShowSpell(true);
      setIsPulsing(true);
      
      // Notifier que le sort est prêt
      if (onSpellReady) {
        onSpellReady(spellMapping[detectedSpell]);
      }

      // Cacher après 5 secondes
      const timeout = setTimeout(() => {
        setShowSpell(false);
        setIsPulsing(false);
      }, 5000);

      return () => clearTimeout(timeout);
    } else {
      setShowSpell(false);
      setIsPulsing(false);
    }
  }, [detectedSpell, onSpellReady]);

  if (!showSpell || !detectedSpell) return null;

  const spell = spellMapping[detectedSpell];
  if (!spell) return null;

  return (
    <div className="absolute bottom-8 left-8 z-30">
      <div
        className={`
          bg-linear-to-br from-orange-900/90 to-red-900/90 
          backdrop-blur-md border-2 border-orange-500 
          rounded-xl p-4 shadow-2xl
          transition-all duration-300
          ${isPulsing ? 'animate-pulse scale-105' : 'scale-100'}
        `}
      >
        {/* Icône du sort */}
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 bg-orange-500/20 rounded-lg p-2 border border-orange-400">
            <Image
              src={spell.icon}
              alt={spell.name}
              fill
              className="object-contain drop-shadow-[0_0_10px_rgba(255,165,0,0.8)]"
            />
          </div>

          {/* Info du sort */}
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white drop-shadow-lg">
              {spell.name}
            </h3>
            <p className="text-sm text-orange-200 opacity-90">
              {spell.description}
            </p>
            <p className="text-xs text-orange-300 mt-1 font-semibold animate-pulse">
              Appuyez sur [ESPACE] pour lancer
            </p>
          </div>
        </div>

        {/* Barre de temps restant */}
        <div className="mt-3 h-1 bg-orange-950 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-orange-400 to-red-500"
            style={{
              animation: 'shrink 5s linear forwards'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}
