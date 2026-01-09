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
import DragonBoss from "../../components/DragonBoss";
import BossProjectile from "../../components/BossProjectile";
import { useGameAudio } from "../../../../lib/hooks/useGameAudio";

export default function LevelPage({ params }) {
  const { level } = use(params);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [characterFrame, setCharacterFrame] = useState(1);
  const [characterPose, setCharacterPose] = useState('neutral'); // 'neutral' ou 'fireball'
  const [bgWidth, setBgWidth] = useState(1920);
  const animationRef = useRef(null);
  const isPausedRef = useRef(false); // Ref pour isPaused
  
  // Hook audio
  const { playSound, stopSound } = useGameAudio(isPaused);
  
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
  const [shieldActive, setShieldActive] = useState(false);
  const [shieldCooldown, setShieldCooldown] = useState(false);
  const shieldCooldownTimeRef = useRef(0);
  const SHIELD_DURATION_MS = 1500; // 1.5 secondes
  const SHIELD_COOLDOWN_MS = 3000; // 3 secondes
  
  // État des ennemis
  const [ninjas, setNinjas] = useState([]);
  const [enemyProjectiles, setEnemyProjectiles] = useState([]);
  const enemyProjectileIdRef = useRef(0);
  const [currentNinjaIndex, setCurrentNinjaIndex] = useState(0);
  const TOTAL_NINJAS = 5;
  
  // État du boss
  const [bossActive, setBossActive] = useState(false);
  const [boss, setBoss] = useState(null);
  const [bossProjectiles, setBossProjectiles] = useState([]);
  const bossProjectileIdRef = useRef(0);
  const [showVictory, setShowVictory] = useState(false);
  
  // Utiliser useRef pour les valeurs qui ne nécessitent pas de re-render
  const bgWidthRef = useRef(1920);
  const scrollSpeedRef = useRef(3);
  const maxScrollRef = useRef(bgWidth * 2); // Distance maximale de scroll
  const [totalBgCount, setTotalBgCount] = useState(2); // Par défaut : BG-1 et BG-2
  const totalBgCountRef = useRef(2); // Ref pour totalBgCount
  
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
      // Mettre à jour le scroll max (par défaut 2 BG, puis 3 avec le boss)
      maxScrollRef.current = calculatedWidth * (bossActive ? 3 : 2);
    };

    calculateBgWidth();
    window.addEventListener('resize', calculateBgWidth);
    return () => window.removeEventListener('resize', calculateBgWidth);
  }, [bossActive]);

  // Synchroniser isPausedRef avec isPaused
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);
  
  // Synchroniser totalBgCountRef avec totalBgCount
  useEffect(() => {
    totalBgCountRef.current = totalBgCount;
  }, [totalBgCount]);
  
  // Démarrer la musique du niveau et les footsteps quand le jeu commence
  useEffect(() => {
    if (!isLoading && !isGameOver) {
      playSound('levelSong');
      playSound('footsteps');
    }
    
    // Arrêter les sons au démontage du composant ou game over
    return () => {
      stopSound('levelSong');
      stopSound('footsteps');
    };
  }, [isLoading, isGameOver]);
  
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
      // Tous les ninjas ont été vaincus - Faire apparaître le boss !
      console.log('🎉 Tous les ninjas ont été vaincus ! Le boss arrive...');
      spawnBoss();
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
      // Tous les ninjas sont passés - Faire apparaître le boss
      console.log('🎉 Tous les ninjas sont passés ! Le boss arrive...');
      spawnBoss();
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
  
  // Fonction pour faire apparaître le boss
  const spawnBoss = () => {
    if (bossActive) return; // Éviter de spawner plusieurs fois
    
    console.log('🐉 Tous les ninjas vaincus ! Ajout du BG-boss à la suite...');
    
    // Ajouter le BG-boss à la séquence
    setTotalBgCount(3); // BG-1, BG-2, BG-boss
    // Le boss apparaîtra automatiquement via l'effet ci-dessous
  };
  
  // Effet pour faire apparaître le boss quand le BG-boss est atteint
  useEffect(() => {
    if (totalBgCount === 3 && !bossActive && !boss) {
      const bossBgPosition = bgWidthRef.current * 2;
      
      // Si on est proche ou au BG-boss
      if (scrollPosition >= bossBgPosition - 200) {
        console.log('🐉 BG-boss atteint ! Le Dragon Boss apparaît !');
        
        setBossActive(true);
        
        // Restaurer les PV du joueur à 10
        setPlayerHealth(10);
        console.log('❤️ PV du joueur restaurés à 10');
        
        // Créer le boss sur le BG-boss
        const newBoss = {
          id: 'dragon-boss',
          startX: window.innerWidth * 0.75,
          startY: window.innerHeight * 0.5,
          health: 30
        };
        
        setBoss(newBoss);
      }
    }
  }, [totalBgCount, bossActive, boss, scrollPosition]);
  
  // Gestion de la mort du boss
  const handleBossDeath = (bossId) => {
    console.log('🎉 Le boss est vaincu ! VICTOIRE !');
    setBoss(null);
    setBossActive(false);
    setShowVictory(true);
  };
  
  // Gestion du sort lancé par le boss
  const handleBossSpellCast = (spellData) => {
    console.log('Boss lance une boule de feu:', spellData);
    setBossProjectiles(prev => [...prev, {
      ...spellData,
      id: `boss-spell-${bossProjectileIdRef.current++}`
    }]);
  };
  
  // Gestion des dégâts au joueur
  const playerTakeDamage = (damage) => {
    // Le shield bloque tous les dégâts
    if (shieldActive || isInvincible || isGameOver) {
      if (shieldActive) {
        console.log('🛡️ Dégâts bloqués par le shield !');
      }
      return;
    }
    
    // Jouer le son de dégâts
    playSound('damage');
    
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
        
        // Pour le boss
        if (boss && bossActive) {
          const bossEl = document.querySelector(`[data-enemy-id="${boss.id}"]`);
          if (bossEl) {
            const bossRect = bossEl.getBoundingClientRect();
            
            // Vérifier la collision avec le boss (marge plus grande car le boss est plus gros)
            const bossMargin = 50;
            if (
              projectileRect.left < bossRect.right + bossMargin &&
              projectileRect.right > bossRect.left - bossMargin &&
              projectileRect.top < bossRect.bottom + bossMargin &&
              projectileRect.bottom > bossRect.top - bossMargin
            ) {
              console.log(`💥 Collision: Sort ${projectile.spell?.element} touche le boss, santé avant: ${boss.health}`);
              
              // Infliger des dégâts au boss
              const damage = SPELL_DAMAGE[projectile.spell?.element] || 1;
              const newHealth = boss.health - damage;
              
              console.log(`   ➡️ Dégâts: ${damage}, nouvelle santé: ${newHealth}`);
              
              setBoss(prev => prev ? { ...prev, health: newHealth } : null);
              
              // Détruire le projectile
              setActiveProjectiles(prev => prev.filter(p => p.id !== projectile.id));
            }
          }
        }
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
      
      // Pour chaque projectile du boss
      bossProjectiles.forEach(bossProj => {
        const projEl = document.querySelector(`[data-projectile-id="${bossProj.id}"][data-projectile-type="boss"]`);
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
          console.log('💥 Collision: Boule de feu du boss touche le joueur !');
          
          // Infliger 2 PV de dégâts
          playerTakeDamage(bossProj.damage || 2);
          
          // Détruire le projectile
          setBossProjectiles(prev => prev.filter(p => p.id !== bossProj.id));
        }
      });
    }, 50); // Vérifier toutes les 50ms
    
    return () => clearInterval(checkInterval);
  }, [activeProjectiles, ninjas, enemyProjectiles, bossProjectiles, boss, bossActive, isPaused, isGameOver, isInvincible]);

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
        
        // Si on a ajouté le BG-boss (totalBgCountRef.current === 3)
        if (totalBgCountRef.current === 3) {
          // S'arrêter exactement au début du BG-boss (position bgWidth * 2)
          const stopPosition = bgWidthRef.current * 2;
          if (newPos >= stopPosition) {
            return stopPosition; // Fixer au bord gauche du BG-boss
          }
          return newPos;
        }
        
        // Sinon, boucle infinie entre BG-1 et BG-2
        const loopLength = bgWidthRef.current * 2;
        if (newPos >= loopLength) {
          return newPos - loopLength; // Retour au début de la boucle
        }
        return newPos;
      });
      
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isLoading, isGameOver]);

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
    
    // Si c'est un sort défensif (shield)
    if (spell.isDefensive) {
      // Vérifier le cooldown spécifique du shield
      const now = Date.now();
      if (shieldCooldown || (now - shieldCooldownTimeRef.current) < SHIELD_COOLDOWN_MS) {
        console.log('Shield en cooldown, veuillez attendre...');
        return;
      }
      
      // Activer le shield
      console.log('🛡️ Shield activé !');
      setShieldActive(true);
      setIsInvincible(true);
      setCharacterPose('shield');
      
      // Activer le cooldown du shield
      setShieldCooldown(true);
      shieldCooldownTimeRef.current = now;
      
      // Désactiver le shield après 1.5 secondes
      setTimeout(() => {
        setShieldActive(false);
        setIsInvincible(false);
        setCharacterPose('neutral');
        console.log('🛡️ Shield désactivé');
      }, SHIELD_DURATION_MS);
      
      // Réactiver le shield après le cooldown (3 secondes)
      setTimeout(() => {
        setShieldCooldown(false);
        console.log('🛡️ Shield prêt à être réutilisé');
      }, SHIELD_COOLDOWN_MS);
      
      // Réinitialiser la détection
      setDetectedGesture(null);
      setReadySpell(null);
      
      return; // Ne pas créer de projectile pour le shield
    }
    
    // Pour les sorts offensifs (fireball, ice)
    // Bloquer si le shield est actif
    if (shieldActive) {
      console.log('Impossible de lancer un sort pendant que le shield est actif');
      return;
    }
    
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
    
    // 1.5. Jouer le son correspondant au sort
    if (spell.element === 'fire') {
      playSound('fireball');
    } else if (spell.element === 'ice') {
      playSound('icespear');
    } else if (spell.element === 'thunder') {
      playSound('lightning');
    }
    
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
  
  // Callback quand un projectile du boss doit être détruit
  const handleBossProjectileDestroy = (id) => {
    setBossProjectiles(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black" style={{ zIndex: 1 }}>
      {/* Container du jeu */}
      <div className="relative w-full h-full" style={{ zIndex: 10 }}>
        {/* Backgrounds défilants - Dynamique : BG-1, BG-2 en boucle, puis BG-boss s'ajoute */}
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          {/* BG-1 et BG-2 qui bouclent à l'infini */}
          {[0, 1, 2, 3].map((index) => {
            const position = Math.floor(index * bgWidth - scrollPosition);
            const bgImage = index % 2 === 0 ? "/bg/BG-1.png" : "/bg/BG-2.png";
            
            // Ne pas afficher si on est dans la phase boss et que ces BG sont hors de vue
            if (totalBgCount === 3 && position < -bgWidth) {
              return null;
            }
            
            return (
              <div
                key={`loop-${index}`}
                className="absolute top-0 left-0"
                style={{
                  transform: `translateX(${position}px)`,
                  height: "100vh",
                  width: `${bgWidth + 1}px`,
                }}
              >
                <Image
                  src={bgImage}
                  alt={`Background Loop ${index + 1}`}
                  fill
                  className="object-cover"
                  priority={index < 2}
                />
              </div>
            );
          })}
          
          {/* BG-boss qui apparaît seulement après la défaite des ninjas */}
          {totalBgCount === 3 && (
            <>
              {/* Le BG-boss */}
              <div
                key="boss-bg"
                className="absolute top-0 left-0"
                style={{
                  // Quand scrollPosition = bgWidth * 2, le BG-boss remplit tout l'écran
                  transform: `translateX(${Math.floor((bgWidth * 2) - scrollPosition)}px)`,
                  height: "100vh",
                  width: `${bgWidth + 1}px`, // +1px pour éviter les micro-gaps comme les autres
                }}
              >
                <Image
                  src="/bg/BG-boss.png"
                  alt="Boss Background"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              
              {/* Fond noir pour masquer tout ce qui est à droite du BG-boss */}
              <div
                key="black-bg"
                className="absolute top-0 left-0 bg-black"
                style={{
                  transform: `translateX(${Math.floor((bgWidth * 3) - scrollPosition)}px)`,
                  height: "100vh",
                  width: "100vw",
                }}
              />
            </>
          )}
        </div>

        {/* Le personnage (fixe sur le sol à gauche de l'écran) */}
        <div className={`absolute left-[5%] bottom-[14%] z-10 character-position ${isInvincible && !shieldActive ? 'animate-pulse' : ''}`}>
          <div className="relative w-32 h-32 md:w-48 md:h-48">
            {/* Effet visuel du shield */}
            {shieldActive && (
              <div className="absolute inset-0 z-20 animate-pulse scale-125">
                <Image
                  src="/spell/shield/spell.png"
                  alt="Shield Effect"
                  fill
                  className="object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.9)]"
                  style={{
                    filter: 'brightness(1.2)',
                  }}
                />
              </div>
            )}
            
            {/* Le personnage */}
            <Image
              src={
                characterPose === 'shield'
                  ? `/MC/MC-pose-shield.svg`
                  : characterPose === 'fireball' 
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
            isPaused={isPaused}
          />
        ))}

        {/* Dragon Boss */}
        {boss && bossActive && (
          <DragonBoss
            id={boss.id}
            startX={boss.startX}
            startY={boss.startY}
            health={boss.health}
            onDeath={handleBossDeath}
            onSpellCast={handleBossSpellCast}
            isPaused={isPaused}
          />
        )}

        {/* Projectiles de sorts du joueur */}
        {activeProjectiles.map(projectile => (
          <SpellProjectile
            key={projectile.id}
            id={projectile.id}
            spell={projectile.spell}
            startX={projectile.startX}
            startY={projectile.startY}
            onDestroy={handleProjectileDestroy}
            isPaused={isPaused}
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
            isPaused={isPaused}
          />
        ))}
        
        {/* Projectiles du boss */}
        {bossProjectiles.map(projectile => (
          <BossProjectile
            key={projectile.id}
            id={projectile.id}
            startX={projectile.startX}
            startY={projectile.startY}
            damage={projectile.damage}
            onDestroy={handleBossProjectileDestroy}
            isPaused={isPaused}
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

          </div>
        </div>

        {/* Menu Pause (overlay complet) */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm backdrop-brightness-75">
            <div className="bg-gray-900 p-8 max-w-md w-full mx-4 pixel-border pixel-corners backdrop-blur-sm backdrop-brightness-75" >
              <h2 className="text-4xl pixel-font font-bold text-white text-center mb-8 tracking-wider">
                PAUSED
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={() => setIsPaused(false)}
                  className="w-full px-6 py-4 bg-purple-600 text-white pixel-button pixel-font cursor-pointer"
                >
                  CONTINUE
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-4 bg-gray-700 text-white pixel-button pixel-font cursor-pointer"
                >
                  RESTART
                </button>
                
                <Link
                  href="/game"
                  className="block w-full px-6 py-4 bg-red-700 text-white text-center pixel-button pixel-font cursor-pointer"
                >
                  MAIN MENU
                </Link>
              </div>

              <p className="text-gray-400 text-center mt-8 text-xs pixel-font">
                PRESS ESC TO RESUME
              </p>
            </div>
          </div>
        )}
        
        {/* Écran Game Over */}
        {isGameOver && (
          <div className="absolute inset-0 z-40 flex items-center justify-center backdrop-blur-sm backdrop-brightness-75">
            <div className="bg-red-950 p-8 max-w-md w-full mx-4 pixel-border pixel-corners" >
              <h2 className="text-5xl pixel-font font-bold text-red-500 text-center mb-6 tracking-wider">
                GAME OVER
              </h2>

              
              <div className="space-y-4">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-4 bg-yellow-600 text-white pixel-button pixel-font cursor-pointer"
                >
                  TRY AGAIN
                </button>
                
                <Link
                  href="/game"
                  className="block w-full px-6 py-4 bg-gray-700 text-white text-center pixel-button pixel-font cursor-pointer"
                >
                  MAIN MENU
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {/* Écran de Victoire */}
        {showVictory && (
          <div className="absolute inset-0 z-40 flex items-center justify-center backdrop-blur-sm backdrop-brightness-75">
            <div className="bg-yellow-900 p-8 max-w-md w-full mx-4 pixel-border pixel-corners">
              <h2 className="text-5xl pixel-font font-bold text-yellow-300 text-center mb-6 tracking-wider">
                VICTORY
              </h2>
              
              <div className="p-6 mb-6 pixel-border-sm" >
                <p className="text-white text-center text-xl pixel-font mb-4">
                  DRAGON DEFEATED
                </p>
                <p className="text-gray-300 text-center text-sm pixel-font">
                  WARRIOR WIZARD STATUS ACHIEVED
                </p>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-4 bg-yellow-500 text-black pixel-button pixel-font cursor-pointer"
                >
                  PLAY AGAIN
                </button>
                
                <Link
                  href="/game"
                  className="block w-full px-6 py-4 bg-gray-700 text-white text-center pixel-button pixel-font"
                >
                  MAIN MENU
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Écran de chargement */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ backdropFilter: 'blur(12px) brightness(0.4)' }}>
            <div className="text-center max-w-md mx-4 bg-gray-900 p-8 pixel-border pixel-corners" style={{ color: '#fff' }}>
              {/* Logo ou titre */}
              <h1 className="text-4xl pixel-font font-bold text-white mb-8 tracking-wider">
                LEVEL {level}
              </h1>
              
              {/* Message de chargement */}
              <div className="mb-6">
                {!handsDetected ? (
                  <>
                    <p className="text-xl pixel-font text-yellow-400 mb-4">
                      PLACE YOUR RIGHT HAND
                    </p>
                    <p className="text-sm pixel-font text-gray-400">
                      IN FRONT OF CAMERA
                    </p>
                  </>
                ) : (
                  <p className="text-xl pixel-font text-green-400 mb-4">
                    HAND DETECTED
                  </p>
                )}
              </div>
              
              {/* Barre de progression */}
              <div className="w-full bg-gray-800 h-6 pixel-border-sm mb-2" style={{ color: '#4b5563' }}>
                <div
                  className="h-full bg-purple-600 transition-all duration-300 ease-out relative"
                  style={{ width: `${loadingProgress}%` }}
                >
                  <div className="absolute inset-0 animate-pulse bg-white/20"></div>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm pixel-font mb-8">
                {Math.floor(loadingProgress)}%
              </p>
              
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
          <div className="backdrop-blur-sm backdrop-brightness-75 px-6 py-3 text-white text-xs pixel-font pixel-border-sm" style={{ color: '#374151' }}>
            PRESS ESC TO PAUSE
          </div>
        </div>
      </div>
    </div>
  );
}
