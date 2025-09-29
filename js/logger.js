// js/logger.js
export const Logger = {
  vertexBoundaryCollisions: [],

  logVertexBoundary(event) {
    const enriched = {
      ...event,
      timestamp: Date.now()
    };
    this.vertexBoundaryCollisions.push(enriched);
    console.log("记录 boundary 碰撞:", enriched);
  },

  exportJSON() {
    return JSON.stringify(this.vertexBoundaryCollisions, null, 2);
  },

  clear() {
    this.vertexBoundaryCollisions = [];
  },

  // phase3.3 统计方法
  /**
   * 统计指定 hexId 的碰撞次数
   * @param {number} hexId
   * @returns {number}
   */
  countCollisionsByHex(hexId) {
    return this.vertexBoundaryCollisions.filter(e => e.hexId === hexId).length;
  },

  /**
   * 统计指定 hexId 下各顶点的碰撞次数
   * @param {number} hexId
   * @returns {Object} 形如 {0: n0, 1: n1, ...}
   */
  countCollisionsByHexVertex(hexId) {
    const result = {};
    this.vertexBoundaryCollisions.forEach(e => {
      if (e.hexId === hexId) {
        const idx = e.vertexIndex;
        if (!(idx in result)) result[idx] = 0;
        result[idx]++;
      }
    });
    return result;
  },

  /**
   * 返回所有 hexId 的碰撞计数（总览）
   * @returns {Object} 形如 {hexId1: n1, hexId2: n2, ...}
   */
  countAllHexCollisions() {
    const map = {};
    this.vertexBoundaryCollisions.forEach(e => {
      if (!(e.hexId in map)) map[e.hexId] = 0;
      map[e.hexId]++;
    });
    return map;
  },

  /**
   * 统计各边的碰撞次数（left/right/top/bottom）
   * @returns {Object} 形如 {left: n, right: n, ...}
   */
  countCollisionsByEdge() {
    const map = {};
    this.vertexBoundaryCollisions.forEach(e => {
      const edge = e.edge;
      if (!(edge in map)) map[edge] = 0;
      map[edge]++;
    });
    return map;
  }
};