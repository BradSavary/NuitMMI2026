"use client";

/**
 * HealthBar - Barre de vie du joueur
 * Affiche les points de vie restants en haut à gauche de l'écran
 */
export default function HealthBar({ currentHealth, maxHealth = 10 }) {
  const healthPercentage = Math.max(0, (currentHealth / maxHealth) * 100);
  
  // Couleur de la barre selon le niveau de vie
  const getHealthColor = () => {
    if (healthPercentage > 60) return 'bg-green-500';
    if (healthPercentage > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="absolute top-4 left-4 z-30">
      <div className="bg-gray-900 backdrop-blur-sm p-3 pixel-border-sm">
        {/* Label */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-white pixel-font text-xs tracking-wider">HEALTH</span>
          <span className="text-white pixel-font text-xs">
            {Math.max(0, currentHealth)} / {maxHealth}
          </span>
        </div>
        
        {/* Barre de vie avec style pixel */}
        <div className="w-48 h-4 bg-gray-800 overflow-hidden pixel-border-sm relative">
          <div
            className={`h-full transition-all duration-300 ease-out ${getHealthColor()} relative`}
            style={{ width: `${healthPercentage}%` }}
          >
            {/* Effet de brillance pixelisé */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/40"></div>
          </div>
        </div>

        {/* Indicateur de danger */}
        {healthPercentage <= 30 && healthPercentage > 0 && (
          <div className="mt-2 text-red-400 text-xs pixel-font animate-pulse text-center tracking-wide">
            CRITICAL
          </div>
        )}
      </div>
    </div>
  );
}
