// js/physics.js
export const Physics = {
  checkBoundaryCollisions(hex, w, h) {
    const vertices = hex.computeWorldVertices();
    const collisions = [];

    vertices.forEach((v, i) => {
      if (v.x < 0) {
        hex.vx *= -1.05;
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
  },

  // phase4.0: 计算 vertex 到 edge 最近点、距离和法线
  vertexEdgeContactTest(vertex, edgeStart, edgeEnd) {
    const dx = edgeEnd.x - edgeStart.x;
    const dy = edgeEnd.y - edgeStart.y;
    const lengthSq = dx*dx + dy*dy;

    // 投影参数 t
    let t = ((vertex.x - edgeStart.x) * dx + (vertex.y - edgeStart.y) * dy) / lengthSq;
    t = constrain(t, 0, 1);

    // 最近点
    const closest = {
      x: edgeStart.x + t * dx,
      y: edgeStart.y + t * dy
    };

    // 距离向量
    const distVec = {
      x: vertex.x - closest.x,
      y: vertex.y - closest.y
    };

    const distance = Math.sqrt(distVec.x*distVec.x + distVec.y*distVec.y);

    // 法线 (垂直于 edge)
    const normal = {x: -dy, y: dx};
    const normLength = Math.sqrt(normal.x*normal.x + normal.y*normal.y);
    normal.x /= normLength;
    normal.y /= normLength;

    return {closestPoint: closest, distance, normal};
  }
};