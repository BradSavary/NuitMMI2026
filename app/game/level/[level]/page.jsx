"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import Image from "next/image";
import SpellHUD from "../../components/SpellHUD";
import GestureCamera from "../../components/GestureCamera";
import SpellProjectile from "../../components/SpellProjectile";

export default function LevelPage({ params }) {
  const { level } = use(params);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [characterFrame, setCharacterFrame] = useState(1);
  const [characterPose, setCharacterPose] = useState('neutral'); // 'neutral' ou 'fireball'
  const [bgWidth, setBgWidth] = useState(1920);
  const animationRef = useRef(null);
  const isPausedRef = useRef(false); // Ref pour isPaused
  
  // État pour les sorts
  const [detectedGesture, setDetectedGesture] = useState(null);
  const [readySpell, setReadySpell] = useState(null);
  const [activeProjectiles, setActiveProjectiles] = useState([]);
  const projectileIdRef = useRef(0);
  
  // Utiliser useRef pour les valeurs qui ne nécessitent pas de re-render
  const bgWidthRef = useRef(1920);
  const scrollSpeedRef = useRef(3);

  // Calcul de la largeur du background basé sur la hauteur de l'écran
  useEffect(() => {
    const calculateBgWidth = () => {
      const screenHeight = window.innerHeight;
      // Ratio original des images : 1920/1080 = 16/9
      const bgRatio = 1920 / 1080;
      const calculatedWidth = Math.ceil(screenHeight * bgRatio);
      setBgWidth(calculatedWidth);
      bgWidthRef.current = calculatedWidth;
    };

    calculateBgWidth();
    window.addEventListener('resize', calculateBgWidth);
    return () => window.removeEventListener('resize', calculateBgWidth);
  }, []);

  // Synchroniser isPausedRef avec isPaused
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Animation du background qui défile
  useEffect(() => {
    let animationId;
    
    const animate = () => {
      if (isPausedRef.current) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      
      setScrollPosition((prev) => {
        const newPos = prev + scrollSpeedRef.current;
        return newPos >= bgWidthRef.current * 2 ? newPos - bgWidthRef.current * 2 : newPos;
      });
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []); // Pas de dépendances

  // Animation du personnage (alternance des poses)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCharacterFrame((prev) => (prev === 1 ? 2 : 1));
    }, 300); // Change de frame toutes les 300ms

    return () => clearInterval(interval);
  }, [isPaused]);

  // Gestion de la pause avec Échap et lancement de sort avec Espace
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        setIsPaused((prev) => !prev);
      }
      
      // Lancer le sort avec Espace SEULEMENT si un sort est prêt
      if (e.key === " " && readySpell && !isPaused) {
        e.preventDefault();
        launchSpell(readySpell);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [readySpell, isPaused]);

  // Fonction pour lancer un sort
  const launchSpell = (spell) => {
    // 1. Changer la pose du personnage
    setCharacterPose('fireball');
    
    // 2. Créer le projectile
    const characterElement = document.querySelector('.character-position');
    if (characterElement) {
      const rect = characterElement.getBoundingClientRect();
      const startX = rect.left + rect.width;
      const startY = rect.top + rect.height / 2;
      
      const newProjectile = {
        id: projectileIdRef.current++,
        spell: spell,
        startX: startX,
        startY: startY
      };
      
      setActiveProjectiles(prev => [...prev, newProjectile]);
    }
    
    // 3. Réinitialiser la détection
    setDetectedGesture(null);
    setReadySpell(null);
    
    // 4. Revenir à la pose neutre après 500ms
    setTimeout(() => {
      setCharacterPose('neutral');
    }, 500);
  };

  // Callback quand un geste est détecté
  const handleGestureDetected = (gesture, confidence) => {
    console.log('Geste détecté:', gesture, 'confiance:', confidence);
    setDetectedGesture(gesture);
  };

  // Callback quand le HUD a préparé le sort
  const handleSpellReady = (spell) => {
    setReadySpell(spell);
  };

  // Callback quand un projectile doit être détruit
  const handleProjectileDestroy = (id) => {
    setActiveProjectiles(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black" style={{ zIndex: 1 }}>
      {/* Container du jeu */}
      <div className="relative w-full h-full" style={{ zIndex: 10 }}>
        {/* Backgrounds défilants - 4 images pour assurer la continuité */}
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
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
        <div className="absolute left-[5%] bottom-[14%] z-10 character-position">
          <div className="relative w-32 h-32 md:w-48 md:h-48">
            <Image
              src={
                characterPose === 'fireball' 
                  ? `/MC/MC-pose-fireball.svg`
                  : `/MC/MC-pose-neutral-${characterFrame}.svg`
              }
              alt="Main Character"
              fill
              className="object-contain transition-all duration-200"
            />
          </div>
        </div>

        {/* Projectiles de sorts */}
        {activeProjectiles.map(projectile => (
          <SpellProjectile
            key={projectile.id}
            id={projectile.id}
            spell={projectile.spell}
            startX={projectile.startX}
            startY={projectile.startY}
            onDestroy={handleProjectileDestroy}
          />
        ))}

        {/* Interface overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 z-20 bg-linear-to-b from-black/60 to-transparent">
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

        {/* HUD du sort détecté */}
        <SpellHUD 
          detectedSpell={detectedGesture}
          onSpellReady={handleSpellReady}
        />

        {/* Caméra et détection de gestes */}
        <GestureCamera 
          onGestureDetected={handleGestureDetected}
          isActive={!isPaused}
        />

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
