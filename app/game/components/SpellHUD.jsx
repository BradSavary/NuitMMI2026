"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/**
 * SpellHUD - Affiche le sort détecté en bas à gauche
 * - Affiche le nom du sort et son icône
 * - Disparaît après 5 secondes sans détection
 * - Clignote quand prêt à être lancé
 * - Affiche le cooldown des sorts
 */
export default function SpellHUD({ detectedSpell, onSpellReady, spellCooldown = false }) {
  const [showSpell, setShowSpell] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  // Mapping des gestes vers les sorts
  const spellMapping = {
    circle: {
      name: "Fireball",
      icon: "/spell/fire/particle.svg",
      element: "fire",
      description: "Boule de feu destructrice",
      pose: "fireball"
    },
    horizontalLine: {
      name: "IceArrow",
      icon: "/spell/ice/particule.svg",
      element: "ice",
      description: "Flèche de glace perçante",
      pose: "ice"
    },
    verticalLine: {
      name: "Earthquake",
      icon: "/spell/ground/particule.svg",
      element: "earth",
      description: "Tremblement de terre dévastateur",
      pose: "terre"
    },
    fistRaised: {
      name: "Shield",
      icon: "/spell/shield/spell.png",
      element: "shield",
      description: "Bouclier protecteur",
      pose: "shield",
      isDefensive: true // Marquer comme sort défensif
    }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectedSpell]);

  if (!showSpell || !detectedSpell) return null;

  const spell = spellMapping[detectedSpell];
  if (!spell) return null;

  // Configuration des couleurs selon l'élément
  const colorConfig = {
    fire: {
      bgGradient: 'from-orange-900/90 to-red-900/90',
      border: 'border-orange-500',
      iconBg: 'bg-orange-500/20',
      iconBorder: 'border-orange-400',
      iconShadow: 'drop-shadow-[0_0_10px_rgba(255,165,0,0.8)]',
      textColor: 'text-orange-200',
      textAccent: 'text-orange-300',
      barBg: 'bg-orange-950',
      barGradient: 'from-orange-400 to-red-500'
    },
    ice: {
      bgGradient: 'from-cyan-900/90 to-blue-900/90',
      border: 'border-cyan-500',
      iconBg: 'bg-cyan-500/20',
      iconBorder: 'border-cyan-400',
      iconShadow: 'drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]',
      textColor: 'text-cyan-200',
      textAccent: 'text-cyan-300',
      barBg: 'bg-cyan-950',
      barGradient: 'from-cyan-400 to-blue-500'
    },
    earth: {
      bgGradient: 'from-green-900/90 to-emerald-900/90',
      border: 'border-green-500',
      iconBg: 'bg-green-500/20',
      iconBorder: 'border-green-400',
      iconShadow: 'drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]',
      textColor: 'text-green-200',
      textAccent: 'text-green-300',
      barBg: 'bg-green-950',
      barGradient: 'from-green-400 to-emerald-500'
    },
    shield: {
      bgGradient: 'from-purple-900/90 to-indigo-900/90',
      border: 'border-purple-500',
      iconBg: 'bg-purple-500/20',
      iconBorder: 'border-purple-400',
      iconShadow: 'drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]',
      textColor: 'text-purple-200',
      textAccent: 'text-purple-300',
      barBg: 'bg-purple-950',
      barGradient: 'from-purple-400 to-indigo-500'
    }
  };

  const colors = colorConfig[spell.element] || colorConfig.fire;

  return (
    <div className="absolute bottom-8 left-8 z-30">
      <div
        className={`
          bg-linear-to-br ${colors.bgGradient}
          backdrop-blur-md border-2 ${colors.border}
          rounded-xl p-4 shadow-2xl
          transition-all duration-300
          ${isPulsing ? 'animate-pulse scale-105' : 'scale-100'}
        `}
      >
        {/* Icône du sort */}
        <div className="flex items-center gap-4">
          <div className={`relative w-16 h-16 ${colors.iconBg} rounded-lg p-2 border ${colors.iconBorder}`}>
            <Image
              src={spell.icon}
              alt={spell.name}
              fill
              className={`object-contain ${colors.iconShadow}`}
            />
          </div>

          {/* Info du sort */}
          <div className="flex flex-col">
            <h3 className="text-xl font-bold text-white drop-shadow-lg pixel-font">
              {spell.name}
            </h3>
            <p className={`text-sm ${colors.textColor} opacity-90`}>
              {spell.description}
            </p>
            {spellCooldown ? (
              <p className="text-xs text-red-400 mt-1 font-semibold">
                ⏳ Cooldown actif...
              </p>
            ) : (
              <p className={`text-xs ${colors.textAccent} mt-1 font-semibold animate-pulse`}>
                Appuyez sur [ESPACE] pour lancer
              </p>
            )}
          </div>
        </div>

        {/* Barre de temps restant */}
        <div className={`mt-3 h-1 ${colors.barBg} rounded-full overflow-hidden`}>
          <div
            className={`h-full bg-linear-to-r ${colors.barGradient}`}
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
