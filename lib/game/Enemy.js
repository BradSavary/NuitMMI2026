import { GAME_CONFIG } from '../utils/config';

/**
 * Classe Enemy - Représente un ennemi
 */
export class Enemy {
  constructor(p5Instance, x, y, element, attackType = 'melee') {
    this.p5 = p5Instance;

    // Position (dans le monde, pas à l'écran)
    this.worldX = x;
    this.worldY = y;
    this.width = 50;
    this.height = 80;

    // Propriétés
    this.element = element;
    this.attackType = attackType; // 'melee' ou 'ranged'

    // Vie
    this.health = GAME_CONFIG.ENEMY.BASE_HEALTH;
    this.maxHealth = GAME_CONFIG.ENEMY.BASE_HEALTH;

    // Dégâts infligés au joueur
    this.damage = GAME_CONFIG.ENEMY.NORMAL_DAMAGE;

    // État
    this.active = true;
    this.isDying = false;
    this.deathAnimationStart = 0;

    // Attaque
    this.attackCooldown = 0;
    this.attackCooldownMax = 2000; // ms entre chaque attaque
  }

  /**
   * Met à jour l'ennemi
   * @param {number} scrollOffset - Décalage du scroll pour convertir worldX en screenX
   */
  update(scrollOffset) {
    // Animation de mort
    if (this.isDying) {
      const elapsed = this.p5.millis() - this.deathAnimationStart;
      if (elapsed > 500) {
        this.active = false;
      }
      return;
    }

    // Cooldown d'attaque
    if (this.attackCooldown > 0) {
      this.attackCooldown -= this.p5.deltaTime;
    }
  }

  /**
   * Dessine l'ennemi
   * @param {number} scrollOffset - Décalage du scroll
   */
  draw(scrollOffset) {
    if (!this.active) return;

    const screenX = this.worldX - scrollOffset;

    // Ne pas dessiner si hors écran
    if (screenX < -200 || screenX > GAME_CONFIG.CANVAS_WIDTH + 200) {
      return;
    }

    const color = GAME_CONFIG.ELEMENT_COLORS[this.element];

    this.p5.push();

    // Animation de mort
    if (this.isDying) {
      const elapsed = this.p5.millis() - this.deathAnimationStart;
      const alpha = 255 - (elapsed / 500) * 255;
      this.p5.tint(255, alpha);
    }

    // Corps de l'ennemi
    this.p5.fill(color);
    this.p5.stroke(0);
    this.p5.strokeWeight(3);
    this.p5.rect(
      screenX - this.width / 2,
      this.worldY - this.height / 2,
      this.width,
      this.height,
      10
    );

    // Icône de l'élément
    this.p5.noStroke();
    this.p5.textSize(30);
    this.p5.textAlign(this.p5.CENTER);
    const elementIcons = {
      fire: '🔥',
      ice: '❄️',
      earth: '🌿',
      electric: '⚡',
      neutral: '👾',
    };
    this.p5.text(
      elementIcons[this.element] || '👾',
      screenX,
      this.worldY - this.height / 2 - 20
    );

    // Barre de vie
    if (!this.isDying) {
      this.drawHealthBar(screenX);
    }

    // Indicateur de type d'attaque
    this.p5.fill(255);
    this.p5.textSize(12);
    const attackIcon = this.attackType === 'melee' ? '⚔️' : '🏹';
    this.p5.text(attackIcon, screenX, this.worldY + this.height / 2 + 20);

    this.p5.pop();
  }

  /**
   * Dessine la barre de vie de l'ennemi
   * @param {number} screenX - Position X à l'écran
   */
  drawHealthBar(screenX) {
    const barWidth = this.width;
    const barHeight = 5;
    const barY = this.worldY - this.height / 2 - 10;

    // Fond de la barre
    this.p5.fill(60, 60, 60);
    this.p5.noStroke();
    this.p5.rect(screenX - barWidth / 2, barY, barWidth, barHeight, 2);

    // Barre de vie
    const healthPercent = this.health / this.maxHealth;
    const healthColor = healthPercent > 0.5 ? [100, 255, 100] :
      healthPercent > 0.25 ? [255, 200, 0] : [255, 100, 100];
    this.p5.fill(...healthColor);
    this.p5.rect(screenX - barWidth / 2, barY, barWidth * healthPercent, barHeight, 2);
  }

  /**
   * Inflige des dégâts à l'ennemi
   * @param {number} damage - Montant des dégâts
   * @returns {boolean} - True si l'ennemi est mort
   */
  takeDamage(damage) {
    if (this.isDying) return false;

    this.health -= damage;

    if (this.health <= 0) {
      this.health = 0;
      this.die();
      return true;
    }

    return false;
  }

  /**
   * Tue l'ennemi
   */
  die() {
    this.isDying = true;
    this.deathAnimationStart = this.p5.millis();
  }

  /**
   * Vérifie si l'ennemi peut attaquer
   * @returns {boolean}
   */
  canAttack() {
    return !this.isDying && this.attackCooldown <= 0;
  }

  /**
   * Effectue une attaque
   */
  attack() {
    this.attackCooldown = this.attackCooldownMax;
  }

  /**
   * Vérifie si l'ennemi est actif
   * @returns {boolean}
   */
  isActive() {
    return this.active;
  }

  /**
   * Obtient le rectangle de collision de l'ennemi
   * @param {number} scrollOffset - Décalage du scroll
   * @returns {Object} - {x, y, width, height}
   */
  getCollisionRect(scrollOffset) {
    const screenX = this.worldX - scrollOffset;
    return {
      x: screenX - this.width / 2,
      y: this.worldY - this.height / 2,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * Vérifie si l'ennemi est visible à l'écran
   * @param {number} scrollOffset - Décalage du scroll
   * @returns {boolean}
   */
  isOnScreen(scrollOffset) {
    const screenX = this.worldX - scrollOffset;
    return screenX > -200 && screenX < GAME_CONFIG.CANVAS_WIDTH + 200;
  }
}
