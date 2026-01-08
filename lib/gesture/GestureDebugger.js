/**
 * GestureDebugger.js
 * 
 * Affiche les informations de debug pour la reconnaissance de gestes
 * Implémente EXACTEMENT ce qui est décrit dans copilot-instructions.md :
 * 
 * - Squelette de la main (rouge pour droite, cyan pour gauche)
 * - Gros point jaune sur le centre de la paume
 * - Trainée des dernières positions avec gradient de transparence
 * - Panneau de configuration avec toggles
 * - Raccourcis clavier pour activer/désactiver les éléments
 * 
 * Choix de conception :
 * - Utilise p5.js pour le rendu (compatible avec le reste du projet)
 * - Toggles individuels pour chaque élément visuel
 * - Configuration persistante dans localStorage
 */

export class GestureDebugger {
  constructor(options = {}) {
    // Configuration d'affichage
    this.config = {
      showSkeleton: options.showSkeleton !== undefined ? options.showSkeleton : true,
      showPalmCenter: options.showPalmCenter !== undefined ? options.showPalmCenter : true,
      showTrail: options.showTrail !== undefined ? options.showTrail : true,
      showKeypoints: options.showKeypoints !== undefined ? options.showKeypoints : false,
      showLabels: options.showLabels !== undefined ? options.showLabels : false,
      showPanel: options.showPanel !== undefined ? options.showPanel : true
    };

    // Couleurs
    this.colors = {
      leftHand: [78, 205, 196],   // Cyan
      rightHand: [255, 107, 107],  // Rouge
      palmCenter: [255, 255, 0],   // Jaune
      trail: [255, 255, 255]       // Blanc
    };

    // Connexions des points pour le squelette
    this.connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],        // Pouce
      [0, 5], [5, 6], [6, 7], [7, 8],        // Index
      [0, 9], [9, 10], [10, 11], [11, 12],   // Majeur
      [0, 13], [13, 14], [14, 15], [15, 16], // Annulaire
      [0, 17], [17, 18], [18, 19], [19, 20]  // Auriculaire
    ];

    // Charger la config depuis localStorage
    this.loadConfig();
  }

  /**
   * Dessine le squelette d'une main (lignes entre les points)
   * @param {Object} hand - Objet main avec keypoints
   * @param {Object} p5 - Instance p5.js
   */
  drawSkeleton(hand, p5) {
    if (!this.config.showSkeleton) return;

    const color = hand.handedness === 'Left' 
      ? this.colors.leftHand 
      : this.colors.rightHand;

    p5.stroke(...color);
    p5.strokeWeight(2);

    for (const [start, end] of this.connections) {
      const pointA = hand.keypoints[start];
      const pointB = hand.keypoints[end];
      
      p5.line(pointA.x, pointA.y, pointB.x, pointB.y);
    }
  }

  /**
   * Dessine les points clés de la main
   * @param {Object} hand - Objet main avec keypoints
   * @param {Object} p5 - Instance p5.js
   */
  drawKeypoints(hand, p5) {
    if (!this.config.showKeypoints) return;

    const color = hand.handedness === 'Left' 
      ? this.colors.leftHand 
      : this.colors.rightHand;

    p5.fill(...color);
    p5.noStroke();

    for (const keypoint of hand.keypoints) {
      p5.circle(keypoint.x, keypoint.y, 8);
    }

    // Labels des points (si activé)
    if (this.config.showLabels) {
      p5.fill(255);
      p5.textSize(10);
      p5.textAlign(p5.CENTER, p5.CENTER);

      for (let i = 0; i < hand.keypoints.length; i++) {
        const kp = hand.keypoints[i];
        p5.text(i, kp.x, kp.y - 10);
      }
    }
  }

  /**
   * Dessine le gros point jaune au centre de la paume
   * @param {Object} palmCenter - { x, y }
   * @param {string} handedness - 'Left' ou 'Right'
   * @param {Object} p5 - Instance p5.js
   */
  drawPalmCenter(palmCenter, handedness, p5) {
    if (!this.config.showPalmCenter || !palmCenter) return;

    // Cercle jaune avec bordure blanche
    p5.fill(...this.colors.palmCenter);
    p5.stroke(255);
    p5.strokeWeight(3);
    p5.circle(palmCenter.x, palmCenter.y, 20);
    p5.noStroke();

    // Label optionnel
    if (this.config.showLabels) {
      p5.fill(0);
      p5.textSize(10);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.text(handedness === 'Left' ? 'L' : 'R', palmCenter.x, palmCenter.y);
    }
  }

  /**
   * Dessine la trainée (trail) avec gradient de transparence
   * @param {Array} trail - Tableau de points { x, y, frame }
   * @param {string} handedness - 'Left' ou 'Right'
   * @param {Object} p5 - Instance p5.js
   */
  drawTrail(trail, handedness, p5) {
    if (!this.config.showTrail || trail.length < 2) return;

    p5.noFill();
    p5.strokeWeight(4);

    // Dessiner la trainée avec gradient
    for (let i = 1; i < trail.length; i++) {
      const prev = trail[i - 1];
      const curr = trail[i];

      // Alpha croissant du plus ancien au plus récent
      const alpha = p5.map(i, 0, trail.length - 1, 50, 255);

      p5.stroke(...this.colors.trail, alpha);
      p5.line(prev.x, prev.y, curr.x, curr.y);
    }
  }

  /**
   * Dessine toutes les informations de debug pour une main
   * @param {Object} hand - Objet main
   * @param {Object} palmCenter - { x, y }
   * @param {Array} trail - Trajectoire
   * @param {Object} p5 - Instance p5.js
   */
  drawHand(hand, palmCenter, trail, p5) {
    if (!hand) return;

    // Ordre de rendu : trail → skeleton → keypoints → palm center
    this.drawTrail(trail, hand.handedness, p5);
    this.drawSkeleton(hand, p5);
    this.drawKeypoints(hand, p5);
    this.drawPalmCenter(palmCenter, hand.handedness, p5);
  }

  /**
   * Dessine le panneau de configuration
   * @param {Object} gestureInfo - { gesture, confidence } ou null
   * @param {Object} p5 - Instance p5.js
   */
  drawPanel(gestureInfo, p5) {
    if (!this.config.showPanel) return;

    // Fond semi-transparent
    p5.fill(15, 52, 96, 240);
    p5.noStroke();
    p5.rect(10, 10, 300, 180, 10);

    // Titre
    p5.fill(255);
    p5.textSize(16);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text('🔍 Debug Gestes', 20, 20);

    // Geste détecté
    if (gestureInfo) {
      p5.fill(22, 199, 154);
      p5.textSize(14);
      p5.text(`Geste: ${gestureInfo.gesture}`, 20, 45);
      
      const confidence = Math.floor(gestureInfo.confidence * 100);
      p5.text(`Confiance: ${confidence}%`, 20, 65);
    } else {
      p5.fill(200);
      p5.textSize(12);
      p5.text('Aucun geste détecté', 20, 45);
    }

    // Toggles
    p5.textSize(11);
    p5.fill(200);
    
    let y = 95;
    const toggles = [
      { key: 'S', name: 'Squelette', value: this.config.showSkeleton },
      { key: 'P', name: 'Centre paume', value: this.config.showPalmCenter },
      { key: 'T', name: 'Trainée', value: this.config.showTrail },
      { key: 'K', name: 'Points clés', value: this.config.showKeypoints },
      { key: 'L', name: 'Labels', value: this.config.showLabels }
    ];

    for (const toggle of toggles) {
      const status = toggle.value ? '✓' : '✗';
      const color = toggle.value ? [22, 199, 154] : [200, 200, 200];
      
      p5.fill(...color);
      p5.text(`[${toggle.key}] ${toggle.name}: ${status}`, 20, y);
      y += 18;
    }

    // Légende des couleurs
    p5.textSize(10);
    y = p5.height - 30;
    
    p5.fill(...this.colors.rightHand);
    p5.text('● Main Droite', p5.width - 200, y);
    
    p5.fill(...this.colors.leftHand);
    p5.text('● Main Gauche', p5.width - 100, y);
  }

  /**
   * Gère les raccourcis clavier
   * @param {string} key - Touche pressée
   */
  handleKeyPress(key) {
    const keyUpper = key.toUpperCase();

    switch (keyUpper) {
      case 'S':
        this.config.showSkeleton = !this.config.showSkeleton;
        break;
      case 'P':
        this.config.showPalmCenter = !this.config.showPalmCenter;
        break;
      case 'T':
        this.config.showTrail = !this.config.showTrail;
        break;
      case 'K':
        this.config.showKeypoints = !this.config.showKeypoints;
        break;
      case 'L':
        this.config.showLabels = !this.config.showLabels;
        break;
      case 'H': // H pour Hide/Show panel
        this.config.showPanel = !this.config.showPanel;
        break;
    }

    this.saveConfig();
  }

  /**
   * Sauvegarde la configuration dans localStorage
   */
  saveConfig() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('gestureDebugConfig', JSON.stringify(this.config));
    }
  }

  /**
   * Charge la configuration depuis localStorage
   */
  loadConfig() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('gestureDebugConfig');
      if (saved) {
        try {
          this.config = { ...this.config, ...JSON.parse(saved) };
        } catch (e) {
          console.warn('Erreur lors du chargement de la config debug');
        }
      }
    }
  }

  /**
   * Réinitialise la configuration par défaut
   */
  resetConfig() {
    this.config = {
      showSkeleton: true,
      showPalmCenter: true,
      showTrail: true,
      showKeypoints: false,
      showLabels: false,
      showPanel: true
    };
    this.saveConfig();
  }

  /**
   * Active/désactive tous les éléments de debug
   * @param {boolean} enabled
   */
  setDebugEnabled(enabled) {
    this.config.showSkeleton = enabled;
    this.config.showPalmCenter = enabled;
    this.config.showTrail = enabled;
    this.config.showKeypoints = enabled;
    this.config.showLabels = enabled;
    this.saveConfig();
  }
}
