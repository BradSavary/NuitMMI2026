import { Enemy } from './Enemy';
import { GAME_CONFIG } from '../utils/config';

/**
 * Classe Boss - Hérite de Enemy avec plus de PV et d'attaques complexes
 */
export class Boss extends Enemy {
  constructor(p5Instance, x, y, element) {
    super(p5Instance, x, y, element, 'melee');

    // Apparence plus grande
    this.width = 100;
    this.height = 150;

    // Beaucoup plus de vie
    this.health = GAME_CONFIG.ENEMY.BOSS_HEALTH;
    this.maxHealth = GAME_CONFIG.ENEMY.BOSS_HEALTH;

    // Dégâts plus élevés
    this.damage = GAME_CONFIG.ENEMY.BOSS_DAMAGE;

    // Pattern d'attaque
    this.attackPattern = 0; // Index du pattern actuel
    this.attackPatterns = ['melee', 'ranged', 'aoe']; // Différents types d'attaques

    // Cooldown réduit pour un boss
    this.attackCooldownMax = 1500;

    // Phases du boss (selon la vie)
    this.currentPhase = 1; // Phase 1, 2 ou 3
  }

  /**
   * Met à jour le boss
   * @param {number} scrollOffset - Décalage du scroll
   */
  update(scrollOffset) {
    super.update(scrollOffset);

    // Changement de phase selon la vie
    const healthPercent = this.health / this.maxHealth;
    if (healthPercent < 0.33) {
      this.currentPhase = 3;
      this.attackCooldownMax = 1000; // Attaque plus rapidement
    } else if (healthPercent < 0.66) {
      this.currentPhase = 2;
      this.attackCooldownMax = 1200;
    }
  }

  /**
   * Dessine le boss
   * @param {number} scrollOffset - Décalage du scroll
   */
  draw(scrollOffset) {
    if (!this.active) return;

    const screenX = this.worldX - scrollOffset;

    // Ne pas dessiner si hors écran
    if (screenX < -300 || screenX > GAME_CONFIG.CANVAS_WIDTH + 300) {
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

    // Aura du boss (effet de glow)
    this.p5.drawingContext.shadowBlur = 30;
    this.p5.drawingContext.shadowColor = color;

    // Corps du boss (plus imposant)
    this.p5.fill(color);
    this.p5.stroke(0);
    this.p5.strokeWeight(5);
    this.p5.rect(
      screenX - this.width / 2,
      this.worldY - this.height / 2,
      this.width,
      this.height,
      15
    );

    // Couronne pour indiquer que c'est un boss
    this.p5.noStroke();
    this.p5.textSize(50);
    this.p5.textAlign(this.p5.CENTER);
    this.p5.text('👑', screenX, this.worldY - this.height / 2 - 40);

    // Icône de l'élément
    this.p5.textSize(40);
    const elementIcons = {
      fire: '🔥',
      ice: '❄️',
      earth: '🌿',
      electric: '⚡',
      neutral: '💀',
    };
    this.p5.text(
      elementIcons[this.element] || '💀',
      screenX,
      this.worldY
    );

    // Barre de vie (plus grande pour le boss)
    if (!this.isDying) {
      this.drawBossHealthBar(screenX);
    }

    // Indicateur de phase
    this.p5.fill(255);
    this.p5.textSize(14);
    this.p5.text(`Phase ${this.currentPhase}`, screenX, this.worldY + this.height / 2 + 30);

    this.p5.pop();
  }

  /**
   * Dessine la barre de vie du boss (plus visible)
   * @param {number} screenX - Position X à l'écran
   */
  drawBossHealthBar(screenX) {
    const barWidth = this.width * 1.5;
    const barHeight = 10;
    const barY = this.worldY - this.height / 2 - 20;

    // Fond de la barre
    this.p5.fill(60, 60, 60);
    this.p5.stroke(255);
    this.p5.strokeWeight(2);
    this.p5.rect(screenX - barWidth / 2, barY, barWidth, barHeight, 5);

    // Barre de vie avec gradient selon la phase
    const healthPercent = this.health / this.maxHealth;
    let healthColor;

    if (this.currentPhase === 3) {
      healthColor = [255, 0, 0]; // Rouge en phase critique
    } else if (this.currentPhase === 2) {
      healthColor = [255, 165, 0]; // Orange en phase 2
    } else {
      healthColor = [100, 255, 100]; // Vert en phase 1
    }

    this.p5.noStroke();
    this.p5.fill(...healthColor);
    this.p5.rect(screenX - barWidth / 2, barY, barWidth * healthPercent, barHeight, 5);

    // Texte de la vie
    this.p5.fill(255);
    this.p5.textSize(12);
    this.p5.textAlign(this.p5.CENTER);
    this.p5.text(
      `${Math.ceil(this.health)} / ${this.maxHealth}`,
      screenX,
      barY - 5
    );
  }

  /**
   * Effectue une attaque (pattern différent selon la phase)
   * @returns {string} - Type d'attaque effectuée
   */
  attack() {
    super.attack();

    // Choisir le pattern d'attaque selon la phase
    let attackType;

    if (this.currentPhase === 3) {
      // Phase 3 : attaques aléatoires et rapides
      attackType = this.attackPatterns[Math.floor(Math.random() * this.attackPatterns.length)];
    } else if (this.currentPhase === 2) {
      // Phase 2 : rotation entre melee et ranged
      this.attackPattern = (this.attackPattern + 1) % 2;
      attackType = this.attackPatterns[this.attackPattern];
    } else {
      // Phase 1 : principalement melee
      attackType = 'melee';
    }

    return attackType;
  }

  /**
   * Le boss prend des dégâts (avec résistance)
   * @param {number} damage - Montant des dégâts
   * @returns {boolean} - True si le boss est mort
   */
  takeDamage(damage) {
    if (this.isDying) return false;

    // Le boss a une petite résistance aux dégâts
    const actualDamage = Math.max(1, damage * 0.9);

    this.health -= actualDamage;

    if (this.health <= 0) {
      this.health = 0;
      this.die();
      return true;
    }

    return false;
  }

  /**
   * Vérifie si c'est un boss
   * @returns {boolean}
   */
  isBoss() {
    return true;
  }
}
