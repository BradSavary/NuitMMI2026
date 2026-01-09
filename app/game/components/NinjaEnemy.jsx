"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

/**
 * NinjaEnemy - Représente un ennemi Ninja
 * - Se déplace vers la gauche (vers le joueur)
 * - Lance un sort unique entre 3-5 secondes après l'apparition
 * - A 5 PV
 * - Fait 2 PV de dégâts au corps à corps
 */
export default function NinjaEnemy({ 
  id,
  startX,
  startY,
  onReachPlayer,
  onDeath,
  onSpellCast,
  scrollSpeed = 0,
  health: externalHealth,
  isPaused = false
}) {
  const [position, setPosition] = useState({ x: startX, y: startY });
  const [health, setHealth] = useState(5);
  const [isDead, setIsDead] = useState(false);
  const [animation, setAnimation] = useState('idle'); // 'idle', 'attack', 'dead'
  const [hasLaunchedSpell, setHasLaunchedSpell] = useState(false);
  const spellTimerRef = useRef(null);
  const moveSpeed = 2; // Vitesse de déplacement du ninja

  // Synchroniser la santé externe si elle change
  useEffect(() => {
    if (externalHealth !== undefined && externalHealth !== health) {
      console.log(`Ninja ${id}: Mise à jour santé ${health} -> ${externalHealth}`);
      setHealth(externalHealth);
      
      // Si la santé tombe à 0 ou moins, déclencher la mort
      if (externalHealth <= 0 && !isDead) {
        console.log(`Ninja ${id}: Mort (santé à ${externalHealth})`);
        die();
      }
    }
  }, [externalHealth]);

  // Timer pour lancer le sort (entre 3-5 secondes)
  useEffect(() => {
    if (!hasLaunchedSpell && !isDead && !isPaused) {
      const delay = 1000 + Math.random() * 2000; // Entre 1000ms et 3000ms
      
      spellTimerRef.current = setTimeout(() => {
        launchSpell();
      }, delay);
    }

    return () => {
      if (spellTimerRef.current) {
        clearTimeout(spellTimerRef.current);
      }
    };
  }, [hasLaunchedSpell, isDead, isPaused]);

  // Animation du mouvement
  useEffect(() => {
    if (isDead || isPaused) return;

    let frameId;

    const animate = () => {
      setPosition(prev => {
        const newX = prev.x - moveSpeed - scrollSpeed;
        
        // Si le ninja atteint le bord gauche (position du joueur environ à 5% de l'écran)
        if (newX < window.innerWidth * 0.15) {
          // Déclencher l'attaque au corps à corps
          setTimeout(() => {
            if (onReachPlayer) {
              onReachPlayer(id, 2); // 2 PV de dégâts
            }
          }, 0);
          return prev; // Arrêter le mouvement
        }

        return { x: newX, y: prev.y };
      });

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [isDead, id, onReachPlayer, scrollSpeed, isPaused]);

  // Fonction pour lancer le sort
  const launchSpell = () => {
    if (hasLaunchedSpell || isDead) return;
    
    setHasLaunchedSpell(true);
    setAnimation('attack');
    
    // Utiliser setPosition dans un callback pour s'assurer d'avoir la position actuelle
    setPosition(currentPos => {
      // Informer le parent qu'un sort est lancé (position actuelle du ninja)
      if (onSpellCast) {
        onSpellCast({
          id: `ninja-${id}-spell-${Date.now()}`,
          startX: currentPos.x - 80, // Juste devant le ninja (à gauche de lui)
          startY: currentPos.y,
          damage: 1
        });
      }
      return currentPos; // Ne pas modifier la position
    });

    // Revenir à l'animation idle après l'attaque
    setTimeout(() => {
      if (!isDead) {
        setAnimation('idle');
      }
    }, 500);
  };

  // Fonction pour mourir
  const die = () => {
    if (isDead) return;
    
    setIsDead(true);
    setAnimation('dead');
    
    // Notification au parent après l'animation de mort
    setTimeout(() => {
      if (onDeath) {
        onDeath(id);
      }
    }, 800);
  };

  // Méthode pour recevoir des dégâts (appelée par le parent)
  const takeDamage = (damage) => {
    if (isDead) return;
    
    const newHealth = health - damage;
    setHealth(newHealth);
    
    if (newHealth <= 0) {
      die();
    }
  };

  // Obtenir la bonne image selon l'animation
  const getImageSrc = () => {
    switch(animation) {
      case 'attack':
        return '/mob/Ninja/attack.svg';
      case 'dead':
        return '/mob/Ninja/dead.svg';
      case 'idle':
      default:
        return '/mob/Ninja/idle.svg';
    }
  };

  // Ne pas afficher si hors écran à droite
  if (position.x > window.innerWidth + 100) {
    return null;
  }

  return (
    <div
      className={`absolute z-12 transition-opacity duration-500 ${isDead ? 'opacity-0' : 'opacity-100'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
      }}
      data-enemy-id={id}
      data-enemy-type="ninja"
      data-health={health}
    >
      {/* Corps du ninja */}
      <div className="relative w-32 h-32">
        <Image
          src={getImageSrc()}
          alt="Ninja"
          fill
          className="object-contain"
        />
      </div>

      {/* Barre de vie du ninja */}
      {!isDead && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-24">
          <div className="bg-gray-800 h-2 rounded-full overflow-hidden border border-gray-600">
            <div
              className="bg-red-500 h-full transition-all duration-300"
              style={{ width: `${(health / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
