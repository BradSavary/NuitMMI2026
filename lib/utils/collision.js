// Détection des collisions entre sprites

/**
 * Vérifie si deux rectangles se chevauchent
 * @param {Object} rect1 - Premier rectangle {x, y, width, height}
 * @param {Object} rect2 - Deuxième rectangle {x, y, width, height}
 * @returns {boolean} - True si collision
 */
export function rectCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Vérifie si deux cercles se chevauchent
 * @param {Object} circle1 - Premier cercle {x, y, radius}
 * @param {Object} circle2 - Deuxième cercle {x, y, radius}
 * @returns {boolean} - True si collision
 */
export function circleCollision(circle1, circle2) {
  const dx = circle1.x - circle2.x;
  const dy = circle1.y - circle2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < circle1.radius + circle2.radius;
}

/**
 * Vérifie si un cercle chevauche un rectangle
 * @param {Object} circle - Cercle {x, y, radius}
 * @param {Object} rect - Rectangle {x, y, width, height}
 * @returns {boolean} - True si collision
 */
export function circleRectCollision(circle, rect) {
  // Trouve le point le plus proche du cercle sur le rectangle
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

  // Calcule la distance entre le cercle et ce point
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < circle.radius;
}

/**
 * Vérifie si un point est dans un rectangle
 * @param {number} x - Position x du point
 * @param {number} y - Position y du point
 * @param {Object} rect - Rectangle {x, y, width, height}
 * @returns {boolean} - True si le point est dans le rectangle
 */
export function pointInRect(x, y, rect) {
  return (
    x >= rect.x &&
    x <= rect.x + rect.width &&
    y >= rect.y &&
    y <= rect.y + rect.height
  );
}

/**
 * Calcule la distance entre deux points
 * @param {number} x1 - Position x du premier point
 * @param {number} y1 - Position y du premier point
 * @param {number} x2 - Position x du deuxième point
 * @param {number} y2 - Position y du deuxième point
 * @returns {number} - Distance
 */
export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
