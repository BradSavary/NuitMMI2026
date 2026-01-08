"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

/**
 * SpellProjectile - Représente un projectile de sort en vol
 * - Anime le déplacement du sort vers la droite
 * - Affiche les particules derrière pour l'effet de vitesse
 * - Se détruit automatiquement après être sorti de l'écran
 */
export default function SpellProjectile({ 
  spell, 
  startX, 
  startY, 
  onDestroy, 
  id 
}) {
  const [position, setPosition] = useState({ x: startX, y: startY });
  const [particles, setParticles] = useState([]);
  const [rotation, setRotation] = useState(0);
  const particleIdCounterRef = useRef(0); // Compteur unique pour les IDs de particules

  // Configuration du sort
  const config = {
    fireball: {
      speed: 12, // pixels par frame
      size: 80,
      particleCount: 8,
      particleSize: 40,
      color: 'orange',
      rotation: true
    }
  };

  const spellConfig = config[spell?.element] || config.fireball;

  useEffect(() => {
    let frameId;

    const animate = () => {
      setPosition(prev => {
        const newX = prev.x + spellConfig.speed;
        
        // Détruire le projectile s'il sort de l'écran
        if (newX > window.innerWidth + 100) {
          // Utiliser setTimeout pour éviter de mettre à jour pendant le render
          setTimeout(() => {
            if (onDestroy) onDestroy(id);
          }, 0);
          return prev;
        }

        // Créer des particules derrière le sort
        if (Math.random() > 0.3) {
          setParticles(prevParticles => {
            const newParticle = {
              id: `${id}-particle-${particleIdCounterRef.current++}`, // ID unique
              x: prev.x - 20,
              y: prev.y + (Math.random() - 0.5) * 30,
              life: 1.0,
              maxLife: 0.5, // Durée de vie de 0.5s au lieu de 1s
              size: spellConfig.particleSize * (0.5 + Math.random() * 0.5),
              velocityX: -2 - Math.random() * 3,
              velocityY: (Math.random() - 0.5) * 2
            };

            // Limiter le nombre de particules
            return [...prevParticles, newParticle].slice(-spellConfig.particleCount);
          });
        }

        return { x: newX, y: prev.y };
      });

      // Rotation du projectile
      if (spellConfig.rotation) {
        setRotation(prev => (prev + 5) % 360);
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [id, onDestroy, spellConfig]);

  // Animation des particules avec requestAnimationFrame au lieu de setInterval
  useEffect(() => {
    let animId;
    let lastTime = Date.now();
    
    const animateParticles = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 16; // Normaliser à 60fps
      lastTime = now;
      
      setParticles(prevParticles => 
        prevParticles
          .map(p => ({
            ...p,
            x: p.x + p.velocityX * delta,
            y: p.y + p.velocityY * delta,
            life: p.life - ((1 / 30) * delta)
          }))
          .filter(p => p.life > 0)
      );
      
      animId = requestAnimationFrame(animateParticles);
    };

    animId = requestAnimationFrame(animateParticles);

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  if (!spell) return null;

  return (
    <>
      {/* Particules de traînée */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute pointer-events-none"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.life * 0.8, // Opacité décroissante (80% max)
            transform: 'translate(-50%, -50%)',
            zIndex: 25
          }}
        >
          <Image
            src="/spell/fire/particle.svg"
            alt="particle"
            width={particle.size}
            height={particle.size}
            className="object-contain"
            style={{
              filter: `brightness(${0.5 + particle.life * 0.5})`
            }}
          />
        </div>
      ))}

      {/* Projectile principal */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${spellConfig.size}px`,
          height: `${spellConfig.size}px`,
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          zIndex: 26,
          filter: 'drop-shadow(0 0 20px rgba(255, 165, 0, 0.8))'
        }}
        data-projectile-id={id}
        data-projectile-type="player"
      >
        {/* Pour l'instant on utilise particle.svg, mais on pourrait avoir spell.svg */}
        <Image
          src="/spell/fire/particle.svg"
          alt={spell.name}
          fill
          className="object-contain"
        />
      </div>
    </>
  );
}
