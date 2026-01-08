import { GAME_CONFIG } from '../utils/config';

/**
 * Classe Player - Représente le joueur
 * Le joueur est fixe à l'écran, c'est le décor qui défile
 */
export class Player {
  constructor(p5Instance) {
    this.p5 = p5Instance;

    // Position fixe à l'écran
    this.x = GAME_CONFIG.PLAYER.X_POSITION;
    this.y = GAME_CONFIG.PLAYER.Y_POSITION;
    this.width = 60;
    this.height = 100;

    // Vie
    this.health = GAME_CONFIG.PLAYER.MAX_HEALTH;
    this.maxHealth = GAME_CONFIG.PLAYER.MAX_HEALTH;

    // Invincibilité temporaire après avoir été touché
    this.isInvincible = false;
    this.invincibilityEndTime = 0;

    // Statistiques pour le système "No Hit"
    this.hasBeenHit = false;

    // Ultimate
    this.ultimateCharge = 0;
    this.ultimateMaxCharge = GAME_CONFIG.SPELL.ULTIMATE_CHARGE_MAX;
  }

  /**
   * Met à jour le joueur
   */
  update() {
    // Vérifier si l'invincibilité est terminée
    if (this.isInvincible && this.p5.millis() > this.invincibilityEndTime) {
      this.isInvincible = false;
    }
  }

  /**
   * Dessine le joueur (forme simple pour le développement)
   */
  draw() {
    this.p5.push();

    // Si invincible, clignoter
    if (this.isInvincible && Math.floor(this.p5.millis() / 100) % 2 === 0) {
      this.p5.pop();
      return;
    }

    // Corps
    this.p5.fill(100, 200, 255);
    this.p5.stroke(50, 150, 200);
    this.p5.strokeWeight(3);
    this.p5.rect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, 10);

    // Tête
    this.p5.fill(255, 220, 180);
    this.p5.circle(this.x, this.y - this.height / 2 - 20, 40);

    // Yeux
    this.p5.fill(0);
    this.p5.circle(this.x - 8, this.y - this.height / 2 - 25, 5);
    this.p5.circle(this.x + 8, this.y - this.height / 2 - 25, 5);

    this.p5.pop();
  }

  /**
   * Prend des dégâts
   * @param {number} damage - Montant des dégâts
   * @returns {boolean} - True si le joueur a été touché
   */
  takeDamage(damage) {
    if (this.isInvincible) return false;

    this.health -= damage;
    this.hasBeenHit = true;

    // Activer l'invincibilité temporaire
    this.isInvincible = true;
    this.invincibilityEndTime = this.p5.millis() + GAME_CONFIG.PLAYER.INVINCIBILITY_TIME;

    // Limiter la vie à 0
    if (this.health < 0) this.health = 0;

    return true;
  }

  /**
   * Soigne le joueur
   * @param {number} amount - Montant de soin
   */
  heal(amount) {
    this.health += amount;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  /**
   * Augmente la vie maximale (récompense No Hit)
   * @param {number} amount - Montant à ajouter
   */
  increaseMaxHealth(amount) {
    this.maxHealth += amount;
    this.health += amount;
  }

  /**
   * Charge l'ultimate
   * @param {number} amount - Montant à charger
   */
  chargeUltimate(amount) {
    this.ultimateCharge += amount;
    if (this.ultimateCharge > this.ultimateMaxCharge) {
      this.ultimateCharge = this.ultimateMaxCharge;
    }
  }

  /**
   * Utilise l'ultimate
   * @returns {boolean} - True si l'ultimate a été lancé
   */
  useUltimate() {
    if (this.ultimateCharge >= this.ultimateMaxCharge) {
      this.ultimateCharge = 0;
      return true;
    }
    return false;
  }

  /**
   * Vérifie si le joueur est mort
   * @returns {boolean}
   */
  isDead() {
    return this.health <= 0;
  }

  /**
   * Réinitialise le joueur
   */
  reset() {
    this.health = this.maxHealth;
    this.isInvincible = false;
    this.hasBeenHit = false;
    this.ultimateCharge = 0;
  }

  /**
   * Obtient le rectangle de collision du joueur
   * @returns {Object} - {x, y, width, height}
   */
  getCollisionRect() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }
}
