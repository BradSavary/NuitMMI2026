// Configuration centralisée du jeu
export const GAME_CONFIG = {
  // Canvas
  CANVAS_WIDTH: 1920,
  CANVAS_HEIGHT: 1080,

  // Player
  PLAYER: {
    MAX_HEALTH: 10,
    SPEED_NORMAL: 3,
    SPEED_COMBAT: 0.5,
    INVINCIBILITY_TIME: 1000, // ms après avoir été touché
    X_POSITION: 300, // Position fixe du joueur à l'écran
    Y_POSITION: 540, // Centre vertical
  },

  // Ennemis
  ENEMY: {
    NORMAL_DAMAGE: 1,
    BOSS_DAMAGE: 2,
    SPAWN_DISTANCE: 200, // Distance minimale entre les ennemis
    BASE_HEALTH: 3,
    BOSS_HEALTH: 20,
  },

  // Sorts
  SPELL: {
    COOLDOWN: 500, // ms entre chaque sort
    ULTIMATE_CHARGE_MAX: 100,
    ULTIMATE_GAIN_PER_HIT: 5,
    SPEED: 10,
    DAMAGE_BASE: 2,
  },

  // Éléments
  ELEMENTS: {
    FIRE: 'fire',
    ICE: 'ice',
    EARTH: 'earth',
    ELECTRIC: 'electric',
    NEUTRAL: 'neutral',
  },

  // Couleurs des éléments (pour le développement)
  ELEMENT_COLORS: {
    fire: '#FF4444',
    ice: '#4444FF',
    earth: '#44FF44',
    electric: '#FFFF44',
    neutral: '#CCCCCC',
  },

  // Système de faiblesse élémentaire
  // Multiplicateur de dégâts : > 1 = efficace, < 1 = peu efficace
  ELEMENT_EFFECTIVENESS: {
    fire: { ice: 1.5, earth: 0.5, fire: 1, electric: 1, neutral: 1 },
    ice: { fire: 0.5, electric: 1.5, ice: 1, earth: 1, neutral: 1 },
    earth: { electric: 1.5, fire: 0.5, earth: 1, ice: 1, neutral: 1 },
    electric: { earth: 0.5, ice: 1.5, electric: 1, fire: 1, neutral: 1 },
    neutral: { fire: 1, ice: 1, earth: 1, electric: 1, neutral: 1 },
  },

  // Reconnaissance de gestes
  GESTURE: {
    CONFIDENCE_THRESHOLD: 0.8, // Seuil de confiance pour valider un geste (80%)
    TRAIL_LENGTH: 80, // Nombre de positions mémorisées
    MIN_DISTANCE: 10, // Distance minimale entre deux points
    DEBUG_MODE: false, // Afficher les points de la main
  },

  // UI
  UI: {
    HEALTH_BAR_X: 50,
    HEALTH_BAR_Y: 50,
    ULTIMATE_BAR_X: 1820,
    ULTIMATE_BAR_Y: 50,
    SPELL_INDICATOR_X: 960,
    SPELL_INDICATOR_Y: 950,
  },

  // Effets visuels
  EFFECTS: {
    DAMAGE_FLASH_DURATION: 200, // ms
    DAMAGE_FLASH_COLOR: 'rgba(255, 0, 0, 0.3)',
  },

  // Niveau
  LEVEL: {
    LENGTH: 5000, // Longueur totale du niveau en pixels
    SCROLL_SPEED_NORMAL: 3,
    SCROLL_SPEED_COMBAT: 0.5,
  },
};
