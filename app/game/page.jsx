"use client";

import { useState } from "react";
import Link from "next/link";

export default function Game() {
  // État des niveaux : completed, available, locked
  const [levels, setLevels] = useState([
    { id: 1, number: 1, status: "available", completed: false },
    { id: 2, number: 2, status: "locked", completed: false },
    { id: 3, number: 3, status: "locked", completed: false },
    { id: 4, number: 4, status: "locked", completed: false },
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        {/* Titre */}
        <h1 className="text-5xl font-bold text-center mb-12 text-white drop-shadow-lg">
          🗼 La Tour des Épreuves
        </h1>

        {/* Container de la tour */}
        <div className="relative flex items-center justify-center gap-8">
          {/* Décoration gauche */}
          <div className="hidden md:flex flex-col gap-12 items-end">
            {[...Array(4)].map((_, i) => (
              <div key={`left-${i}`} className="text-6xl opacity-30 hover:opacity-60 transition-opacity">
                👟
              </div>
            ))}
          </div>

          {/* La tour avec les étages */}
          <div className="relative">
            {/* Structure de la tour */}
            <div className="flex flex-col-reverse gap-0">
              {levels.map((level, index) => (
                <TowerLevel
                  key={level.id}
                  level={level}
                  isTop={index === levels.length - 1}
                  isBottom={index === 0}
                />
              ))}
            </div>

            {/* Piliers de la tour */}
            <div className="absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-b from-amber-700 to-amber-900 -z-10 rounded-t-lg"></div>
            <div className="absolute top-0 bottom-0 right-0 w-4 bg-gradient-to-b from-amber-700 to-amber-900 -z-10 rounded-t-lg"></div>
          </div>

          {/* Décoration droite */}
          <div className="hidden md:flex flex-col gap-12 items-start">
            {[...Array(4)].map((_, i) => (
              <div key={`right-${i}`} className="text-6xl opacity-30 hover:opacity-60 transition-opacity">
                👟
              </div>
            ))}
          </div>
        </div>

        {/* Boutons utilitaires */}
        <div className="flex justify-center gap-4 mt-12">
          <Link
            href="/test-gesture"
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            🎯 Entraînement
          </Link>
          <button className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-colors shadow-lg">
            ⚙️ Options
          </button>
        </div>
      </div>
    </div>
  );
}

// Composant pour un étage de la tour
function TowerLevel({ level, isTop, isBottom }) {
  const { number, status, completed } = level;

  // Styles selon le statut
  const getStyles = () => {
    if (status === "locked") {
      return {
        bg: "bg-gray-700 opacity-50",
        border: "border-gray-600",
        text: "text-gray-500",
      };
    }
    if (status === "available") {
      return {
        bg: "bg-gradient-to-r from-purple-700 to-indigo-700",
        border: "border-purple-500",
        text: "text-white",
      };
    }
    return {
      bg: "bg-gradient-to-r from-green-700 to-emerald-700",
      border: "border-green-500",
      text: "text-white",
    };
  };

  const styles = getStyles();
  const isLocked = status === "locked";
  const isAvailable = status === "available";

  return (
    <div
      className={`
        relative w-80 h-32 border-4 ${styles.border} ${styles.bg}
        ${isTop ? "rounded-t-2xl" : ""} 
        ${isBottom ? "rounded-b-lg" : ""}
        flex items-center justify-between px-6 py-4
        transition-all duration-300
        ${!isLocked ? "" : ""}
      `}
    >
      {/* Numéro de l'étage */}
      <div className={`text-6xl font-bold ${styles.text}`}>
        {number}
      </div>

      {/* Contenu de l'étage */}
      <div className="flex flex-col items-end gap-2">
        {/* Badge de complétion */}
        {completed && (
          <div className="flex items-center gap-1 bg-green-500 px-3 py-1 rounded-full text-white text-sm font-semibold">
            ✓ Complété
          </div>
        )}

        {/* Bouton Jouer ou Verrouillé */}
        {isLocked ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            🔒 Verrouillé
          </div>
        ) : (
          <Link
            href={`/game/level/${number}`}
            className={`
              px-5 py-2 rounded-lg font-bold text-white
              ${isAvailable 
                ? "bg-amber-500 hover:bg-amber-600" 
                : "bg-emerald-500 hover:bg-emerald-600"
              }
              transition-colors shadow-lg
            `}
          >
            ▶️ Jouer
          </Link>
        )}
      </div>

      {/* Effet "No Hit" si complété sans dégâts */}
      {completed && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold shadow-lg">
          ⭐ No Hit
        </div>
      )}
    </div>
  );
}
