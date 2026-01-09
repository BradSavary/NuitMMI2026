// Effets visuels pour le jeu
import { GAME_CONFIG } from './config';

/**
 * Gestionnaire d'effets visuels
 */
export class EffectsManager {
  constructor(p5Instance) {
    this.p5 = p5Instance;
    this.damageFlashActive = false;
    this.damageFlashStartTime = 0;
  }

  /**
   * Active le flash rouge quand le joueur prend des dégâts
   */
  triggerDamageFlash() {
    this.damageFlashActive = true;
    this.damageFlashStartTime = this.p5.millis();
  }

  /**
   * Dessine le flash de dégâts si actif
   */
  drawDamageFlash() {
    if (!this.damageFlashActive) return;

    const elapsed = this.p5.millis() - this.damageFlashStartTime;

    if (elapsed > GAME_CONFIG.EFFECTS.DAMAGE_FLASH_DURATION) {
      this.damageFlashActive = false;
      return;
    }

    // Flash rouge sur les bords de l'écran
    this.p5.push();
    this.p5.noStroke();
    this.p5.fill(GAME_CONFIG.EFFECTS.DAMAGE_FLASH_COLOR);
    this.p5.rect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    this.p5.pop();
  }

  /**
   * Effet de particules pour les sorts
   * @param {number} x - Position x
   * @param {number} y - Position y
   * @param {string} element - Élément du sort
   */
  spellParticles(x, y, element) {
    const color = GAME_CONFIG.ELEMENT_COLORS[element];
    this.p5.push();
    this.p5.noStroke();
    this.p5.fill(color);

    // Particules aléatoires autour du sort
    for (let i = 0; i < 5; i++) {
      const angle = this.p5.random(this.p5.TWO_PI);
      const distance = this.p5.random(10, 30);
      const px = x + Math.cos(angle) * distance;
      const py = y + Math.sin(angle) * distance;
      const size = this.p5.random(3, 8);
      this.p5.circle(px, py, size);
    }
    this.p5.pop();
  }

  /**
   * Effet visuel spectaculaire pour l'ultimate
   * @param {number} x - Position x
   * @param {number} y - Position y
   */
  ultimateEffect(x, y) {
    this.p5.push();

    // Onde de choc avec plusieurs anneaux
    for (let i = 0; i < 5; i++) {
      const radius = 50 + i * 100;
      this.p5.noFill();
      this.p5.stroke(255, 255, 0, 200 - i * 40);
      this.p5.strokeWeight(5 - i);
      this.p5.circle(x, y, radius);
    }

    // Étoile centrale
    this.p5.noStroke();
    this.p5.fill(255, 255, 0);
    this.drawStar(x, y, 30, 60, 8);

    this.p5.pop();
  }

  /**
   * Dessine une étoile
   * @param {number} x - Position x
   * @param {number} y - Position y
   * @param {number} radius1 - Rayon intérieur
   * @param {number} radius2 - Rayon extérieur
   * @param {number} npoints - Nombre de branches
   */
  drawStar(x, y, radius1, radius2, npoints) {
    const angle = this.p5.TWO_PI / npoints;
    const halfAngle = angle / 2.0;
    this.p5.beginShape();
    for (let a = 0; a < this.p5.TWO_PI; a += angle) {
      let sx = x + Math.cos(a) * radius2;
      let sy = y + Math.sin(a) * radius2;
      this.p5.vertex(sx, sy);
      sx = x + Math.cos(a + halfAngle) * radius1;
      sy = y + Math.sin(a + halfAngle) * radius1;
      this.p5.vertex(sx, sy);
    }
    this.p5.endShape(this.p5.CLOSE);
  }

  /**
   * Effet de mort d'un ennemi
   * @param {number} x - Position x
   * @param {number} y - Position y
   * @param {string} element - Élément de l'ennemi
   */
  enemyDeathEffect(x, y, element) {
    const color = GAME_CONFIG.ELEMENT_COLORS[element];
    this.p5.push();
    this.p5.noStroke();
    this.p5.fill(color);

    // Explosion de particules en cercle
    for (let i = 0; i < 12; i++) {
      const angle = (this.p5.TWO_PI / 12) * i;
      const distance = 40;
      const px = x + Math.cos(angle) * distance;
      const py = y + Math.sin(angle) * distance;
      this.p5.circle(px, py, 10);
    }
    this.p5.pop();
  }
}
