"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * TutorialModal - Modale de tutoriel affichant les sorts et les gestes
 * Affiche la liste des sorts disponibles avec les mouvements à effectuer
 */
export default function TutorialModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const spells = [
    {
      name: "Fireball",
      element: "Fire",
      gesture: "Make a circle with your hand",
      description: "Quick fireball projectile",
      damage: "3 PV",
      image: "/MC/MC-pose-fireball.svg",
      color: "text-orange-400"
    },
    {
      name: "Ice Spear",
      element: "Ice",
      gesture: "Make an horizontal line with your hand",
      description: "Freezing ice spear",
      damage: "2 PV",
      image: "/MC/MC-pose-ice.svg",
      color: "text-cyan-400"
    },
    {
      name: "Earthquake",
      element: "Earth",
      gesture: "Make a vertical line with your hand",
      description: "Powerful earthquake",
      damage: "5 PV",
      image: "/MC/MC-pose-terre.svg",
      color: "text-green-400"
    },
    {
      name: "Shield",
      element: "Defense",
      gesture: "Make a fist with your hand",
      description: "Protective shield (1.5s)",
      damage: "Blocks all damage",
      image: "/MC/MC-pose-shield.svg",
      color: "text-purple-400"
    }
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm backdrop-brightness-50">
      <div className="bg-gray-900/95 p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto pixel-border pixel-corners">
        {/* Titre */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-4xl pixel-font font-bold text-white tracking-wider">
            SPELL TUTORIAL
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl pixel-font px-4 py-2"
          >
            ✕
          </button>
        </div>

        {/* Instructions générales */}
        <div className="mb-6 p-4 bg-gray-800/60 pixel-border-sm">
          <p className="text-gray-300 text-center pixel-font text-sm mb-2">
            🎮 HOW TO PLAY
          </p>
          <p className="text-white text-center pixel-font text-xs">
            Put your hands in front of the camera and make the gestures below.
          </p>
          <p className="text-white text-center pixel-font text-xs mt-1">
            Press <span className="text-yellow-400">SPACE</span> to cast the spell once detected.
          </p>
        </div>

        {/* Liste des sorts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spells.map((spell, index) => (
            <div
              key={index}
              className="bg-gray-800/80 p-4 pixel-border-sm hover:bg-gray-700/80 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Image du sort */}
                <div className="relative w-20 h-20 shrink-0">
                  <Image
                    src={spell.image}
                    alt={spell.name}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Détails du sort */}
                <div className="flex-1">
                  <h3 className={`text-xl pixel-font font-bold ${spell.color} mb-1`}>
                    {spell.name}
                  </h3>
                  <p className="text-gray-400 text-xs pixel-font mb-2">
                    {spell.element}
                  </p>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 text-xs pixel-font">👋</span>
                      <p className="text-white text-xs pixel-font">
                        {spell.gesture}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 text-xs pixel-font">⚔️</span>
                      <p className="text-white text-xs pixel-font">
                        {spell.damage}
                      </p>
                    </div>
                    
                    <p className="text-gray-400 text-xs pixel-font italic mt-2">
                      {spell.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Conseils supplémentaires */}
        <div className="mt-6 p-4 bg-blue-900/40 pixel-border-sm">
          <p className="text-blue-300 text-center pixel-font text-xs mb-2">
            💡 Tips
          </p>
          <ul className="text-white text-xs pixel-font space-y-1 text-center">
            <li>• The Shield has a 2-second cooldown</li>
            <li>• Other spells have a 0.3-second cooldown</li>
            <li>• Ghosts are invulnerable to spells</li>
            <li>• Press ESC to pause</li>
          </ul>
        </div>

        {/* Bouton de fermeture */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-purple-600 text-white pixel-button pixel-font cursor-pointer hover:bg-purple-500 transition-colors"
          >
            GOT IT!
          </button>
        </div>
      </div>
    </div>
  );
}
