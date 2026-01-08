'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import Link from 'next/link.js';

export default function TestGesturePage() {
  const containerRef = useRef(null);
  const [status, setStatus] = useState('Chargement des bibliothèques...');
  const [gestureInfo, setGestureInfo] = useState(null);
  const [score, setScore] = useState(0);
  const [scriptsLoaded, setScriptsLoaded] = useState({ p5: false, ml5: false });
  
  useEffect(() => {
    // Attendre que les deux scripts soient chargés
    if (!scriptsLoaded.p5 || !scriptsLoaded.ml5) {
      return;
    }

    let handPoseManager;
    let gestureRecognizer;
    let gestureDebugger;
    let p5Instance;

    const initSketch = async () => {
      try {
        setStatus('Initialisation...');
        
        // Charger le système de gestes depuis le chemin absolu
        const { HandPoseManager, GestureRecognizer, GestureDebugger } = 
          await import('../../lib/gesture/index.js');

        // Créer le sketch p5
        const sketch = (p) => {
          let videoElement;
          
          p.setup = async () => {
            p.createCanvas(640, 480);
            
            setStatus('Chargement du modèle HandPose...');
            
            // Initialiser HandPoseManager
            handPoseManager = new HandPoseManager();
            
            const modelLoaded = await handPoseManager.initModel({
              flipped: true,
              maxHands: 2,
              runtime: 'mediapipe'
            });

            if (!modelLoaded) {
              setStatus('❌ Erreur lors du chargement du modèle');
              return;
            }

            setStatus('Initialisation de la caméra...');

            const cameraReady = await handPoseManager.initCamera();
            
            if (!cameraReady) {
              setStatus('❌ Erreur d\'accès à la caméra');
              return;
            }

            videoElement = handPoseManager.video;
            
            setStatus('Attente du modèle...');
            
            // Attendre 2 secondes pour que le modèle soit complètement prêt
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Initialiser GestureRecognizer
            gestureRecognizer = new GestureRecognizer({
              maxTrailLength: 80,
              fadeOutTime: 120,
              cooldownFrames: 30,
              thresholds: {
                circle: 0.65,
                zigzag: 0.6,
                spiral: 0.65,
                triangle: 0.6,
                square: 0.65,
                fistRaised: 0.75  // Nouveau geste : poing levé
              }
            });

            // Initialiser GestureDebugger
            gestureDebugger = new GestureDebugger({
              showSkeleton: true,
              showPalmCenter: true,
              showTrail: true,
              showKeypoints: false,
              showLabels: false,
              showPanel: true
            });

            // Démarrer la détection
            handPoseManager.startDetection();
            
            setStatus('✅ Prêt ! Montrez vos mains 👋');
          };

          p.draw = () => {
            p.background('#1a1a2e');

            // Afficher la vidéo (miroir)
            if (videoElement && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
              p.push();
              p.translate(p.width, 0);
              p.scale(-1, 1);
              p.tint(255, 150);
              // Utiliser drawingContext pour dessiner l'élément vidéo HTML natif
              p.drawingContext.drawImage(videoElement, 0, 0, p.width, p.height);
              p.pop();
            }

            if (!handPoseManager || !gestureRecognizer || !gestureDebugger) return;

            const { leftHand, rightHand } = handPoseManager.getHands();

            // Mettre à jour les trajectoires
            if (leftHand) {
              const leftPalm = handPoseManager.getPalmCenter(leftHand);
              gestureRecognizer.updateTrail('left', leftPalm);
              
              // Dessiner la main gauche
              const leftTrail = gestureRecognizer.getTrail('left');
              gestureDebugger.drawHand(leftHand, leftPalm, leftTrail, p);
              
              // Reconnaître le geste
              const gesture = gestureRecognizer.recognizeGesture('left');
              if (gesture) {
                setGestureInfo({ ...gesture, hand: 'left' });
                setScore(prev => prev + Math.floor(gesture.confidence * 100));
              }
            } else {
              gestureRecognizer.fadeOutTrail('left');
            }

            if (rightHand) {
              const rightPalm = handPoseManager.getPalmCenter(rightHand);
              gestureRecognizer.updateTrail('right', rightPalm);
              
              // Dessiner la main droite
              const rightTrail = gestureRecognizer.getTrail('right');
              gestureDebugger.drawHand(rightHand, rightPalm, rightTrail, p);
              
              // Reconnaître le geste (passer les données complètes de la main)
              const gesture = gestureRecognizer.recognizeGesture('right', rightHand);
              if (gesture) {
                setGestureInfo({ ...gesture, hand: 'right' });
                setScore(prev => prev + Math.floor(gesture.confidence * 100));
              }
            } else {
              gestureRecognizer.fadeOutTrail('right');
            }

            // Dessiner le panneau de debug
            gestureDebugger.drawPanel(gestureInfo, p);
          };

          p.keyPressed = () => {
            if (gestureDebugger) {
              gestureDebugger.handleKeyPress(p.key);
            }
          };
        };

        // Créer l'instance p5
        p5Instance = new window.p5(sketch, containerRef.current);
        
      } catch (error) {
        console.error('Erreur d\'initialisation:', error);
        setStatus('❌ Erreur : ' + error.message);
      }
    };

    initSketch();

    // Cleanup
    return () => {
      if (handPoseManager) {
        handPoseManager.cleanup();
      }
      if (p5Instance) {
        p5Instance.remove();
      }
    };
  }, [scriptsLoaded]);

  return (
    <>
    <Link href={"/game"} className=" rounded-md bg-gray-800 px-3 py-1 text-white hover:bg-gray-700 transition">
     Retour
    </Link>
      {/* Charger p5.js */}
      <Script
        src="https://cdn.jsdelivr.net/npm/p5@1.11.4/lib/p5.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ p5.js chargé');
          setScriptsLoaded(prev => ({ ...prev, p5: true }));
        }}
        onError={() => setStatus('❌ Erreur chargement p5.js')}
      />
      
      {/* Charger ml5.js */}
      <Script
        src="https://unpkg.com/ml5@1/dist/ml5.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ ml5.js chargé');
          setScriptsLoaded(prev => ({ ...prev, ml5: true }));
        }}
        onError={() => setStatus('❌ Erreur chargement ml5.js')}
      />

      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">✋ Test de Reconnaissance de Gestes</h1>
            <p className="text-gray-400">
              Module /lib/gesture - Détection avec HandPose (ml5.js)
            </p>
          </div>

          {/* Status */}
          <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4 mb-6">
            <p className="font-mono">{status}</p>
          </div>

          {/* Score et Info Geste */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-900/50 border border-green-700 rounded-lg p-4">
              <h3 className="text-lg font-bold mb-2">Score</h3>
              <p className="text-3xl font-mono">{score}</p>
            </div>
            
            {gestureInfo && (
              <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-4">
                <h3 className="text-lg font-bold mb-2">Dernier Geste</h3>
                <p className="text-xl">{gestureInfo.gesture}</p>
                <p className="text-sm text-gray-400">
                  Main {gestureInfo.hand === 'left' ? 'Gauche' : 'Droite'} - 
                  {Math.floor(gestureInfo.confidence * 100)}%
                </p>
              </div>
            )}
          </div>

          {/* Canvas Container */}
          <div className="border-4 border-teal-500 rounded-lg overflow-hidden">
            <div ref={containerRef}></div>
          </div>

        
        </div>
      </div>
    </>
  );
}
