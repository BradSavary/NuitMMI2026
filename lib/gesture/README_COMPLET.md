# Système de Reconnaissance de Gestes

## 📦 Installation

```bash
npm install ml5 p5 patch-package
```

## 🎯 Vue d'ensemble

Ce module fournit un système complet de reconnaissance de gestes avec les mains en temps réel, utilisant **ml5.js HandPose** (MediaPipe).

### Composants principaux :

1. **HandPoseManager** : Gère la caméra et la détection des mains
2. **GestureRecognizer** : Reconnaît 8 types de gestes tracés
3. **GestureDebugger** : Affiche les informations de debug

## 📖 Utilisation

### Exemple basique

```javascript
import { HandPoseManager, GestureRecognizer, GestureDebugger } from '@/lib/gesture';

// Dans votre sketch p5.js
let handPoseManager;
let gestureRecognizer;
let gestureDebugger;

async function setup() {
  createCanvas(640, 480);
  
  // Initialiser HandPose
  handPoseManager = new HandPoseManager();
  await handPoseManager.initModel();
  await handPoseManager.initCamera();
  handPoseManager.startDetection();
  
  // Initialiser le reconnaisseur
  gestureRecognizer = new GestureRecognizer();
  
  // Initialiser le debugger
  gestureDebugger = new GestureDebugger();
}

function draw() {
  background(0);
  
  // Obtenir les mains
  const { leftHand, rightHand } = handPoseManager.getHands();
  
  if (rightHand) {
    const palmCenter = handPoseManager.getPalmCenter(rightHand);
    gestureRecognizer.updateTrail('right', palmCenter);
    
    const trail = gestureRecognizer.getTrail('right');
    gestureDebugger.drawHand(rightHand, palmCenter, trail, window);
    
    // Reconnaître le geste
    const gesture = gestureRecognizer.recognizeGesture('right');
    if (gesture) {
      console.log(`Geste détecté: ${gesture.gesture} (${gesture.confidence})`);
    }
  }
}
```

## 🔮 Gestes reconnus

| Geste | Description | Seuil par défaut |
|-------|-------------|------------------|
| `circle` | Cercle tracé dans l'air | 0.7 |
| `horizontalLine` | Ligne horizontale | 0.75 |
| `verticalLine` | Ligne verticale | 0.75 |
| `zigzag` | Mouvement en zigzag | 0.6 |
| `spiral` | Spirale vers l'extérieur | 0.65 |
| `wave` | Mouvement de vague | 0.6 |
| `triangle` | Triangle | 0.65 |
| `square` | Carré | 0.7 |

## ⚙️ Configuration

### HandPoseManager

```javascript
const manager = new HandPoseManager();

await manager.initModel({
  flipped: true,        // Miroir de la caméra
  maxHands: 2,          // Nombre max de mains
  runtime: 'mediapipe', // 'mediapipe' ou 'tfjs'
  modelType: 'full'     // 'full' ou 'lite'
});
```

### GestureRecognizer

```javascript
const recognizer = new GestureRecognizer({
  maxTrailLength: 80,      // Nombre de points gardés en mémoire
  fadeOutTime: 120,        // Temps avant effacement (frames)
  cooldownFrames: 30,      // Délai entre détections
  thresholds: {
    circle: 0.7,
    horizontalLine: 0.75,
    // ... autres seuils
  }
});
```

### GestureDebugger

```javascript
const debugger = new GestureDebugger({
  showSkeleton: true,      // Squelette de la main
  showPalmCenter: true,    // Point jaune sur la paume
  showTrail: true,         // Trainée blanche
  showKeypoints: false,    // 21 points clés
  showLabels: false,       // Numéros des points
  showPanel: true          // Panneau d'info
});
```

## 🎨 Affichage

### Ce qui est affiché :

1. **Squelette de la main** (rouge/cyan selon la main)
   - 21 points détectés par HandPose
   - Lignes reliant les articulations

2. **Point jaune sur la paume**
   - Centre calculé depuis 5 points clés
   - Point suivi pour tracer les formes

3. **Trainée blanche**
   - 80 dernières positions (~1.3s à 60 FPS)
   - Gradient de transparence
   - Comparée aux formes attendues

## ⌨️ Raccourcis clavier (Debug)

| Touche | Action |
|--------|--------|
| `S` | Toggle Squelette |
| `P` | Toggle Centre Paume |
| `T` | Toggle Trainée |
| `K` | Toggle Points Clés |
| `L` | Toggle Labels |
| `H` | Toggle Panneau |

## 🧪 Page de test

Visitez `/test-gesture` pour tester le système complet avec interface visuelle.

## 🏗️ Architecture

```
lib/gesture/
├── HandPoseManager.js     → Caméra + Détection mains
├── GestureRecognizer.js   → Reconnaissance de formes
├── GestureDebugger.js     → Affichage debug
├── index.js               → Exports
└── README.md              → Documentation
```

## 🎯 Choix de conception

### HandPoseManager
- **MediaPipe** plutôt que tfjs (meilleur pour HandPose)
- **Centre de paume** calculé depuis 5 points (plus stable que wrist seul)
- **Async/await** pour ne pas bloquer le rendu

### GestureRecognizer
- **Algorithmes mathématiques** purs (pas de ML supplémentaire)
- **Seuils configurables** par geste
- **Cooldown** pour éviter détections multiples
- **Fade out** automatique après 2s

### GestureDebugger
- **Toggles individuels** pour chaque élément
- **Persistance** de la config dans localStorage
- **Raccourcis clavier** pour contrôle rapide

## 🚀 Prochaines étapes

1. Intégration dans le jeu (`app/game/page.jsx`)
2. Écran d'entraînement (`app/game/components/TrainingScreen.jsx`)
3. Association gestes → sorts
4. Système de validation avec Espace

## 📝 Notes

- Les gestes sont plus faciles à reconnaître si faits de manière fluide
- Une distance raisonnable de la caméra améliore la détection
- L'éclairage influence la qualité de détection
- Les seuils peuvent être ajustés selon les besoins

## 🐛 Debugging

Si la caméra ne s'active pas :
1. Vérifier les permissions navigateur
2. Utiliser HTTPS (requis pour getUserMedia)
3. Vérifier la console pour les erreurs

Si les gestes ne sont pas reconnus :
1. Activer le mode debug (touches S, P, T)
2. Vérifier que la trainée est visible
3. Ajuster les seuils de confiance
4. S'assurer que les gestes sont assez grands
