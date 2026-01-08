/**
 * HandPoseManager.js
 * 
 * Gère la détection des mains avec ml5.js HandPose (MediaPipe)
 * - Initialise la caméra et le modèle HandPose
 * - Détecte 21 points sur chaque main
 * - Suit le CENTRE DE LA PAUME (moyenne de 5 points clés)
 * - Gère 2 mains simultanément mais suit une seule main "active"
 * 
 * Choix de conception :
 * - Utilise MediaPipe (meilleur que tfjs pour HandPose)
 * - Le centre de la paume est calculé depuis les points 0, 5, 9, 13, 17
 *   (wrist + base de chaque doigt) pour plus de stabilité
 * - Système async/await pour ne pas bloquer le rendu
 */

export class HandPoseManager {
  constructor() {
    this.handPose = null;
    this.video = null;
    this.hands = [];
    this.isModelReady = false;
    this.isVideoReady = false;
    this.activeHand = 'right'; // Main active par défaut : 'left' ou 'right'
    this.onHandsDetected = null; // Callback pour les résultats
  }

  /**
   * Initialise le modèle HandPose avec ml5.js
   * @param {Object} options - Options de configuration
   * @param {boolean} options.flipped - Miroir de la caméra (true par défaut)
   * @param {number} options.maxHands - Nombre max de mains (2 par défaut)
   * @param {string} options.runtime - 'mediapipe' ou 'tfjs' (mediapipe par défaut)
   * @param {string} options.modelType - 'full' ou 'lite' (full par défaut)
   */
  async initModel(options = {}) {
    const defaultOptions = {
      flipped: true,
      maxHands: 2,
      runtime: 'mediapipe', // MediaPipe est plus performant que tfjs
      modelType: 'full' // 'full' est plus précis que 'lite'
    };

    const config = { ...defaultOptions, ...options };

    try {
      // Charger ml5 dynamiquement côté client
      if (typeof window !== 'undefined' && window.ml5) {
        this.handPose = await window.ml5.handPose(config);
        this.isModelReady = true;
        console.log('✅ HandPose modèle chargé avec succès');
        return true;
      } else {
        throw new Error('ml5.js n\'est pas chargé');
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du modèle HandPose:', error);
      return false;
    }
  }

  /**
   * Initialise la caméra vidéo
   * @param {Object} constraints - Contraintes de la caméra
   */
  async initCamera(constraints = {}) {
    const defaultConstraints = {
      video: {
        width: 640,
        height: 480,
        facingMode: 'user' // Caméra frontale
      },
      audio: false
    };

    const config = { ...defaultConstraints, ...constraints };

    try {
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia(config);
        
        // Créer un élément vidéo HTML (pas p5.js pour plus de contrôle)
        this.video = document.createElement('video');
        this.video.srcObject = stream;
        this.video.width = config.video.width;
        this.video.height = config.video.height;
        this.video.autoplay = true;
        this.video.playsInline = true; // Important pour iOS

        // Attendre que la vidéo soit prête
        await new Promise((resolve) => {
          this.video.onloadedmetadata = () => {
            this.isVideoReady = true;
            console.log('✅ Caméra initialisée');
            resolve();
          };
        });

        return true;
      } else {
        throw new Error('MediaDevices API non disponible');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la caméra:', error);
      return false;
    }
  }

  /**
   * Démarre la détection des mains
   */
  startDetection() {
    if (!this.isModelReady || !this.isVideoReady) {
      console.warn('⚠️ Modèle ou caméra pas prêt');
      return false;
    }

    // Lancer la détection continue
    this.handPose.detectStart(this.video, (results) => {
      this.hands = results;
      
      // Appeler le callback si défini
      if (this.onHandsDetected) {
        this.onHandsDetected(results);
      }
    });

    console.log('✅ Détection des mains démarrée');
    return true;
  }

  /**
   * Arrête la détection
   */
  stopDetection() {
    if (this.handPose) {
      this.handPose.detectStop();
      console.log('⏹️ Détection arrêtée');
    }
  }

  /**
   * Obtient les mains détectées séparées (gauche/droite)
   * @returns {Object} { leftHand, rightHand }
   */
  getHands() {
    let leftHand = null;
    let rightHand = null;

    for (const hand of this.hands) {
      // Note: HandPose retourne "Left" pour la main gauche dans l'image (main droite réelle si flipped)
      if (hand.handedness === 'Left') {
        leftHand = hand;
      } else if (hand.handedness === 'Right') {
        rightHand = hand;
      }
    }

    return { leftHand, rightHand };
  }

  /**
   * Calcule le centre de la paume à partir des points clés
   * Utilise les points 0 (wrist), 5, 9, 13, 17 (base de chaque doigt)
   * pour un centre plus stable que le wrist seul
   * 
   * @param {Object} hand - Objet main avec keypoints
   * @returns {Object} { x, y } - Position du centre de la paume
   */
  getPalmCenter(hand) {
    if (!hand || !hand.keypoints || hand.keypoints.length < 21) {
      return null;
    }

    // Indices des points clés pour le centre de la paume
    const palmIndices = [0, 5, 9, 13, 17];
    
    let sumX = 0;
    let sumY = 0;

    for (const index of palmIndices) {
      sumX += hand.keypoints[index].x;
      sumY += hand.keypoints[index].y;
    }

    return {
      x: sumX / palmIndices.length,
      y: sumY / palmIndices.length
    };
  }

  /**
   * Obtient la main active actuellement suivie
   * @returns {Object|null} - Objet main ou null
   */
  getActiveHand() {
    const { leftHand, rightHand } = this.getHands();
    
    if (this.activeHand === 'left') {
      return leftHand;
    } else if (this.activeHand === 'right') {
      return rightHand;
    }
    
    // Si la main active n'est pas détectée, retourner l'autre
    return leftHand || rightHand;
  }

  /**
   * Change la main active à suivre
   * @param {string} hand - 'left' ou 'right'
   */
  setActiveHand(hand) {
    if (hand === 'left' || hand === 'right') {
      this.activeHand = hand;
      console.log(`👋 Main active changée: ${hand}`);
    }
  }

  /**
   * Nettoie les ressources
   */
  cleanup() {
    this.stopDetection();
    
    if (this.video && this.video.srcObject) {
      const tracks = this.video.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      this.video.srcObject = null;
    }

    this.hands = [];
    this.isModelReady = false;
    this.isVideoReady = false;
    
    console.log('🧹 Ressources nettoyées');
  }
}
