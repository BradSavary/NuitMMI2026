import { GAME_CONFIG } from '../utils/config';

/**
 * Classe Spell - Représente un sort lancé par le joueur
 */
export class Spell {
  constructor(p5Instance, x, y, element, isUltimate = false, isAOE = false) {
    this.p5 = p5Instance;

    // Position
    this.x = x;
    this.y = y;

    // Propriétés du sort
    this.element = element;
    this.isUltimate = isUltimate;
    this.isAOE = isAOE;

    // Vitesse et direction
    this.speed = GAME_CONFIG.SPELL.SPEED;
    this.direction = 1; // 1 = droite, -1 = gauche

    // Dégâts
    this.damage = isUltimate
      ? GAME_CONFIG.SPELL.DAMAGE_BASE * 5
      : GAME_CONFIG.SPELL.DAMAGE_BASE;

    // Taille
    this.radius = isAOE ? 80 : 20;

    // État
    this.active = true;
    this.hasHit = false;

    // Effet visuel
    this.particleOffset = 0;
  }

  /**
   * Met à jour le sort
   */
  update() {
    if (!this.active) return;

    // Déplacement
    this.x += this.speed * this.direction;

    // Désactiver si hors écran
    if (this.x > GAME_CONFIG.CANVAS_WIDTH + 100 || this.x < -100) {
      this.active = false;
    }

    // Animation des particules
    this.particleOffset += 0.1;
  }

  /**
   * Dessine le sort
   */
  draw() {
    if (!this.active) return;

    const color = GAME_CONFIG.ELEMENT_COLORS[this.element];

    this.p5.push();

    // Effet de glow
    this.p5.drawingContext.shadowBlur = 20;
    this.p5.drawingContext.shadowColor = color;

    if (this.isUltimate) {
      // Sort ultimate plus spectaculaire
      this.p5.fill(color);
      this.p5.noStroke();

      // Cercle principal
      this.p5.circle(this.x, this.y, this.radius);

      // Anneaux tournants
      for (let i = 0; i < 3; i++) {
        this.p5.noFill();
        this.p5.stroke(color);
        this.p5.strokeWeight(3);
        const r = this.radius + i * 15;
        this.p5.circle(
          this.x + Math.cos(this.particleOffset + i) * 10,
          this.y + Math.sin(this.particleOffset + i) * 10,
          r
        );
      }
    } else if (this.isAOE) {
      // Sort de zone
      this.p5.fill(color + '80'); // Transparence
      this.p5.noStroke();
      this.p5.circle(this.x, this.y, this.radius * 2);

      // Contour
      this.p5.noFill();
      this.p5.stroke(color);
      this.p5.strokeWeight(3);
      this.p5.circle(this.x, this.y, this.radius * 2);
    } else {
      // Sort normal (projectile)
      this.p5.fill(color);
      this.p5.noStroke();
      this.p5.circle(this.x, this.y, this.radius * 2);

      // Traînée
      for (let i = 1; i <= 3; i++) {
        this.p5.fill(color + (100 - i * 30).toString(16));
        this.p5.circle(
          this.x - this.direction * i * 10,
          this.y,
          (this.radius * 2) - i * 5
        );
      }
    }

    this.p5.pop();
  }

  /**
   * Calcule les dégâts contre un ennemi selon l'élément
   * @param {Enemy} enemy - L'ennemi touché
   * @returns {number} - Dégâts réels infligés
   */
  calculateDamage(enemy) {
    const effectiveness = GAME_CONFIG.ELEMENT_EFFECTIVENESS[this.element][enemy.element] || 1;
    return Math.floor(this.damage * effectiveness);
  }

  /**
   * Marque le sort comme ayant touché
   */
  markAsHit() {
    this.hasHit = true;
    if (!this.isAOE && !this.isUltimate) {
      // Les sorts normaux disparaissent après impact
      this.active = false;
    }
  }

  /**
   * Vérifie si le sort est actif
   * @returns {boolean}
   */
  isActive() {
    return this.active;
  }

  /**
   * Obtient le cercle de collision du sort
   * @returns {Object} - {x, y, radius}
   */
  getCollisionCircle() {
    return {
      x: this.x,
      y: this.y,
      radius: this.radius,
    };
  }
}

/**
 * Fabrique de sorts - Crée des sorts prédéfinis
 */
export class SpellFactory {
  /**
   * Crée un sort de boule de feu (cercle)
   */
  static createFireball(p5Instance, x, y) {
    return new Spell(p5Instance, x, y, GAME_CONFIG.ELEMENTS.FIRE, false, false);
  }

  /**
   * Crée un sort de glace (ligne horizontale)
   */
  static createIceBeam(p5Instance, x, y) {
    return new Spell(p5Instance, x, y, GAME_CONFIG.ELEMENTS.ICE, false, false);
  }

  /**
   * Crée un sort d'électricité (zigzag)
   */
  static createLightning(p5Instance, x, y) {
    return new Spell(p5Instance, x, y, GAME_CONFIG.ELEMENTS.ELECTRIC, false, false);
  }

  /**
   * Crée un sort de terre (spirale) - AOE
   */
  static createEarthquake(p5Instance, x, y) {
    return new Spell(p5Instance, x, y, GAME_CONFIG.ELEMENTS.EARTH, false, true);
  }

  /**
   * Crée un sort neutre (V)
   */
  static createMagicMissile(p5Instance, x, y) {
    return new Spell(p5Instance, x, y, GAME_CONFIG.ELEMENTS.NEUTRAL, false, false);
  }

  /**
   * Crée un sort ultimate
   */
  static createUltimate(p5Instance, x, y, element) {
    return new Spell(p5Instance, x, y, element, true, true);
  }
}
