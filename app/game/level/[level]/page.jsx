"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import Image from "next/image";
import SpellHUD from "../../components/SpellHUD";
import GestureCamera from "../../components/GestureCamera";
import SpellProjectile from "../../components/SpellProjectile";
import NinjaEnemy from "../../components/NinjaEnemy";
import EnemyProjectile from "../../components/EnemyProjectile";
import HealthBar from "../../components/HealthBar";

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
  
  // Cooldown des sorts (1 seconde)
  const [spellCooldown, setSpellCooldown] = useState(false);
  const lastSpellTimeRef = useRef(0);
  const SPELL_COOLDOWN_MS = 300; // 1 seconde
  
  // État du chargement et détection des mains
  const [isLoading, setIsLoading] = useState(true);
  const [handsDetected, setHandsDetected] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // État du joueur
  const [playerHealth, setPlayerHealth] = useState(10);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isInvincible, setIsInvincible] = useState(false);
  
  // État des ennemis
  const [ninjas, setNinjas] = useState([]);
  const [enemyProjectiles, setEnemyProjectiles] = useState([]);
  const enemyProjectileIdRef = useRef(0);
  const [currentNinjaIndex, setCurrentNinjaIndex] = useState(0);
  const TOTAL_NINJAS = 5;
  
  // Utiliser useRef pour les valeurs qui ne nécessitent pas de re-render
  const bgWidthRef = useRef(1920);
  const scrollSpeedRef = useRef(3);
  
  // Configuration des dégâts
  const SPELL_DAMAGE = {
    fireball: 3,
    ice: 3,
    thunder: 2
  };

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
  
  // Animation de la barre de progression du chargement
  useEffect(() => {
    if (!isLoading) return;
    
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (handsDetected && prev >= 100) {
          // Attendre un peu avant de fermer l'écran de chargement
          setTimeout(() => setIsLoading(false), 500);
          return 100;
        }
        
        // Progression automatique jusqu'à 70%, puis attendre la détection des mains
        if (!handsDetected && prev < 70) {
          return prev + 2;
        } else if (handsDetected && prev < 100) {
          return prev + 10; // Progression rapide une fois les mains détectées
        }
        
        return prev;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [isLoading, handsDetected]);
  
  // Gestion des ninjas - Spawn du premier ninja puis les suivants
  useEffect(() => {
    if (isGameOver || isPaused || isLoading) return;
    
    // Spawn du premier ninja au démarrage (après 2 secondes)
    if (ninjas.length === 0 && currentNinjaIndex === 0) {
      setTimeout(() => {
        spawnNinja(0);
      }, 2000);
    }
  }, [isGameOver, isPaused, isLoading, ninjas.length, currentNinjaIndex]);
  
  // Fonction pour faire apparaître un ninja
  const spawnNinja = (index) => {
    if (index >= TOTAL_NINJAS) return; // Plus de ninjas à faire apparaître
    
    const newNinja = {
      id: `ninja-${index}`,
      startX: window.innerWidth + 100, // Spawn à droite de l'écran
      startY: window.innerHeight * 0.76, // Plus bas (75% au lieu de 70%)
      health: 5,
      index: index
    };
    
    setNinjas([newNinja]); // Un seul ninja à la fois
  };
  
  // Gestion de la mort d'un ninja
  const handleNinjaDeath = (ninjaId) => {
    console.log('Ninja mort:', ninjaId);
    setNinjas(prev => prev.filter(n => n.id !== ninjaId));
    
    // Incrémenter le compteur de ninjas traités (morts ou ayant touché le joueur)
    const ninjasProcessed = currentNinjaIndex + 1;
    console.log(`Ninjas traités: ${ninjasProcessed} / ${TOTAL_NINJAS}`);
    
    // Faire apparaître le prochain ninja après un délai
    const nextIndex = currentNinjaIndex + 1;
    if (nextIndex < TOTAL_NINJAS) {
      setTimeout(() => {
        setCurrentNinjaIndex(nextIndex);
        spawnNinja(nextIndex);
      }, 2000); // 2 secondes avant le prochain ninja
    } else {
      // Tous les ninjas ont été traités - Victoire !
      console.log('🎉 Tous les ninjas ont été vaincus !');
      // Note: On ne fait pas de game over ici car c'est une victoire
    }
  };
  
  // Gestion de l'arrivée d'un ninja au joueur (corps à corps)
  const handleNinjaReachPlayer = (ninjaId, damage) => {
    console.log('Ninja atteint le joueur:', ninjaId, 'dégâts:', damage);
    playerTakeDamage(damage);
    
    // Retirer le ninja qui a attaqué
    setNinjas(prev => prev.filter(n => n.id !== ninjaId));
    
    // Incrémenter le compteur de ninjas traités
    const ninjasProcessed = currentNinjaIndex + 1;
    console.log(`Ninjas traités: ${ninjasProcessed} / ${TOTAL_NINJAS}`);
    
    // Faire apparaître le prochain ninja
    const nextIndex = currentNinjaIndex + 1;
    if (nextIndex < TOTAL_NINJAS) {
      setTimeout(() => {
        setCurrentNinjaIndex(nextIndex);
        spawnNinja(nextIndex);
      }, 2000);
    } else {
      // Tous les ninjas ont été traités
      console.log('🎉 Tous les ninjas sont passés !');
    }
  };
  
  // Gestion du sort lancé par un ninja
  const handleNinjaSpellCast = (spellData) => {
    console.log('Ninja lance un sort:', spellData);
    setEnemyProjectiles(prev => [...prev, {
      ...spellData,
      id: `enemy-spell-${enemyProjectileIdRef.current++}`
    }]);
  };
  
  // Gestion des dégâts au joueur
  const playerTakeDamage = (damage) => {
    if (isInvincible || isGameOver) return;
    
    setPlayerHealth(prev => {
      const newHealth = Math.max(0, prev - damage);
      
      if (newHealth <= 0) {
        setIsGameOver(true);
      }
      
      return newHealth;
    });
    
    // Invincibilité temporaire de 1 seconde
    setIsInvincible(true);
    setTimeout(() => {
      setIsInvincible(false);
    }, 1000);
  };
  
  // Détection des collisions entre sorts du joueur et ninjas
  useEffect(() => {
    if (isPaused || isGameOver) return;
    
    const checkInterval = setInterval(() => {
      // Pour chaque projectile du joueur
      activeProjectiles.forEach(projectile => {
        const projectileEl = document.querySelector(`[data-projectile-id="${projectile.id}"][data-projectile-type="player"]`);
        if (!projectileEl) {
          // console.log(`❌ Projectile ${projectile.id} non trouvé dans le DOM`);
          return;
        }
        
        const projectileRect = projectileEl.getBoundingClientRect();
        
        // Pour chaque ninja
        ninjas.forEach(ninja => {
          const ninjaEl = document.querySelector(`[data-enemy-id="${ninja.id}"]`);
          if (!ninjaEl) {
            // console.log(`❌ Ninja ${ninja.id} non trouvé dans le DOM`);
            return;
          }
          
          const ninjaRect = ninjaEl.getBoundingClientRect();
          
          // Vérifier la collision (AABB simple avec une marge de tolérance)
          const margin = 20; // Marge de tolérance pour faciliter les collisions
          if (
            projectileRect.left < ninjaRect.right + margin &&
            projectileRect.right > ninjaRect.left - margin &&
            projectileRect.top < ninjaRect.bottom + margin &&
            projectileRect.bottom > ninjaRect.top - margin
          ) {
            // Collision détectée !
            console.log(`💥 Collision: Sort ${projectile.spell?.element} touche ninja ${ninja.id}, santé avant: ${ninja.health}`);
            
            // Infliger des dégâts au ninja
            const damage = SPELL_DAMAGE[projectile.spell?.element] || 1;
            const newHealth = ninja.health - damage;
            
            console.log(`   ➡️ Dégâts: ${damage}, nouvelle santé: ${newHealth}`);
            
            setNinjas(prev => prev.map(n => 
              n.id === ninja.id 
                ? { ...n, health: newHealth }
                : n
            ));
            
            // Détruire le projectile
            setActiveProjectiles(prev => prev.filter(p => p.id !== projectile.id));
          }
        });
      });
      
      // Pour chaque projectile ennemi
      enemyProjectiles.forEach(enemyProj => {
        const projEl = document.querySelector(`[data-projectile-id="${enemyProj.id}"][data-projectile-type="enemy"]`);
        if (!projEl) return;
        
        const projRect = projEl.getBoundingClientRect();
        const playerEl = document.querySelector('.character-position');
        if (!playerEl) return;
        
        const playerRect = playerEl.getBoundingClientRect();
        
        // Vérifier collision avec le joueur
        if (
          projRect.left < playerRect.right &&
          projRect.right > playerRect.left &&
          projRect.top < playerRect.bottom &&
          projRect.bottom > playerRect.top
        ) {
          console.log('Collision: Sort ennemi touche le joueur');
          
          // Infliger des dégâts
          playerTakeDamage(enemyProj.damage || 1);
          
          // Détruire le projectile
          setEnemyProjectiles(prev => prev.filter(p => p.id !== enemyProj.id));
        }
      });
    }, 50); // Vérifier toutes les 50ms
    
    return () => clearInterval(checkInterval);
  }, [activeProjectiles, ninjas, enemyProjectiles, isPaused, isGameOver, isInvincible]);

  // Animation du background qui défile
  useEffect(() => {
    if (isLoading) return; // Ne pas animer pendant le chargement
    
    let animationId;
    
    const animate = () => {
      if (isPausedRef.current || isGameOver) {
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
  }, [isLoading, isGameOver]); // Ajout de isLoading et isGameOver dans les dépendances

  // Animation du personnage (alternance des poses)
  useEffect(() => {
    if (isPaused || isLoading) return;

    const interval = setInterval(() => {
      setCharacterFrame((prev) => (prev === 1 ? 2 : 1));
    }, 300); // Change de frame toutes les 300ms

    return () => clearInterval(interval);
  }, [isPaused, isLoading]);

  // Gestion de la pause avec Échap et lancement de sort avec Espace
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ne pas permettre de pause pendant le chargement
      if (e.key === "Escape" && !isLoading) {
        setIsPaused((prev) => !prev);
      }
      
      // Lancer le sort avec Espace SEULEMENT si un sort est prêt et pas en chargement
      if (e.key === " " && readySpell && !isPaused && !isLoading) {
        e.preventDefault();
        launchSpell(readySpell);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [readySpell, isPaused, isLoading]);

  // Fonction pour lancer un sort
  const launchSpell = (spell) => {
    if (isGameOver) return;
    
    // Vérifier le cooldown
    const now = Date.now();
    if (spellCooldown || (now - lastSpellTimeRef.current) < SPELL_COOLDOWN_MS) {
      console.log('Sort en cooldown, veuillez attendre...');
      return;
    }
    
    // Activer le cooldown
    setSpellCooldown(true);
    lastSpellTimeRef.current = now;
    
    // Désactiver le cooldown après 1 seconde
    setTimeout(() => {
      setSpellCooldown(false);
    }, SPELL_COOLDOWN_MS);
    
    // 1. Changer la pose du personnage selon le sort
    setCharacterPose(spell.pose || 'fireball');
    
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
    
    // Marquer que les mains sont détectées (pour l'écran de chargement)
    if (!handsDetected) {
      console.log('✋ Mains détectées ! Fin du chargement...');
      setHandsDetected(true);
    }
  };

  // Callback quand le HUD a préparé le sort
  const handleSpellReady = (spell) => {
    setReadySpell(spell);
  };

  // Callback quand un projectile doit être détruit
  const handleProjectileDestroy = (id) => {
    setActiveProjectiles(prev => prev.filter(p => p.id !== id));
  };
  
  // Callback quand un projectile ennemi doit être détruit
  const handleEnemyProjectileDestroy = (id) => {
    setEnemyProjectiles(prev => prev.filter(p => p.id !== id));
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
        <div className={`absolute left-[5%] bottom-[14%] z-10 character-position ${isInvincible ? 'animate-pulse' : ''}`}>
          <div className="relative w-32 h-32 md:w-48 md:h-48">
            <Image
              src={
                characterPose === 'fireball' 
                  ? `/MC/MC-pose-fireball.svg`
                  : characterPose === 'ice'
                  ? `/MC/MC-pose-ice.svg`
                  : `/MC/MC-pose-neutral-${characterFrame}.svg`
              }
              alt="Main Character"
              fill
              className="object-contain transition-all duration-200"
            />
          </div>
        </div>

        {/* Ninjas ennemis */}
        {ninjas.map(ninja => (
          <NinjaEnemy
            key={ninja.id}
            id={ninja.id}
            startX={ninja.startX}
            startY={ninja.startY}
            health={ninja.health}
            onReachPlayer={handleNinjaReachPlayer}
            onDeath={handleNinjaDeath}
            onSpellCast={handleNinjaSpellCast}
            scrollSpeed={scrollSpeedRef.current}
          />
        ))}

        {/* Projectiles de sorts du joueur */}
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
        
        {/* Projectiles ennemis */}
        {enemyProjectiles.map(projectile => (
          <EnemyProjectile
            key={projectile.id}
            id={projectile.id}
            startX={projectile.startX}
            startY={projectile.startY}
            damage={projectile.damage}
            onDestroy={handleEnemyProjectileDestroy}
          />
        ))}
        
        {/* Barre de vie du joueur */}
        <HealthBar currentHealth={playerHealth} maxHealth={10} />

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
        {isPaused && !isGameOver && (
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
        
        {/* Écran Game Over */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-40 flex items-center justify-center">
            <div className="bg-linear-to-br from-red-900 to-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-2 border-red-500">
              <h2 className="text-5xl font-bold text-red-400 text-center mb-4 animate-pulse">
                💀 GAME OVER
              </h2>
              
              <div className="bg-black/50 rounded-lg p-4 mb-6">
                <p className="text-white text-center text-lg mb-2">
                  Ninjas affrontés: <span className="font-bold text-yellow-400">{currentNinjaIndex} / {TOTAL_NINJAS}</span>
                </p>
                <p className="text-gray-400 text-center text-sm">
                  Vous avez combattu vaillamment !
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl transition-colors text-lg"
                >
                  🔄 Réessayer
                </button>
                
                <Link
                  href="/game"
                  className="block w-full px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors text-center"
                >
                  🏠 Menu Principal
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Écran de chargement */}
        {isLoading && (
          <div className="absolute inset-0 backdrop-blur-lg z-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-4 bg-black/40 backdrop-blur-md rounded-2xl p-8 border-2 border-white/20">
              {/* Logo ou titre */}
              <h1 className="text-5xl font-bold text-white mb-8 animate-pulse">
                ⚔️ NIVEAU {level}
              </h1>
              
              {/* Message de chargement */}
              <div className="mb-6">
                {!handsDetected ? (
                  <>
                    <p className="text-2xl text-yellow-400 mb-4 animate-bounce">
                      ✋ Placez votre main droite devant la caméra
                    </p>
                    <p className="text-gray-400 text-sm">
                      Le jeu démarrera automatiquement une fois votre main détectée
                    </p>
                  </>
                ) : (
                  <p className="text-2xl text-green-400 mb-4">
                    ✅ Main détectée ! Démarrage...
                  </p>
                )}
              </div>
              
              {/* Barre de progression */}
              <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden border-2 border-gray-700">
                <div
                  className="h-full bg-linear-to-r from-purple-600 to-blue-500 transition-all duration-300 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                >
                  <div className="w-full h-full animate-pulse bg-white/20"></div>
                </div>
              </div>
              
              <p className="text-gray-500 text-xs mt-2">
                {Math.floor(loadingProgress)}%
              </p>
              
              {/* Instructions */}
              <div className="mt-8 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <p className="text-white text-sm mb-2">📋 Instructions :</p>
                <ul className="text-gray-400 text-xs space-y-1 text-left">
                  <li>• Faites des gestes circulaires pour lancer des sorts</li>
                  <li>• Appuyez sur <kbd className="px-1 bg-gray-700 rounded">Espace</kbd> pour confirmer le sort</li>
                  <li>• Éliminez les 5 ninjas pour gagner</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* HUD du sort détecté */}
        <SpellHUD 
          detectedSpell={detectedGesture}
          onSpellReady={handleSpellReady}
          spellCooldown={spellCooldown}
        />

        {/* Caméra et détection de gestes */}
        <GestureCamera 
          onGestureDetected={handleGestureDetected}
          onHandsDetected={(detected) => {
            if (detected && !handsDetected) {
              setHandsDetected(true);
            }
          }}
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
