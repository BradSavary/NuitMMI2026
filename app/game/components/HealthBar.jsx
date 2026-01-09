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
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 border-2 border-white/20">
        {/* Label */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white font-bold text-sm">❤️ VIE</span>
          <span className="text-white font-mono text-sm">
            {Math.max(0, currentHealth)} / {maxHealth}
          </span>
        </div>
        
        {/* Barre de vie */}
        <div className="w-48 h-6 bg-gray-700 rounded-full overflow-hidden border-2 border-gray-600">
          <div
            className={`h-full transition-all duration-300 ease-out ${getHealthColor()}`}
            style={{ width: `${healthPercentage}%` }}
          >
            <div className="w-full h-full animate-pulse bg-white/20"></div>
          </div>
        </div>

        {/* Indicateur de danger */}
        {healthPercentage <= 30 && healthPercentage > 0 && (
          <div className="mt-2 text-red-400 text-xs font-bold animate-pulse text-center">
            ⚠️ VIE CRITIQUE !
          </div>
        )}
      </div>
    </div>
  );
}
