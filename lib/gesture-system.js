// Fichier qui exporte tout le système de gestes pour Next.js
// Compatible avec le chargement côté client

export class HandPoseManager {
  constructor() {
    this.handPose = null;
    this.video = null;
    this.hands = [];
    this.isModelReady = false;
    this.isVideoReady = false;
    this.activeHand = 'right';
    this.onHandsDetected = null;
  }

  async initModel(options = {}) {
    const defaultOptions = {
      flipped: true,
      maxHands: 2,
      runtime: 'mediapipe',
      modelType: 'full'
    };

    const config = { ...defaultOptions, ...options };

    try {
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

  async initCamera(constraints = {}) {
    const defaultConstraints = {
      video: {
        width: 640,
        height: 480,
        facingMode: 'user'
      },
      audio: false
    };

    const config = { ...defaultConstraints, ...constraints };

    try {
      if (typeof window !== 'undefined' && navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia(config);
        
        this.video = document.createElement('video');
        this.video.srcObject = stream;
        this.video.width = config.video.width;
        this.video.height = config.video.height;
        this.video.autoplay = true;
        this.video.playsInline = true;

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

  startDetection() {
    if (!this.isModelReady || !this.isVideoReady) {
      console.warn('⚠️ Modèle ou caméra pas prêt');
      return false;
    }

    this.handPose.detectStart(this.video, (results) => {
      this.hands = results;
      if (this.onHandsDetected) {
        this.onHandsDetected(results);
      }
    });

    console.log('✅ Détection des mains démarrée');
    return true;
  }

  stopDetection() {
    if (this.handPose) {
      this.handPose.detectStop();
      console.log('⏹️ Détection arrêtée');
    }
  }

  getHands() {
    let leftHand = null;
    let rightHand = null;

    for (const hand of this.hands) {
      if (hand.handedness === 'Left') {
        leftHand = hand;
      } else if (hand.handedness === 'Right') {
        rightHand = hand;
      }
    }

    return { leftHand, rightHand };
  }

  getPalmCenter(hand) {
    if (!hand || !hand.keypoints || hand.keypoints.length < 21) {
      return null;
    }

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

  getActiveHand() {
    const { leftHand, rightHand } = this.getHands();
    
    if (this.activeHand === 'left') {
      return leftHand;
    } else if (this.activeHand === 'right') {
      return rightHand;
    }
    
    return leftHand || rightHand;
  }

  setActiveHand(hand) {
    if (hand === 'left' || hand === 'right') {
      this.activeHand = hand;
      console.log(`👋 Main active changée: ${hand}`);
    }
  }

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

export class GestureRecognizer {
  constructor(options = {}) {
    this.leftHandTrail = [];
    this.rightHandTrail = [];
    
    this.maxTrailLength = options.maxTrailLength || 80;
    this.fadeOutTime = options.fadeOutTime || 120;
    this.cooldownFrames = options.cooldownFrames || 30;
    
    this.lastDetectionFrame = 0;
    this.currentFrame = 0;
    this.lastGesture = null;
    
    this.thresholds = {
      circle: options.circleThreshold || 0.7,
      horizontalLine: options.horizontalLineThreshold || 0.65, // Réduit de 0.75 à 0.65
      verticalLine: options.verticalLineThreshold || 0.75,
      zigzag: options.zigzagThreshold || 0.6,
      spiral: options.spiralThreshold || 0.65,
      wave: options.waveThreshold || 0.6,
      triangle: options.triangleThreshold || 0.65,
      square: options.squareThreshold || 0.7,
      ...options.thresholds
    };
  }

  updateTrail(hand, palmCenter) {
    this.currentFrame++;
    
    if (!palmCenter) return;

    const trail = hand === 'left' ? this.leftHandTrail : this.rightHandTrail;
    
    trail.push({
      x: palmCenter.x,
      y: palmCenter.y,
      frame: this.currentFrame
    });

    if (trail.length > this.maxTrailLength) {
      trail.shift();
    }
  }

  fadeOutTrail(hand) {
    const trail = hand === 'left' ? this.leftHandTrail : this.rightHandTrail;
    
    if (trail.length > 0) {
      trail.shift();
    }
  }

  clearTrail(hand) {
    if (hand === 'left') {
      this.leftHandTrail = [];
    } else if (hand === 'right') {
      this.rightHandTrail = [];
    }
  }

  getTrail(hand) {
    return hand === 'left' ? this.leftHandTrail : this.rightHandTrail;
  }

  isInCooldown() {
    return (this.currentFrame - this.lastDetectionFrame) < this.cooldownFrames;
  }

  recognizeGesture(hand) {
    if (this.isInCooldown()) {
      return null;
    }

    const trail = this.getTrail(hand);
    
    if (trail.length < 20) {
      return null;
    }

    const results = [
      { gesture: 'circle', confidence: this.checkCircle(trail) },
      { gesture: 'horizontalLine', confidence: this.checkHorizontalLine(trail) },
      { gesture: 'verticalLine', confidence: this.checkVerticalLine(trail) },
      { gesture: 'zigzag', confidence: this.checkZigzag(trail) }
    ];

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

  checkCircle(trail) {
    if (trail.length < 30) return 0;

    const center = this.getCenter(trail);
    const distances = trail.map(p => 
      Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2))
    );

    const avgDist = distances.reduce((a, b) => a + b) / distances.length;
    const variance = distances.reduce((sum, d) => 
      sum + Math.pow(d - avgDist, 2), 0
    ) / distances.length;
    const stdDev = Math.sqrt(variance);

    const circularity = 1 - Math.min(stdDev / avgDist, 1);

    if (avgDist < 30) return 0;

    const coverage = this.checkAngularCoverage(trail, center);

    return circularity * coverage;
  }

  checkHorizontalLine(trail) {
    if (trail.length < 15) return 0; // Moins de points requis

    const xValues = trail.map(p => p.x);
    const yValues = trail.map(p => p.y);

    const xRange = Math.max(...xValues) - Math.min(...xValues);
    const yRange = Math.max(...yValues) - Math.min(...yValues);

    if (xRange < 60) return 0; // Seuil réduit de 100 à 60

    const horizontality = 1 - Math.min(yRange / xRange, 1);

    // Retourner une valeur même si < 0.7 pour permettre au threshold de décider
    return Math.max(horizontality * 0.9, 0); // Légèrement boosté
  }

  checkVerticalLine(trail) {
    if (trail.length < 20) return 0;

    const xValues = trail.map(p => p.x);
    const yValues = trail.map(p => p.y);

    const xRange = Math.max(...xValues) - Math.min(...xValues);
    const yRange = Math.max(...yValues) - Math.min(...yValues);

    if (yRange < 100) return 0;

    const verticality = 1 - Math.min(xRange / yRange, 1);

    return verticality > 0.7 ? verticality : 0;
  }

  checkZigzag(trail) {
    if (trail.length < 25) return 0;

    let directionChanges = 0;
    let lastDirection = 0;

    for (let i = 1; i < trail.length; i++) {
      const dx = trail[i].x - trail[i - 1].x;
      
      if (Math.abs(dx) > 3) {
        const currentDirection = dx > 0 ? 1 : -1;
        
        if (lastDirection !== 0 && currentDirection !== lastDirection) {
          directionChanges++;
        }
        
        lastDirection = currentDirection;
      }
    }

    return directionChanges >= 3 ? Math.min(directionChanges / 6, 1) : 0;
  }

  getCenter(trail) {
    const sumX = trail.reduce((sum, p) => sum + p.x, 0);
    const sumY = trail.reduce((sum, p) => sum + p.y, 0);
    return { x: sumX / trail.length, y: sumY / trail.length };
  }

  checkAngularCoverage(trail, center) {
    const angles = trail.map(p => 
      Math.atan2(p.y - center.y, p.x - center.x)
    );

    const normalizedAngles = angles.map(a => a < 0 ? a + 2 * Math.PI : a);
    const quadrants = new Set(normalizedAngles.map(a => Math.floor(a / (Math.PI / 2))));
    
    return quadrants.size / 4;
  }
}

export class GestureDebugger {
  constructor(options = {}) {
    this.config = {
      showSkeleton: options.showSkeleton !== undefined ? options.showSkeleton : true,
      showPalmCenter: options.showPalmCenter !== undefined ? options.showPalmCenter : true,
      showTrail: options.showTrail !== undefined ? options.showTrail : true,
      showKeypoints: options.showKeypoints !== undefined ? options.showKeypoints : false,
      showLabels: options.showLabels !== undefined ? options.showLabels : false,
      showPanel: options.showPanel !== undefined ? options.showPanel : true
    };

    this.colors = {
      leftHand: [78, 205, 196],
      rightHand: [255, 107, 107],
      palmCenter: [255, 255, 0],
      trail: [255, 255, 255]
    };

    this.connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],
      [0, 5], [5, 6], [6, 7], [7, 8],
      [0, 9], [9, 10], [10, 11], [11, 12],
      [0, 13], [13, 14], [14, 15], [15, 16],
      [0, 17], [17, 18], [18, 19], [19, 20]
    ];

    this.loadConfig();
  }

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
  }

  drawPalmCenter(palmCenter, handedness, p5) {
    if (!this.config.showPalmCenter || !palmCenter) return;

    p5.fill(...this.colors.palmCenter);
    p5.stroke(255);
    p5.strokeWeight(3);
    p5.circle(palmCenter.x, palmCenter.y, 20);
    p5.noStroke();
  }

  drawTrail(trail, handedness, p5) {
    if (!this.config.showTrail || trail.length < 2) return;

    p5.noFill();
    p5.strokeWeight(4);

    for (let i = 1; i < trail.length; i++) {
      const prev = trail[i - 1];
      const curr = trail[i];

      const alpha = p5.map(i, 0, trail.length - 1, 50, 255);

      p5.stroke(...this.colors.trail, alpha);
      p5.line(prev.x, prev.y, curr.x, curr.y);
    }
  }

  drawHand(hand, palmCenter, trail, p5) {
    if (!hand) return;

    this.drawTrail(trail, hand.handedness, p5);
    this.drawSkeleton(hand, p5);
    this.drawKeypoints(hand, p5);
    this.drawPalmCenter(palmCenter, hand.handedness, p5);
  }

  drawPanel(gestureInfo, p5) {
    if (!this.config.showPanel) return;

    p5.fill(15, 52, 96, 240);
    p5.noStroke();
    p5.rect(10, 10, 300, 140, 10);

    p5.fill(255);
    p5.textSize(16);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text('🔍 Debug Gestes', 20, 20);

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

    p5.textSize(10);
    p5.fill(200);
    p5.text('[S] Squelette [P] Paume [T] Trainée', 20, 100);
    p5.text('[K] Points [L] Labels [H] Panneau', 20, 120);
  }

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
      case 'H':
        this.config.showPanel = !this.config.showPanel;
        break;
    }

    this.saveConfig();
  }

  saveConfig() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('gestureDebugConfig', JSON.stringify(this.config));
    }
  }

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
}
