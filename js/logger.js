    /**
     * @typedef {Object} InteractionEvent
     * @property {string} type
     * @property {number} vertexOwner
     * @property {number} edgeOwner
     * @property {number} vertexIndex
     * @property {number} edge
     * @property {{x:number, y:number}} contactPoint
     * @property {{x:number, y:number}} normal
     * @property {number} [timestamp]   // 改成可选
     */

// js/logger.js
import { CONFIG } from './config.js';
// js/logger.js
export const Logger = {
    vertexBoundaryCollisions: [],
    
    /** @type {InteractionEvent[]} */
    interactions: [],

  logVertexBoundary(event) {
    const enriched = {
      ...event,
      timestamp: Date.now(),
      hexX: event.hex?.x,
      hexY: event.hex?.y,
      vx: event.hex?.vx,
      vy: event.hex?.vy,
      omega: event.hex?.omega
      // triangleIndex: event.triangleIndex // 不再使用 triangleIndex 字段
    };
    this.vertexBoundaryCollisions.push(enriched);

    // 保留最近 N 条
    const N = CONFIG.physics.recentCollisionsN || 50;
    if (!this.recentCollisions) this.recentCollisions = [];
    this.recentCollisions.push(enriched);
    if (this.recentCollisions.length > N) {
      this.recentCollisions.shift();
    }

    if (CONFIG.DEBUG) {
      console.log("记录 boundary 碰撞:", enriched);
    }
  },


  // 新方法：记录 vertex–edge 碰撞
  logInteraction(event) {
    const enriched = {
      ...event,
      timestamp: Date.now()
    };
    this.interactions.push(enriched);

    const N = CONFIG.physics.recentCollisionsN || 50;
    if (this.interactions.length > N) {
      this.interactions.shift();
    }

    if (CONFIG.DEBUG) {
      console.log("记录 vertex-edge 碰撞:", enriched);
    }
  },

    // 导出 JSON（只导出 boundary 碰撞，vertex-edge 后续扩展）
  exportJSON() {
    return JSON.stringify(this.vertexBoundaryCollisions, null, 2);
  },

  /**
   * 导出为 CSV 字符串
   * @returns {string}
   */

  // 导出 CSV（暂时不包含 vertex-edge）
  exportCSV() {
    // All available fields: hexId, vertexIndex, edge, pos_x, pos_y, timestamp, hexX, hexY, vx, vy, omega
    const fields = [
      "hexId", "vertexIndex", "edge", "pos_x", "pos_y", "timestamp",
      "hexX", "hexY", "vx", "vy", "omega"
    ];
    const lines = [fields.join(",")];
    this.vertexBoundaryCollisions.forEach(e => {
      const row = [
        e.hexId,
        e.vertexIndex,
        e.edge,
        e.pos && typeof e.pos.x === "number" ? e.pos.x : "",
        e.pos && typeof e.pos.y === "number" ? e.pos.y : "",
        e.timestamp,
        typeof e.hexX === "number" ? e.hexX : "",
        typeof e.hexY === "number" ? e.hexY : "",
        typeof e.vx === "number" ? e.vx : "",
        typeof e.vy === "number" ? e.vy : "",
        typeof e.omega === "number" ? e.omega : ""
      ];
      lines.push(row.join(","));
    });
    return lines.join("\n");
  },

  clear() {
    this.vertexBoundaryCollisions = [];
    this.interactions = [];
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