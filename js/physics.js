// js/physics.js
export const Physics = {
  checkBoundaryCollisions(hex, w, h) {
    const vertices = hex.computeWorldVertices();
    const collisions = [];

    vertices.forEach((v, i) => {
      if (v.x < 0) {
        hex.vx *= -1;
        hex.x = Math.max(hex.x, hex.r);
        collisions.push({vertexIndex: i, edge: 'left', pos: v});
      } else if (v.x > w) {
        hex.vx *= -1;
        hex.x = Math.min(hex.x, w - hex.r);
        collisions.push({vertexIndex: i, edge: 'right', pos: v});
      }

      if (v.y < 0) {
        hex.vy *= -1;
        hex.y = Math.max(hex.y, hex.r);
        collisions.push({vertexIndex: i, edge: 'top', pos: v});
      } else if (v.y > h) {
        hex.vy *= -1;
        hex.y = Math.min(hex.y, h - hex.r);
        collisions.push({vertexIndex: i, edge: 'bottom', pos: v});
      }
    });

    return collisions;
  }
};