"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

/**
 * BossProjectile - Boule de feu du Dragon Boss
 * - Se déplace vers la gauche (vers le joueur)
 * - Utilise l'image spell.png du dragon
 * - Inflige 2 PV de dégâts
 */
export default function BossProjectile({ id, startX, startY, damage, onDestroy, isPaused = false }) {
  const [position, setPosition] = useState({ x: startX, y: startY });
  const moveSpeed = 7; // Vitesse du projectile

  // Animation du mouvement
  useEffect(() => {
    if (isPaused) return;
    
    let frameId;

    const animate = () => {
      setPosition((prev) => {
        const newX = prev.x - moveSpeed;
        
        // Si le projectile sort de l'écran à gauche, le détruire
        if (newX < -100) {
          setTimeout(() => {
            if (onDestroy) {
              onDestroy(id);
            }
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
  }, [id, onDestroy, isPaused]);

  return (
    <div
      data-projectile-id={id}
      data-projectile-type="boss"
      className="absolute"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -50%)",
        zIndex: 12,
      }}
    >
      <div className="relative w-64 h-64 animate-pulse">
        <Image
          src="/mob/Dragon/spell.png"
          alt="Dragon Fireball"
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
}
