/**
 * GestureRecognizer.js
 
 * 
 * Gestes supportés :
 * - Cercle : variance faible des distances au centre
 * - Ligne horizontale : régression linéaire + faible variation Y
 * - Ligne verticale : régression linéaire + faible variation X
 * - Zigzag : comptage des inversions de direction
 * - Spirale : distance croissante + rotation continue
 * - Wave : oscillations régulières en Y
 * - Triangle : détection de 3 coins
 * - Carré : détection de 4 coins
 * 
 * Choix de conception :
 * - Algorithmes mathématiques purs (pas de ML)
 * - Seuil configurable PAR GESTE
 * - Trainée de 80 points = ~1.3s à 60 FPS
 * - Cooldown pour éviter détections multiples
 * - Fade out automatique après 2s
 */

export class GestureRecognizer {
  constructor(options = {}) {
    // Trajectoires par main
    this.leftHandTrail = [];
    this.rightHandTrail = [];
    
    // Configuration
    this.maxTrailLength = options.maxTrailLength || 80; // ~1.3s à 60fps
    this.fadeOutTime = options.fadeOutTime || 120; // 2s à 60fps
    this.cooldownFrames = options.cooldownFrames || 30; // 0.5s à 60fps
    
    // État de la détection
    this.lastDetectionFrame = 0;
    this.currentFrame = 0;
    this.lastGesture = null;
    
    // Seuils de confiance par geste (configurables)
    this.thresholds = {
      circle: options.circleThreshold || 0.9,
      horizontalLine: options.horizontalLineThreshold || 0.75,
      verticalLine: options.verticalLineThreshold || 0.75,
      zigzag: options.zigzagThreshold || 0.9,
      spiral: options.spiralThreshold || 0.65,
      wave: options.waveThreshold || 0.6,
      triangle: options.triangleThreshold || 0.7,
      square: options.squareThreshold || 0.1,
      ...options.thresholds // Permet de surcharger individuellement
    };
  }

  /**
   * Met à jour la trajectoire d'une main
   * @param {string} hand - 'left' ou 'right'
   * @param {Object} palmCenter - { x, y }
   */
  updateTrail(hand, palmCenter) {
    this.currentFrame++;
    
    if (!palmCenter) return;

    const trail = hand === 'left' ? this.leftHandTrail : this.rightHandTrail;
    
    // Ajouter le point avec timestamp
    trail.push({
      x: palmCenter.x,
      y: palmCenter.y,
      frame: this.currentFrame
    });

    // Limiter la longueur
    if (trail.length > this.maxTrailLength) {
      trail.shift();
    }
  }

  /**
   * Efface progressivement la trajectoire si la main n'est plus détectée
   * @param {string} hand - 'left' ou 'right'
   */
  fadeOutTrail(hand) {
    const trail = hand === 'left' ? this.leftHandTrail : this.rightHandTrail;
    
    if (trail.length > 0) {
      // Supprimer le point le plus ancien
      trail.shift();
    }
  }

  /**
   * Efface complètement une trajectoire
   * @param {string} hand - 'left' ou 'right'
   */
  clearTrail(hand) {
    if (hand === 'left') {
      this.leftHandTrail = [];
    } else if (hand === 'right') {
      this.rightHandTrail = [];
    }
  }

  /**
   * Obtient la trajectoire d'une main
   * @param {string} hand - 'left' ou 'right'
   * @returns {Array} - Tableau de points { x, y, frame }
   */
  getTrail(hand) {
    return hand === 'left' ? this.leftHandTrail : this.rightHandTrail;
  }

  /**
   * Vérifie si un geste est en cooldown
   * @returns {boolean}
   */
  isInCooldown() {
    return (this.currentFrame - this.lastDetectionFrame) < this.cooldownFrames;
  }

  /**
   * Reconnaît tous les gestes possibles sur une trajectoire
   * @param {string} hand - 'left' ou 'right'
   * @param {Object} handData - Données complètes de la main (pour gestes statiques)
   * @returns {Object} { gesture: string, confidence: number } ou null
   */
  recognizeGesture(hand, handData = null) {
    if (this.isInCooldown()) {
      return null;
    }

    const trail = this.getTrail(hand);
    
    // Vérifier d'abord les gestes statiques (ne nécessitent pas de trajectoire)
    if (handData && hand === 'right') {
      const staticGesture = this.checkStaticGestures(handData);
      if (staticGesture) {
        this.lastDetectionFrame = this.currentFrame;
        this.lastGesture = staticGesture;
        return staticGesture;
      }
    }
    
    if (trail.length < 20) { // Minimum de points requis
      return null;
    }

    // Tester tous les gestes dynamiques (basés sur la trajectoire)
    const results = [
      { gesture: 'circle', confidence: this.checkCircle(trail) },
      { gesture: 'zigzag', confidence: this.checkZigzag(trail) },
      { gesture: 'triangle', confidence: this.checkTriangle(trail) },
      { gesture: 'square', confidence: this.checkSquare(trail) }
    ];

    // Trouver le geste avec la meilleure confiance au-dessus du seuil
    let bestMatch = null;
    let bestConfidence = 0;

    for (const result of results) {
      const threshold = this.thresholds[result.gesture] || 0.7;
      
      if (result.confidence > threshold && result.confidence > bestConfidence) {
        bestMatch = result.gesture;
        bestConfidence = result.confidence;
      }
    }

    if (bestMatch) {
      this.lastDetectionFrame = this.currentFrame;
      this.lastGesture = { gesture: bestMatch, confidence: bestConfidence };
      return this.lastGesture;
    }

    return null;
  }

  /**
   * Vérifie les gestes statiques (poses de main)
   * @param {Object} handData - Objet main avec keypoints de ml5
   * @returns {Object|null} - { gesture, confidence } ou null
   */
  checkStaticGestures(handData) {
    // Geste "poing levé" (main fermée en haut)
    const fistRaised = this.checkFistRaised(handData);
    if (fistRaised > (this.thresholds.fistRaised || 0.8)) {
      return { gesture: 'fistRaised', confidence: fistRaised };
    }

    return null;
  }

  /**
   * Détecte si la main droite est fermée (poing) et levée en haut
   * @param {Object} hand - Objet main avec keypoints
   * @returns {number} - Score de confiance 0-1
   */
  checkFistRaised(hand) {
    if (!hand || !hand.keypoints || hand.keypoints.length < 21) {
      return 0;
    }

    const keypoints = hand.keypoints;

    // 1. Vérifier que la main est en HAUT (75% supérieur de l'écran)
    const wrist = keypoints[0]; // Point 0 = poignet
    const indexTip = keypoints[8];
    
    // Utiliser la position de l'index comme référence (plus haut que le poignet)
    const handY = Math.min(wrist.y, indexTip.y);
    
    // ATTENTION : En coordonnées écran, Y=0 est EN HAUT !
    // Donc une petite valeur Y = main en haut
    const screenHeight = 480;
    const topThreshold = screenHeight * 0.85; // 85% du haut

    const isHigh = handY < topThreshold;
    
    // Debug (uniquement si besoin)
    if (typeof window !== 'undefined' && window.DEBUG_GESTURES) {
      console.log('FistRaised check:', {
        handY,
        topThreshold,
        isHigh
      });
    }

    if (!isHigh) {
      return 0; // Main pas assez haute
    }

    // 2. Vérifier que la main est FERMÉE
    // Stratégie simplifiée : comparer distances des bouts de doigts vs articulations moyennes
    
    const thumbTip = keypoints[4];
    const middleTip = keypoints[12];
    const ringTip = keypoints[16];
    const pinkyTip = keypoints[20];

    // Fonction pour calculer la distance
    const dist = (p1, p2) => Math.sqrt(
      Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
    );

    // Calculer la distance moyenne des bouts de doigts au poignet
    const avgTipDistance = (
      dist(wrist, indexTip) +
      dist(wrist, middleTip) +
      dist(wrist, ringTip) +
      dist(wrist, pinkyTip)
    ) / 4;

    // Pour une main fermée, la distance moyenne devrait être petite
    // Main ouverte : ~150-200px, Main fermée : ~80-120px
    const isClosedByDistance = avgTipDistance < 130;

    // Alternative : vérifier que les doigts sont proches les uns des autres (main compacte)
    const indexMiddleDist = dist(indexTip, middleTip);
    const middleRingDist = dist(middleTip, ringTip);
    const ringPinkyDist = dist(ringTip, pinkyTip);
    
    const avgFingerSpacing = (indexMiddleDist + middleRingDist + ringPinkyDist) / 3;
    const isCompact = avgFingerSpacing < 40; // Doigts rapprochés

    // Debug
    if (typeof window !== 'undefined' && window.DEBUG_GESTURES) {
      console.log('Fist closure check:', {
        avgTipDistance,
        isClosedByDistance,
        avgFingerSpacing,
        isCompact
      });
    }

    // Score : main haute + (main fermée OU compacte)
    let confidence = 0;
    
    if (isHigh && (isClosedByDistance || isCompact)) {
      // Base score
      confidence = 0.7;
      
      // Bonus si très haute
      if (handY < screenHeight * 0.25) {
        confidence += 0.15;
      }
      
      // Bonus si les deux critères de fermeture sont remplis
      if (isClosedByDistance && isCompact) {
        confidence += 0.15;
      }
    }

    return Math.min(confidence, 1);
  }

  // ============ ALGORITHMES DE DÉTECTION ============

  /**
   * Détecte un cercle
   * Algorithme amélioré : variance des distances + couverture angulaire + compacité
   */
  checkCircle(trail) {
    if (trail.length < 30) return 0;

    // Calculer le centre de la trajectoire
    const center = this.getCenter(trail);
    
    // Calculer les distances au centre
    const distances = trail.map(p => 
      Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2))
    );

    // Moyenne et écart-type
    const avgDist = distances.reduce((a, b) => a + b) / distances.length;
    const variance = distances.reduce((sum, d) => 
      sum + Math.pow(d - avgDist, 2), 0
    ) / distances.length;
    const stdDev = Math.sqrt(variance);

    // Un cercle a un faible écart-type relatif
    const circularity = 1 - Math.min(stdDev / avgDist, 1);

    // Le rayon doit être suffisamment grand (au moins 40 pixels)
    if (avgDist < 40) return 0;

    // Vérifier la couverture angulaire (doit couvrir au moins 3 quadrants sur 4)
    const coverage = this.checkAngularCoverage(trail, center);
    
    // Vérifier que le début et la fin sont proches (cercle fermé)
    const firstPoint = trail[0];
    const lastPoint = trail[trail.length - 1];
    const closureDistance = Math.sqrt(
      Math.pow(lastPoint.x - firstPoint.x, 2) + 
      Math.pow(lastPoint.y - firstPoint.y, 2)
    );
    
    // Bonus si le cercle est bien fermé
    const closureBonus = closureDistance < 80 ? 1.1 : 1.0;

    // Score final : circularité * couverture * bonus fermeture
    const score = circularity * coverage * closureBonus;

    // Minimum de 0.65 de couverture angulaire requis
    return coverage >= 0.65 ? Math.min(score, 1) : 0;
  }

  /**
   * Détecte une ligne horizontale
   * Algorithme : variation Y faible, variation X grande
   */
  checkHorizontalLine(trail) {
    if (trail.length < 20) return 0;

    const xValues = trail.map(p => p.x);
    const yValues = trail.map(p => p.y);

    const xRange = Math.max(...xValues) - Math.min(...xValues);
    const yRange = Math.max(...yValues) - Math.min(...yValues);

    if (xRange < 100) return 0; // Ligne trop courte

    // Ratio de linéarité
    const horizontality = 1 - Math.min(yRange / xRange, 1);

    // Vérifier la régression linéaire
    const linearity = this.checkLinearity(trail);

    return horizontality > 0.7 ? horizontality * linearity : 0;
  }

  /**
   * Détecte une ligne verticale
   * Algorithme : variation X faible, variation Y grande
   */
  checkVerticalLine(trail) {
    if (trail.length < 20) return 0;

    const xValues = trail.map(p => p.x);
    const yValues = trail.map(p => p.y);

    const xRange = Math.max(...xValues) - Math.min(...xValues);
    const yRange = Math.max(...yValues) - Math.min(...yValues);

    if (yRange < 100) return 0;

    const verticality = 1 - Math.min(xRange / yRange, 1);
    const linearity = this.checkLinearity(trail);

    return verticality > 0.7 ? verticality * linearity : 0;
  }

  /**
   * Détecte un zigzag
   * Algorithme : comptage des inversions de direction en X
   */
  checkZigzag(trail) {
    if (trail.length < 25) return 0;

    let directionChanges = 0;
    let lastDirection = 0;

    for (let i = 1; i < trail.length; i++) {
      const dx = trail[i].x - trail[i - 1].x;
      
      if (Math.abs(dx) > 3) { // Seuil de mouvement significatif
        const currentDirection = dx > 0 ? 1 : -1;
        
        if (lastDirection !== 0 && currentDirection !== lastDirection) {
          directionChanges++;
        }
        
        lastDirection = currentDirection;
      }
    }

    // Un zigzag doit avoir au moins 3 changements
    return directionChanges >= 3 ? Math.min(directionChanges / 6, 1) : 0;
  }

  /**
   * Détecte une spirale
   * Algorithme : distance croissante + rotation continue
   */
  checkSpiral(trail) {
    if (trail.length < 40) return 0;

    const center = this.getCenter(trail);
    
    // Calculer les distances et angles
    let distances = [];
    let angles = [];

    for (const point of trail) {
      const dist = Math.sqrt(
        Math.pow(point.x - center.x, 2) + 
        Math.pow(point.y - center.y, 2)
      );
      const angle = Math.atan2(point.y - center.y, point.x - center.x);
      
      distances.push(dist);
      angles.push(angle);
    }

    // Vérifier que la distance augmente
    let increasing = 0;
    for (let i = 1; i < distances.length; i++) {
      if (distances[i] > distances[i - 1]) increasing++;
    }
    const growthRatio = increasing / distances.length;

    // Vérifier la rotation totale (doit faire au moins 1 tour)
    const totalRotation = this.calculateTotalRotation(angles);

    const spiralScore = growthRatio * Math.min(totalRotation / (2 * Math.PI), 1);
    
    return spiralScore > 0.5 ? spiralScore : 0;
  }

  /**
   * Détecte un wave (vague)
   * Algorithme : oscillations régulières en Y
   */
  checkWave(trail) {
    if (trail.length < 30) return 0;

    const yValues = trail.map(p => p.y);
    
    // Détecter les pics et vallées
    let peaks = 0;
    let valleys = 0;

    for (let i = 1; i < yValues.length - 1; i++) {
      if (yValues[i] > yValues[i - 1] && yValues[i] > yValues[i + 1]) {
        peaks++;
      }
      if (yValues[i] < yValues[i - 1] && yValues[i] < yValues[i + 1]) {
        valleys++;
      }
    }

    const oscillations = Math.min(peaks, valleys);
    
    // Une vague doit avoir au moins 2 oscillations
    return oscillations >= 2 ? Math.min(oscillations / 4, 1) : 0;
  }

  /**
   * Détecte un triangle
   * Algorithme simplifié : détection de 3 segments distincts avec changements de direction
   */
  checkTriangle(trail) {
    if (trail.length < 35) return 0;

    // Diviser la trajectoire en 3 segments égaux
    const segmentSize = Math.floor(trail.length / 3);
    const segments = [
      trail.slice(0, segmentSize),
      trail.slice(segmentSize, segmentSize * 2),
      trail.slice(segmentSize * 2)
    ];

    // Vérifier que chaque segment est relativement droit
    let totalStraightness = 0;
    for (const segment of segments) {
      if (segment.length < 5) continue;
      
      const linearity = this.checkSegmentLinearity(segment);
      totalStraightness += linearity;
    }

    const avgStraightness = totalStraightness / 3;

    // Compter les changements de direction marqués (coins)
    const directionChanges = this.countDirectionChanges(trail, 8); // Fenêtre de 8 points

    // Un triangle doit avoir au moins 2-3 changements de direction nets
    const hasEnoughCorners = directionChanges >= 2 && directionChanges <= 4;

    // Score final : segments droits + bon nombre de coins
    if (avgStraightness > 0.6 && hasEnoughCorners) {
      return avgStraightness * 0.8; // Légèrement pénalisé pour être plus strict
    }

    return 0;
  }

  /**
   * Détecte un carré
   * Algorithme simplifié : 4 segments droits + 3-4 changements de direction
   */
  checkSquare(trail) {
    if (trail.length < 45) return 0;

    // Diviser la trajectoire en 4 segments égaux
    const segmentSize = Math.floor(trail.length / 4);
    const segments = [
      trail.slice(0, segmentSize),
      trail.slice(segmentSize, segmentSize * 2),
      trail.slice(segmentSize * 2, segmentSize * 3),
      trail.slice(segmentSize * 3)
    ];

    // Vérifier que chaque segment est relativement droit
    let totalStraightness = 0;
    for (const segment of segments) {
      if (segment.length < 5) continue;
      
      const linearity = this.checkSegmentLinearity(segment);
      totalStraightness += linearity;
    }

    const avgStraightness = totalStraightness / 4;

    // Compter les changements de direction marqués
    const directionChanges = this.countDirectionChanges(trail, 8);

    // Un carré doit avoir 3-4 changements de direction nets
    const hasEnoughCorners = directionChanges >= 3 && directionChanges <= 5;

    // Vérifier que la forme revient près du point de départ (carré fermé)
    const firstPoint = trail[0];
    const lastPoint = trail[trail.length - 1];
    const closureDistance = Math.sqrt(
      Math.pow(lastPoint.x - firstPoint.x, 2) + 
      Math.pow(lastPoint.y - firstPoint.y, 2)
    );
    
    // Le carré doit se refermer (distance < 100 pixels)
    const isClosed = closureDistance < 100;

    // Score final
    if (avgStraightness > 0.65 && hasEnoughCorners && isClosed) {
      return avgStraightness * 0.85; // Légèrement pénalisé
    }

    return 0;
  }

  // ============ FONCTIONS UTILITAIRES ============

  getCenter(trail) {
    const sumX = trail.reduce((sum, p) => sum + p.x, 0);
    const sumY = trail.reduce((sum, p) => sum + p.y, 0);
    return { x: sumX / trail.length, y: sumY / trail.length };
  }

  /**
   * Vérifie la linéarité d'un segment
   * Retourne un score entre 0 et 1 (1 = parfaitement droit)
   */
  checkSegmentLinearity(segment) {
    if (segment.length < 3) return 0;

    const first = segment[0];
    const last = segment[segment.length - 1];
    
    // Distance directe entre début et fin
    const directDist = Math.sqrt(
      Math.pow(last.x - first.x, 2) + 
      Math.pow(last.y - first.y, 2)
    );

    // Distance parcourue réelle
    let pathLength = 0;
    for (let i = 1; i < segment.length; i++) {
      pathLength += Math.sqrt(
        Math.pow(segment[i].x - segment[i-1].x, 2) + 
        Math.pow(segment[i].y - segment[i-1].y, 2)
      );
    }

    // Plus le ratio est proche de 1, plus c'est droit
    if (pathLength === 0) return 0;
    return Math.min(directDist / pathLength, 1);
  }

  /**
   * Compte les changements de direction significatifs
   * windowSize : taille de la fenêtre pour détecter les changements
   */
  countDirectionChanges(trail, windowSize = 8) {
    if (trail.length < windowSize * 2) return 0;

    let changes = 0;
    
    for (let i = windowSize; i < trail.length - windowSize; i++) {
      const before = trail[i - windowSize];
      const current = trail[i];
      const after = trail[i + windowSize];

      // Calculer les angles
      const angle1 = Math.atan2(current.y - before.y, current.x - before.x);
      const angle2 = Math.atan2(after.y - current.y, after.x - current.x);

      // Différence d'angle
      let angleDiff = Math.abs(angle2 - angle1);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

      // Changement significatif si > 45° (π/4)
      if (angleDiff > Math.PI / 4) {
        changes++;
        i += windowSize; // Sauter pour éviter de compter le même coin plusieurs fois
      }
    }

    return changes;
  }

  checkAngularCoverage(trail, center) {
    const angles = trail.map(p => 
      Math.atan2(p.y - center.y, p.x - center.x)
    );

    // Convertir en [0, 2π]
    const normalizedAngles = angles.map(a => a < 0 ? a + 2 * Math.PI : a);
    
    // Compter les quadrants couverts
    const quadrants = new Set(normalizedAngles.map(a => Math.floor(a / (Math.PI / 2))));
    
    return quadrants.size / 4; // 4 quadrants = cercle complet
  }

  checkLinearity(trail) {
    // Régression linéaire simple
    const n = trail.length;
    const sumX = trail.reduce((sum, p) => sum + p.x, 0);
    const sumY = trail.reduce((sum, p) => sum + p.y, 0);
    const sumXY = trail.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = trail.reduce((sum, p) => sum + p.x * p.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculer R² (coefficient de détermination)
    const meanY = sumY / n;
    let ssRes = 0;
    let ssTot = 0;

    for (const point of trail) {
      const predicted = slope * point.x + intercept;
      ssRes += Math.pow(point.y - predicted, 2);
      ssTot += Math.pow(point.y - meanY, 2);
    }

    const r2 = 1 - (ssRes / ssTot);
    return Math.max(0, r2); // R² entre 0 et 1
  }

  calculateTotalRotation(angles) {
    let totalRotation = 0;
    
    for (let i = 1; i < angles.length; i++) {
      let diff = angles[i] - angles[i - 1];
      
      // Normaliser la différence entre -π et π
      if (diff > Math.PI) diff -= 2 * Math.PI;
      if (diff < -Math.PI) diff += 2 * Math.PI;
      
      totalRotation += Math.abs(diff);
    }

    return totalRotation;
  }

  detectCorners(trail, expectedCount) {
    const corners = [];
    const threshold = 0.5; // Seuil de changement d'angle (radians)

    for (let i = 5; i < trail.length - 5; i++) {
      const before = trail[i - 5];
      const current = trail[i];
      const after = trail[i + 5];

      const angle1 = Math.atan2(current.y - before.y, current.x - before.x);
      const angle2 = Math.atan2(after.y - current.y, after.x - current.x);

      let angleDiff = Math.abs(angle2 - angle1);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

      if (angleDiff > threshold) {
        corners.push({ point: current, angle: angleDiff });
      }
    }

    // Garder les N coins les plus marqués
    corners.sort((a, b) => b.angle - a.angle);
    return corners.slice(0, expectedCount);
  }

  getCornerAngles(corners) {
    const angles = [];
    
    for (let i = 0; i < corners.length; i++) {
      const current = corners[i];
      const next = corners[(i + 1) % corners.length];
      
      const angle = Math.atan2(
        next.point.y - current.point.y,
        next.point.x - current.point.x
      );
      
      angles.push(Math.abs(angle));
    }

    return angles;
  }
}
