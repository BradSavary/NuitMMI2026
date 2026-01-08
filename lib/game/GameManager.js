import { Player } from './Player';
import { Level } from './Level';
import { SpellFactory } from './Spell';
import { EffectsManager } from '../utils/effects';
import { circleRectCollision } from '../utils/collision';
import { GAME_CONFIG } from '../utils/config';

/**
 * Classe GameManager - Gère l'état global du jeu
 * Coordonne le joueur, les ennemis, les sorts et les collisions
 */
export class GameManager {
  constructor(p5Instance) {
    this.p5 = p5Instance;

    // Entités
    this.player = new Player(p5Instance);
    this.level = new Level(p5Instance, 1);
    this.spells = [];

    // Effets visuels
    this.effects = new EffectsManager(p5Instance);

    // État du jeu
    this.gameState = 'playing'; // 'playing', 'paused', 'gameOver', 'victory'
    this.isPaused = false;

    // Cooldown des sorts
    this.lastSpellTime = 0;

    // Sort actuel reconnu (pour l'affichage)
    this.currentRecognizedSpell = null;
    this.currentSpellElement = null;
    this.currentSpellConfidence = 0;

    // Statistiques
    this.score = 0;
    this.enemiesKilled = 0;
  }

  /**
   * Met à jour le jeu
   */
  update() {
    if (this.isPaused || this.gameState !== 'playing') return;

    // Mettre à jour le joueur
    this.player.update();

    // Mettre à jour le niveau
    this.level.update();

    // Mettre à jour les sorts
    this.updateSpells();

    // Vérifier les collisions
    this.checkCollisions();

    // Vérifier la fin du jeu
    this.checkGameState();
  }

  /**
   * Dessine le jeu
   */
  draw() {
    // Niveau (fond + ennemis)
    this.level.draw();

    // Joueur
    this.player.draw();

    // Sorts
    this.spells.forEach((spell) => {
      if (spell.isActive()) {
        spell.draw();
      }
    });

    // Effets visuels
    this.effects.drawDamageFlash();
  }

  /**
   * Met à jour tous les sorts actifs
   */
  updateSpells() {
    this.spells.forEach((spell) => {
      if (spell.isActive()) {
        spell.update();
      }
    });

    // Retirer les sorts inactifs
    this.spells = this.spells.filter((spell) => spell.isActive());
  }

  /**
   * Vérifie toutes les collisions
   */
  checkCollisions() {
    const scrollOffset = this.level.getScrollOffset();
    const activeEnemies = this.level.getAllActiveEnemies();

    // Collision sorts <-> ennemis
    this.spells.forEach((spell) => {
      if (!spell.isActive() || spell.hasHit) return;

      const spellCircle = spell.getCollisionCircle();

      activeEnemies.forEach((enemy) => {
        if (!enemy.isActive() || enemy.isDying) return;

        const enemyRect = enemy.getCollisionRect(scrollOffset);

        if (circleRectCollision(spellCircle, enemyRect)) {
          // Calculer les dégâts avec l'efficacité élémentaire
          const damage = spell.calculateDamage(enemy);
          const killed = enemy.takeDamage(damage);

          spell.markAsHit();

          if (killed) {
            // Ennemi vaincu
            this.onEnemyKilled(enemy);
            this.effects.enemyDeathEffect(
              enemyRect.x + enemyRect.width / 2,
              enemyRect.y + enemyRect.height / 2,
              enemy.element
            );
          }

          // Charger l'ultimate
          this.player.chargeUltimate(GAME_CONFIG.SPELL.ULTIMATE_GAIN_PER_HIT);
        }
      });
    });

    // Collision joueur <-> ennemis
    const playerRect = this.player.getCollisionRect();

    activeEnemies.forEach((enemy) => {
      if (!enemy.isActive() || enemy.isDying) return;

      const enemyRect = enemy.getCollisionRect(scrollOffset);

      // Vérifier si l'ennemi touche le joueur
      if (this.rectsCollide(playerRect, enemyRect) && enemy.canAttack()) {
        enemy.attack();
        const wasDamaged = this.player.takeDamage(enemy.damage);

        if (wasDamaged) {
          this.effects.triggerDamageFlash();
        }
      }
    });
  }

  /**
   * Vérifie si deux rectangles se chevauchent
   */
  rectsCollide(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }

  /**
   * Appelé quand un ennemi est tué
   */
  onEnemyKilled(enemy) {
    this.enemiesKilled++;
    this.level.onEnemyDefeated();

    // Score basé sur le type d'ennemi
    const scoreValue = enemy.isBoss ? enemy.isBoss() ? 1000 : 100 : 100;
    this.score += scoreValue;
  }

  /**
   * Vérifie l'état du jeu (victoire / défaite)
   */
  checkGameState() {
    // Game Over
    if (this.player.isDead()) {
      this.gameState = 'gameOver';
      return;
    }

    // Victoire
    if (this.level.isCompleted()) {
      this.gameState = 'victory';

      // Récompense "No Hit"
      if (!this.player.hasBeenHit) {
        this.giveNoHitReward();
      }
    }
  }

  /**
   * Donne la récompense "No Hit"
   */
  giveNoHitReward() {
    // Ajouter un cœur supplémentaire
    this.player.increaseMaxHealth(1);
    console.log('🏆 Récompense No Hit : +1 cœur maximum !');
  }

  /**
   * Lance un sort selon le geste reconnu
   * @param {string} gestureName - Nom du geste
   * @param {string} element - Élément du sort
   * @returns {boolean} - True si le sort a été lancé
   */
  castSpell(gestureName, element) {
    const now = this.p5.millis();

    // Vérifier le cooldown
    if (now - this.lastSpellTime < GAME_CONFIG.SPELL.COOLDOWN) {
      return false;
    }

    let spell = null;
    const playerX = this.player.x + 30;
    const playerY = this.player.y;

    // Créer le sort selon l'élément
    switch (element) {
      case GAME_CONFIG.ELEMENTS.FIRE:
        spell = SpellFactory.createFireball(this.p5, playerX, playerY);
        break;
      case GAME_CONFIG.ELEMENTS.ICE:
        spell = SpellFactory.createIceBeam(this.p5, playerX, playerY);
        break;
      case GAME_CONFIG.ELEMENTS.ELECTRIC:
        spell = SpellFactory.createLightning(this.p5, playerX, playerY);
        break;
      case GAME_CONFIG.ELEMENTS.EARTH:
        spell = SpellFactory.createEarthquake(this.p5, playerX, playerY);
        break;
      case GAME_CONFIG.ELEMENTS.NEUTRAL:
        spell = SpellFactory.createMagicMissile(this.p5, playerX, playerY);
        break;
    }

    if (spell) {
      this.spells.push(spell);
      this.lastSpellTime = now;
      return true;
    }

    return false;
  }

  /**
   * Lance l'ultimate
   * @returns {boolean} - True si l'ultimate a été lancé
   */
  castUltimate() {
    if (this.player.useUltimate()) {
      const spell = SpellFactory.createUltimate(
        this.p5,
        this.player.x + 50,
        this.player.y,
        GAME_CONFIG.ELEMENTS.NEUTRAL
      );
      this.spells.push(spell);

      this.effects.ultimateEffect(this.player.x + 100, this.player.y);
      return true;
    }
    return false;
  }

  /**
   * Met à jour le sort reconnu (depuis le système de gestes)
   */
  updateRecognizedSpell(spellName, element, confidence) {
    this.currentRecognizedSpell = spellName;
    this.currentSpellElement = element;
    this.currentSpellConfidence = confidence;
  }

  /**
   * Met le jeu en pause
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Reprend le jeu
   */
  resume() {
    this.isPaused = false;
  }

  /**
   * Réinitialise le jeu
   */
  reset() {
    this.player.reset();
    this.level.reset();
    this.spells = [];
    this.gameState = 'playing';
    this.isPaused = false;
    this.score = 0;
    this.enemiesKilled = 0;
  }

  /**
   * Obtient l'état du jeu pour l'UI
   */
  getGameState() {
    return {
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      ultimateCharge: this.player.ultimateCharge,
      ultimateMaxCharge: this.player.ultimateMaxCharge,
      currentSpell: this.currentRecognizedSpell,
      spellElement: this.currentSpellElement,
      spellConfidence: this.currentSpellConfidence,
      isPaused: this.isPaused,
      gameState: this.gameState,
      score: this.score,
      enemiesKilled: this.enemiesKilled,
    };
  }
}
