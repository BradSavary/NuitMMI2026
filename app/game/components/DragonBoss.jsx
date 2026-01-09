"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

/**
 * DragonBoss - Boss final du niveau
 * - Apparaît après les 5 ninjas
 * - Ne bouge pas
 * - Tire des boules de feu toutes les 3 secondes (2 PV de dégâts)
 * - A 30 PV
 * - Alterne entre Dragon1.png et Dragon2.png pour l'animation idle
 */
export default function DragonBoss({ 
  id,
  startX,
  startY,
  onDeath,
  onSpellCast,
  health: externalHealth,
  isPaused = false
}) {
  const [health, setHealth] = useState(30);
  const [isDead, setIsDead] = useState(false);
  const [dragonFrame, setDragonFrame] = useState(1); // 1 ou 2 pour alterner les images
  const spellIntervalRef = useRef(null);

  // Synchroniser la santé externe si elle change
  useEffect(() => {
    if (externalHealth !== undefined && externalHealth !== health) {
      console.log(`Dragon Boss ${id}: Mise à jour santé ${health} -> ${externalHealth}`);
      setHealth(externalHealth);
      
      // Si la santé tombe à 0 ou moins, déclencher la mort
      if (externalHealth <= 0 && !isDead) {
        console.log(`Dragon Boss ${id}: Mort (santé à ${externalHealth})`);
        die();
      }
    }
  }, [externalHealth]);

  // Animation idle - Alterne entre Dragon1 et Dragon2 toutes les 500ms
  useEffect(() => {
    if (isDead || isPaused) return;

    const interval = setInterval(() => {
      setDragonFrame(prev => prev === 1 ? 2 : 1);
    }, 500);

    return () => clearInterval(interval);
  }, [isDead, isPaused]);

  // Timer pour lancer des sorts toutes les 3 secondes
  useEffect(() => {
    if (isDead || isPaused) return;

    // Première attaque après 2 secondes
    const initialDelay = setTimeout(() => {
      launchSpell();
      
      // Puis attaque toutes les 3 secondes
      spellIntervalRef.current = setInterval(() => {
        launchSpell();
      }, 3000);
    }, 2000);

    return () => {
      clearTimeout(initialDelay);
      if (spellIntervalRef.current) {
        clearInterval(spellIntervalRef.current);
      }
    };
  }, [isDead, isPaused]);

  // Fonction pour lancer un sort
  const launchSpell = () => {
    if (isDead) return;
    
    console.log('Dragon Boss lance une boule de feu !');
    
    // Position de spawn du sort (depuis la bouche du dragon)
    const spellX = startX - 50; // Un peu devant le dragon
    const spellY = startY + 20; // À peu près au centre du dragon
    
    if (onSpellCast) {
      onSpellCast({
        startX: spellX,
        startY: spellY,
        damage: 2,
        type: 'dragon-fireball'
      });
    }
  };

  // Fonction appelée à la mort
  const die = () => {
    if (isDead) return;
    
    console.log('Dragon Boss meurt !');
    setIsDead(true);
    
    // Animation de mort pendant 1 seconde puis notification
    setTimeout(() => {
      if (onDeath) {
        onDeath(id);
      }
    }, 1000);
  };

  // Ne plus afficher si mort
  if (isDead) {
    return (
      <div
        data-enemy-id={id}
        data-enemy-type="dragon-boss"
        className="absolute animate-fade-out"
        style={{
          left: `${startX}px`,
          top: `${startY}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 15,
          opacity: 0,
          transition: 'opacity 1s ease-out'
        }}
      >
        <div className="relative w-64 h-64">
          <Image
            src={`/mob/Dragon/Dragon${dragonFrame}.png`}
            alt="Dragon Boss mort"
            fill
            className="object-contain filter grayscale"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      data-enemy-id={id}
      data-enemy-type="dragon-boss"
      className="absolute"
      style={{
        left: `${startX}px`,
        top: `${startY}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 15
      }}
    >
      {/* Le Dragon Boss - Taille doublée (512x512 au lieu de 256x256) */}
      <div className="relative w-lg h-128">
        <Image
          src={`/mob/Dragon/Dragon${dragonFrame}.png`}
          alt="Dragon Boss"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Barre de vie du boss */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-64">
        <div className="bg-gray-800 rounded-full h-6 overflow-hidden border-2 border-red-500">
          <div
            className="h-full bg-linear-to-r from-red-600 to-orange-500 transition-all duration-300"
            style={{ width: `${(health / 30) * 100}%` }}
          />
        </div>
        <p className="text-white text-sm text-center mt-1 font-bold">
          BOSS: {health} / 30 PV
        </p>
      </div>

      {/* Indicateur de boss (couronne) */}
      <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
        <span className="text-6xl animate-bounce">👑</span>
      </div>
    </div>
  );
}
