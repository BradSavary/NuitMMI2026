import { Enemy } from './Enemy';
import { Boss } from './Boss';
import { GAME_CONFIG } from '../utils/config';

/**
 * Classe Level - Gère un niveau (étage de la tour)
 * Contient les ennemis, les positions de spawn, et la progression
 */
export class Level {
  constructor(p5Instance, levelNumber = 1) {
    this.p5 = p5Instance;
    this.levelNumber = levelNumber;

    // Longueur du niveau
    this.length = GAME_CONFIG.LEVEL.LENGTH;

    // Scroll (progression dans le niveau)
    this.scrollOffset = 0;
    this.scrollSpeed = GAME_CONFIG.LEVEL.SCROLL_SPEED_NORMAL;

    // Ennemis
    this.enemies = [];
    this.spawnedEnemies = 0;

    // Boss
    this.boss = null;
    this.bossSpawned = false;

    // État du niveau
    this.completed = false;
    this.enemiesDefeated = 0;

    // Génération du niveau
    this.generateLevel();
  }

  /**
   * Génère le niveau avec les ennemis
   */
  generateLevel() {
    // Niveau 1 : Tour japonaise
    const enemyTypes = [
      { element: 'fire', attackType: 'melee', x: 800 },
      { element: 'ice', attackType: 'ranged', x: 1200 },
      { element: 'fire', attackType: 'melee', x: 1600 },
      { element: 'earth', attackType: 'melee', x: 2000 },
      { element: 'electric', attackType: 'ranged', x: 2400 },
      { element: 'ice', attackType: 'melee', x: 2800 },
      { element: 'neutral', attackType: 'melee', x: 3200 },
      { element: 'fire', attackType: 'ranged', x: 3600 },
    ];

    // Créer les ennemis
    enemyTypes.forEach((enemyData) => {
      const enemy = new Enemy(
        this.p5,
        enemyData.x,
        GAME_CONFIG.CANVAS_HEIGHT / 2,
        enemyData.element,
        enemyData.attackType
      );
      this.enemies.push(enemy);
    });

    // Boss à la fin
    this.boss = new Boss(
      this.p5,
      4500,
      GAME_CONFIG.CANVAS_HEIGHT / 2,
      'fire' // Boss de feu pour le niveau 1
    );
  }

  /**
   * Met à jour le niveau
   */
  update() {
    if (this.completed) return;

    // Déterminer la vitesse de scroll selon les ennemis visibles
    const enemiesOnScreen = this.getEnemiesOnScreen();
    const bossOnScreen = this.boss && this.boss.isOnScreen(this.scrollOffset) && this.boss.isActive();

    if (enemiesOnScreen.length > 0 || bossOnScreen) {
      // Ralentir quand des ennemis sont présents
      this.scrollSpeed = GAME_CONFIG.LEVEL.SCROLL_SPEED_COMBAT;
    } else {
      // Accélérer quand il n'y a pas d'ennemis
      this.scrollSpeed = GAME_CONFIG.LEVEL.SCROLL_SPEED_NORMAL;
    }

    // Progression du scroll
    this.scrollOffset += this.scrollSpeed;

    // Mettre à jour les ennemis
    this.enemies.forEach((enemy) => {
      if (enemy.isActive()) {
        enemy.update(this.scrollOffset);
      }
    });

    // Mettre à jour le boss
    if (this.boss && !this.bossSpawned && this.scrollOffset > 4000) {
      this.bossSpawned = true;
    }

    if (this.boss && this.boss.isActive()) {
      this.boss.update(this.scrollOffset);
    }

    // Vérifier si le niveau est terminé
    if (this.scrollOffset >= this.length && this.allEnemiesDefeated()) {
      this.completed = true;
    }
  }

  /**
   * Dessine le niveau
   */
  draw() {
    // Fond défilant
    this.drawBackground();

    // Ennemis
    this.enemies.forEach((enemy) => {
      if (enemy.isActive()) {
        enemy.draw(this.scrollOffset);
      }
    });

    // Boss
    if (this.boss && this.bossSpawned) {
      this.boss.draw(this.scrollOffset);
    }

    // Debug : barre de progression
    this.drawProgressBar();
  }

  /**
   * Dessine le fond défilant
   */
  drawBackground() {
    this.p5.push();

    // Fond dégradé
    for (let y = 0; y < GAME_CONFIG.CANVAS_HEIGHT; y += 10) {
      const inter = this.p5.map(y, 0, GAME_CONFIG.CANVAS_HEIGHT, 0, 1);
      const c = this.p5.lerpColor(
        this.p5.color(20, 20, 40),
        this.p5.color(60, 40, 80),
        inter
      );
      this.p5.stroke(c);
      this.p5.line(0, y, GAME_CONFIG.CANVAS_WIDTH, y);
    }

    // Grille défilante
    this.p5.stroke(60, 60, 80, 100);
    this.p5.strokeWeight(1);

    const gridOffset = this.scrollOffset % 100;

    // Lignes horizontales
    for (let y = 0; y < GAME_CONFIG.CANVAS_HEIGHT; y += 100) {
      this.p5.line(0, y, GAME_CONFIG.CANVAS_WIDTH, y);
    }

    // Lignes verticales défilantes
    for (let x = -gridOffset; x < GAME_CONFIG.CANVAS_WIDTH; x += 100) {
      this.p5.line(x, 0, x, GAME_CONFIG.CANVAS_HEIGHT);
    }

    // Sol
    this.p5.fill(40, 40, 60);
    this.p5.noStroke();
    this.p5.rect(0, GAME_CONFIG.CANVAS_HEIGHT - 50, GAME_CONFIG.CANVAS_WIDTH, 50);

    this.p5.pop();
  }

  /**
   * Dessine la barre de progression du niveau
   */
  drawProgressBar() {
    const barWidth = 300;
    const barHeight = 20;
    const x = GAME_CONFIG.CANVAS_WIDTH / 2 - barWidth / 2;
    const y = 20;

    this.p5.push();

    // Fond
    this.p5.fill(40, 40, 60);
    this.p5.stroke(150);
    this.p5.strokeWeight(2);
    this.p5.rect(x, y, barWidth, barHeight, 10);

    // Progression
    const progress = Math.min(this.scrollOffset / this.length, 1);
    this.p5.noStroke();
    this.p5.fill(100, 200, 255);
    this.p5.rect(x, y, barWidth * progress, barHeight, 10);

    // Texte
    this.p5.fill(255);
    this.p5.textSize(14);
    this.p5.textAlign(this.p5.CENTER);
    this.p5.text(`Niveau ${this.levelNumber} - ${Math.floor(progress * 100)}%`, x + barWidth / 2, y + 15);

    this.p5.pop();
  }

  /**
   * Récupère les ennemis visibles à l'écran
   * @returns {Array<Enemy>}
   */
  getEnemiesOnScreen() {
    return this.enemies.filter(
      (enemy) => enemy.isActive() && enemy.isOnScreen(this.scrollOffset)
    );
  }

  /**
   * Récupère tous les ennemis actifs (y compris le boss)
   * @returns {Array<Enemy>}
   */
  getAllActiveEnemies() {
    const activeEnemies = this.enemies.filter((enemy) => enemy.isActive());

    if (this.boss && this.boss.isActive() && this.bossSpawned) {
      activeEnemies.push(this.boss);
    }

    return activeEnemies;
  }

  /**
   * Vérifie si tous les ennemis sont vaincus
   * @returns {boolean}
   */
  allEnemiesDefeated() {
    const allEnemiesDead = this.enemies.every((enemy) => !enemy.isActive());
    const bossDefeated = !this.boss || !this.boss.isActive();

    return allEnemiesDead && bossDefeated;
  }

  /**
   * Notifie qu'un ennemi a été vaincu
   */
  onEnemyDefeated() {
    this.enemiesDefeated++;
  }

  /**
   * Vérifie si le niveau est terminé
   * @returns {boolean}
   */
  isCompleted() {
    return this.completed;
  }

  /**
   * Obtient le décalage de scroll actuel
   * @returns {number}
   */
  getScrollOffset() {
    return this.scrollOffset;
  }

  /**
   * Réinitialise le niveau
   */
  reset() {
    this.scrollOffset = 0;
    this.completed = false;
    this.enemiesDefeated = 0;
    this.bossSpawned = false;
    this.enemies = [];
    this.boss = null;
    this.generateLevel();
  }
}
