"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

/**
 * GhostProjectile - Projectile lancé par un Ghost
 * Se déplace de droite à gauche vers le joueur
 * Fait 3 PV de dégâts
 */
export default function GhostProjectile({ 
  startX, 
  startY, 
  onDestroy, 
  id,
  damage = 3,
  speed = 8,
  isPaused = false
}) {
  const [position, setPosition] = useState({ x: startX, y: startY });

  useEffect(() => {
    if (isPaused) return;
    
    let frameId;

    const animate = () => {
      setPosition(prev => {
        const newX = prev.x - speed; // Se déplace vers la gauche
        
        // Détruire le projectile s'il sort de l'écran (côté gauche)
        if (newX < -100) {
          setTimeout(() => {
            if (onDestroy) onDestroy(id);
          }, 0);
          return prev;
        }

        return { x: newX, y: prev.y };
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [id, onDestroy, speed, isPaused]);

  return (
    <div
      className="absolute z-15 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%) scaleX(-1)', // Miroir pour que le sort pointe vers la gauche
      }}
      data-projectile-id={id}
      data-projectile-type="ghost"
      data-damage={damage}
    >
      <div className="relative w-16 h-16">
        <Image
          src="/mob/Ghost/spell.png"
          alt="Ghost Spell"
          fill
          className="object-contain"
        />
        
        {/* Effet de lueur cyan/spectral */}
        <div className="absolute inset-0 animate-pulse">
          <div className="w-full h-full rounded-full bg-cyan-400/40 blur-xl"></div>
        </div>
      </div>
    </div>
  );
}
