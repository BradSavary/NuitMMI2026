import { useEffect, useRef } from 'react';

/**
 * Hook personnalisé pour gérer l'audio du jeu
 * @param {boolean} isPaused - État de pause du jeu
 * @returns {object} - Fonctions pour jouer les sons
 */
export function useGameAudio(isPaused = false) {
  const audioRefs = useRef({});
  const isPausedRef = useRef(isPaused);

  // Synchroniser isPausedRef avec isPaused
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Initialiser les sons
  useEffect(() => {
    audioRefs.current = {
      damage: new Audio('/sounds/damage.mp3'),
      fireball: new Audio('/sounds/fireball.mp3'),
      footsteps: new Audio('/sounds/footsteps.mp3'),
      icespear: new Audio('/sounds/icespear.mp3'),
      lightning: new Audio('/sounds/lightning.mp3'),
      levelSong: new Audio('/sounds/level-song.mp3'),
      mainSong: new Audio('/sounds/main-song.mp3'),
      shield: new Audio('/sounds/shield.mp3'),
    };

    // Configurer les sons en boucle
    audioRefs.current.footsteps.loop = true;
    audioRefs.current.levelSong.loop = true;
    audioRefs.current.mainSong.loop = true;

    // Ajuster les volumes
    audioRefs.current.footsteps.volume = 0.9;
    audioRefs.current.levelSong.volume = 0.4;
    audioRefs.current.mainSong.volume = 0.4;
    audioRefs.current.damage.volume = 0.6;
    audioRefs.current.fireball.volume = 0.5;
    audioRefs.current.icespear.volume = 0.5;
    audioRefs.current.lightning.volume = 0.5;
    audioRefs.current.shield.volume = 0.6;

    // Cleanup: arrêter tous les sons quand le composant est démonté
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

  // Fonction pour jouer un son
  const playSound = (soundName) => {
    if (isPausedRef.current) return;
    
    const audio = audioRefs.current[soundName];
    if (audio) {
      // Pour les sons non-loopés, les rejouer depuis le début
      if (!audio.loop) {
        audio.currentTime = 0;
      }
      audio.play().catch(err => {
        console.log(`Erreur lors de la lecture du son ${soundName}:`, err);
      });
    }
  };

  // Fonction pour arrêter un son
  const stopSound = (soundName) => {
    const audio = audioRefs.current[soundName];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  };

  // Fonction pour mettre en pause/reprendre tous les sons en boucle
  useEffect(() => {
    const loopingSounds = ['footsteps', 'levelSong', 'mainSong'];
    loopingSounds.forEach(soundName => {
      const audio = audioRefs.current[soundName];
      if (audio && !audio.paused) {
        if (isPaused) {
          audio.pause();
        } else {
          audio.play().catch(err => console.log(`Erreur reprise ${soundName}:`, err));
        }
      }
    });
  }, [isPaused]);

  return {
    playSound,
    stopSound,
    audioRefs,
  };
}
