"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

/**
 * GhostEnemy - Représente un ennemi Ghost (fantôme)
 * - Se déplace vers la gauche (vers le joueur)
 * - Lance un sort unique entre 1-1.5 secondes après l'apparition
 * - Le spell fait 3 PV de dégâts
 * - Disparaît au milieu de l'écran (50%)
 * - N'est pas touchable par les sorts du joueur (pas de barre de vie)
 * - Ne fait pas de dégâts au corps à corps
 */
export default function GhostEnemy({ 
  id,
  startX,
  startY,
  onDeath,
  onSpellCast,
  scrollSpeed = 0,
  isPaused = false
}) {
  const [position, setPosition] = useState({ x: startX, y: startY });
  const [opacity, setOpacity] = useState(1);
  const [isDisappearing, setIsDisappearing] = useState(false);
  const [idleFrame, setIdleFrame] = useState(1); // Alternance entre idle1 et idle2
  const [hasLaunchedSpell, setHasLaunchedSpell] = useState(false);
  const spellTimerRef = useRef(null);
  const moveSpeed = 2; // Même vitesse que le ninja

  // Animation idle - Alternance entre idle1 et idle2
  useEffect(() => {
    if (isDisappearing || isPaused) return;

    const interval = setInterval(() => {
      setIdleFrame(prev => prev === 1 ? 2 : 1);
    }, 250); // Toutes les 0.25 secondes (entre 0.2 et 0.3)

    return () => clearInterval(interval);
  }, [isDisappearing, isPaused]);

  // Timer pour lancer le sort (entre 1-1.5 secondes)
  useEffect(() => {
    if (!hasLaunchedSpell && !isDisappearing && !isPaused) {
      const delay = 1000 + Math.random() * 500; // Entre 1000ms et 1500ms
      
      spellTimerRef.current = setTimeout(() => {
        launchSpell();
      }, delay);
    }

    return () => {
      if (spellTimerRef.current) {
        clearTimeout(spellTimerRef.current);
      }
    };
  }, [hasLaunchedSpell, isDisappearing, isPaused]);

  // Animation du mouvement
  useEffect(() => {
    if (isDisappearing || isPaused) return;

    let frameId;

    const animate = () => {
      setPosition(prev => {
        const newX = prev.x - moveSpeed - scrollSpeed;
        
        // Si le ghost atteint le milieu de l'écran (50%), commencer à disparaître
        if (newX <= window.innerWidth * 0.5 && !isDisappearing) {
          disappear();
        }

        return { x: newX, y: prev.y };
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [isDisappearing, id, scrollSpeed, isPaused]);

  // Fonction pour lancer le sort
  const launchSpell = () => {
    if (hasLaunchedSpell || isDisappearing) return;
    
    setHasLaunchedSpell(true);
    
    // Utiliser setPosition dans un callback pour s'assurer d'avoir la position actuelle
    setPosition(currentPos => {
      // Informer le parent qu'un sort est lancé (position actuelle du ghost)
      if (onSpellCast) {
        onSpellCast({
          id: `ghost-${id}-spell-${Date.now()}`,
          startX: currentPos.x - 80, // Juste devant le ghost (à gauche de lui)
          startY: currentPos.y,
          damage: 3, // Le ghost fait 3 PV de dégâts avec son spell
          type: 'ghost'
        });
      }
      return currentPos; // Ne pas modifier la position
    });
  };

  // Fonction pour disparaître
  const disappear = () => {
    if (isDisappearing) return;
    
    setIsDisappearing(true);
    
    // Animation de disparition progressive
    let fadeOpacity = 1;
    const fadeInterval = setInterval(() => {
      fadeOpacity -= 0.05;
      setOpacity(fadeOpacity);
      
      if (fadeOpacity <= 0) {
        clearInterval(fadeInterval);
        // Notification au parent après l'animation de disparition
        setTimeout(() => {
          if (onDeath) {
            onDeath(id);
          }
        }, 100);
      }
    }, 50); // Fade out sur environ 1 seconde
  };

  // Obtenir la bonne image selon le frame d'animation
  const getImageSrc = () => {
    return `/mob/Ghost/idle${idleFrame}.png`;
  };

  // Ne pas afficher si hors écran à droite
  if (position.x > window.innerWidth + 100) {
    return null;
  }

  return (
    <div
      className="absolute z-12"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        opacity: opacity,
        transition: 'opacity 0.1s ease-out'
      }}
      data-enemy-id={id}
      data-enemy-type="ghost"
      data-invulnerable="true"
    >
      {/* Corps du ghost */}
      <div className="relative w-32 h-32">
        <Image
          src={getImageSrc()}
          alt="Ghost"
          fill
          className="object-contain"
        />
        
        {/* Effet spectral/lumineux autour du ghost */}
        <div className="absolute inset-0 animate-pulse pointer-events-none">
          <div className="w-full h-full rounded-full bg-cyan-400/20 blur-xl"></div>
        </div>
      </div>
    </div>
  );
}
