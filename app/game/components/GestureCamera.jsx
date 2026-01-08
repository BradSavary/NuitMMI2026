"use client";

import { useEffect, useRef, useState } from "react";
import { GestureRecognizer } from "../../../lib/gesture/GestureRecognizer.js";

/**
 * GestureCamera - Affiche la caméra et la détection des mains
 * - Affiche le flux vidéo en petit au-dessus du jeu
 * - Dessine le squelette des mains (lignes rouges/cyan)
 * - Dessine la trajectoire de la paume (points jaunes)
 * - Détecte les gestes (cercle pour l'instant)
 */
export default function GestureCamera({ onGestureDetected, isActive = true }) {
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null); // Canvas pour les squelettes uniquement
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [videoSize, setVideoSize] = useState({ width: 640, height: 480 });
  const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 }); // État pour éviter hydration error
  
  // État pour la détection
  const handPoseRef = useRef(null);
  const gestureRecognizerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const currentHandsRef = useRef([]); // Stocker les dernières détections

  // Initialisation
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // 1. Charger ml5.js dynamiquement si pas déjà chargé
        if (!window.ml5) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/ml5@1/dist/ml5.min.js';
          script.async = true;
          document.body.appendChild(script);
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
        }

        // 2. Initialiser la caméra
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false
        });

        if (!mounted) return;

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await new Promise((resolve) => {
            video.onloadedmetadata = () => {
              video.play(); // Démarrer explicitement la lecture
              setVideoSize({ 
                width: video.videoWidth, 
                height: video.videoHeight 
              });
              console.log('✅ Vidéo prête, dimensions:', video.videoWidth, 'x', video.videoHeight);
              resolve();
            };
          });
        }

        // 3. Initialiser HandPose
        const handPose = await window.ml5.handPose({
          flipped: true,
          maxHands: 2,
          runtime: 'mediapipe'
        });

        if (!mounted) return;

        handPoseRef.current = handPose;

        // 4. Démarrer la détection
        handPose.detectStart(video, handleHandsDetected);

        // 5. Initialiser le GestureRecognizer
        gestureRecognizerRef.current = new GestureRecognizer({
          maxTrailLength: 40, // Réduit de 80 à 40 (0.67s au lieu de 1.3s)
          circleThreshold: 0.85 // Seuil pour le cercle
        });

        setIsReady(true);
        startDrawLoop();
      } catch (err) {
        console.error('Erreur initialisation caméra:', err);
        setError(err.message);
      }
    };

    init();

    // Gérer le redimensionnement de la fenêtre et initialiser les dimensions
    const handleResize = () => {
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Initialiser les dimensions côté client uniquement
    if (typeof window !== 'undefined') {
      handleResize();
    }

    window.addEventListener('resize', handleResize);

    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Callback quand des mains sont détectées
  const handleHandsDetected = (results) => {
    // Stocker les résultats pour le dessin
    currentHandsRef.current = results || [];
    
    if (!gestureRecognizerRef.current) return;

    const recognizer = gestureRecognizerRef.current;

    // Mettre à jour les trajectoires
    if (results && results.length > 0) {
      results.forEach(hand => {
        const handedness = hand.handedness.toLowerCase();
        const palmCenter = calculatePalmCenter(hand.keypoints);
        
        if (palmCenter) {
          recognizer.updateTrail(handedness, palmCenter);

          // Tenter de reconnaître un geste (main droite uniquement pour l'instant)
          if (handedness === 'right') {
            const gesture = recognizer.recognizeGesture('right', hand);
            if (gesture && onGestureDetected) {
              onGestureDetected(gesture.gesture, gesture.confidence);
            }
          }
        }
      });
    }
  };

  // Calcul du centre de la paume
  const calculatePalmCenter = (keypoints) => {
    if (!keypoints || keypoints.length < 21) return null;

    // Moyenne des points 0, 5, 9, 13, 17 (poignet + base des doigts)
    const indices = [0, 5, 9, 13, 17];
    let sumX = 0, sumY = 0;

    indices.forEach(i => {
      sumX += keypoints[i].x;
      sumY += keypoints[i].y;
    });

    return {
      x: sumX / indices.length,
      y: sumY / indices.length
    };
  };

  // Boucle de dessin
  const startDrawLoop = () => {
    const draw = () => {
      const canvas = overlayCanvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video || !isActive) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      // Vérifier que la vidéo est prête
      if (video.readyState < video.HAVE_CURRENT_DATA) {
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculer le ratio pour mapper les coordonnées de la vidéo vers l'écran
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const scaleX = screenWidth / videoSize.width;
      const scaleY = screenHeight / videoSize.height;

      // Réduire la taille globale des squelettes (scale 0.6 = 60% de la taille originale)
      const skeletonScale = 0.6;
      const finalScaleX = scaleX * skeletonScale;
      const finalScaleY = scaleY * skeletonScale;

      // Dessiner les mains à partir des résultats stockés avec le bon scaling
      const hands = currentHandsRef.current;
      if (hands && hands.length > 0) {
        hands.forEach(hand => {
          drawHandSkeleton(ctx, hand, finalScaleX, finalScaleY);
          drawPalmCenter(ctx, hand, finalScaleX, finalScaleY);
        });
      }

      // Dessiner les trajectoires
      if (gestureRecognizerRef.current) {
        drawTrail(ctx, gestureRecognizerRef.current.getTrail('left'), 'cyan', finalScaleX, finalScaleY);
        drawTrail(ctx, gestureRecognizerRef.current.getTrail('right'), 'red', finalScaleX, finalScaleY);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  // Dessiner le squelette de la main (avec scaling)
  const drawHandSkeleton = (ctx, hand, scaleX, scaleY) => {
    const keypoints = hand.keypoints;
    // Couleurs désaturées
    const color = hand.handedness === 'Left' ? 'rgba(0, 200, 255)' : 'rgba(255, 100, 100)';

    // Connexions entre les points (structure de la main)
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Pouce
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Majeur
      [0, 13], [13, 14], [14, 15], [15, 16], // Annulaire
      [0, 17], [17, 18], [18, 19], [19, 20], // Auriculaire
      [5, 9], [9, 13], [13, 17] // Paume
    ];

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    connections.forEach(([start, end]) => {
      const x1 = keypoints[start].x * scaleX;
      const y1 = keypoints[start].y * scaleY;
      const x2 = keypoints[end].x * scaleX;
      const y2 = keypoints[end].y * scaleY;
      
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Dessiner les points (plus petits)
    ctx.fillStyle = color;
    keypoints.forEach(point => {
      const x = point.x * scaleX;
      const y = point.y * scaleY;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2); // Réduit de 4 à 2.5
      ctx.fill();
    });
  };

  // Dessiner le centre de la paume (avec scaling)
  const drawPalmCenter = (ctx, hand, scaleX, scaleY) => {
    const palmCenter = calculatePalmCenter(hand.keypoints);
    if (!palmCenter) return;

    const x = palmCenter.x * scaleX;
    const y = palmCenter.y * scaleY;

    ctx.fillStyle = 'rgba(255, 255, 0, 0.5)'; // Jaune désaturé
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2); // Réduit de 10 à 8
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 165, 0, 0.6)'; // Orange désaturé
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Dessiner la trajectoire (avec scaling)
  const drawTrail = (ctx, trail, color, scaleX, scaleY) => {
    if (!trail || trail.length < 2) return;

    // Couleur désaturée selon la main
    const trailColor = color === 'cyan' 
      ? 'rgba(0, 200, 255, 0.5)' 
      : 'rgba(255, 100, 100, 0.5)';

    ctx.strokeStyle = trailColor;
    ctx.lineWidth = 3; // Réduit de 4 à 3
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(trail[0].x * scaleX, trail[0].y * scaleY);

    for (let i = 1; i < trail.length; i++) {
      ctx.lineTo(trail[i].x * scaleX, trail[i].y * scaleY);
    }

    ctx.stroke();
  };

  if (error) {
    return (
      <div className="absolute top-4 right-4 z-40 bg-red-900/90 backdrop-blur-sm p-4 rounded-lg border-2 border-red-500">
        <p className="text-white font-semibold">❌ Erreur caméra</p>
        <p className="text-red-200 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Vidéo en plein écran derrière tout (z-0) - sous le background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="fixed inset-0 w-full h-full object-cover scale-x-[-1]"
        style={{ zIndex: 0 }}
      />

      {/* Canvas overlay pour les squelettes des mains (z-50, au-dessus du jeu) */}
      <canvas
        ref={overlayCanvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 50, width: '100%', height: '100%' }}
      />

      {/* Indicateur de statut (en haut à droite) */}
      {!isReady && (
        <div className="fixed top-4 right-[50%] bg-black/80 backdrop-blur-sm p-4 rounded-lg border-2 border-purple-500" style={{ zIndex: 60 }}>
          <div className="text-white text-center">
            <div className="animate-spin text-4xl mb-2">⭕</div>
            <p className="text-sm">Initialisation caméra...</p>
          </div>
        </div>
      )}

      {/* Badge de statut une fois prêt */}
      {isReady && (
        <div className="fixed top-4 right-[50%] left-[50%] w-max bg-purple-900/90 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-purple-500" style={{ zIndex: 60 }}>
          <p className="text-white text-xs font-semibold">
            🎯 Détection active
          </p>
        </div>
      )}
    </>
  );
}
