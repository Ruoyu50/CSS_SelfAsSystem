/**
 * @typedef {Object} InteractionEvent
 * @property {string} type - 事件类型，例如 'vertex_edge' 或其他
 * @property {number} vertexOwner - 顶点所属 hex ID
 * @property {number} edgeOwner - 边所属 hex ID
 * @property {number} vertexIndex - 顶点索引
 * @property {number} edge - 边索引
 * @property {{x:number, y:number}} contactPoint - 顶点到边的最近点
 * @property {{x:number, y:number}} normal - 法线向量
 * @property {number} [timestamp] - 可选时间戳，如果未提供自动生成
 */

// js/logger.js
import { CONFIG } from './config.js';
// js/logger.js
export const Logger = {
    vertexBoundaryCollisions: /** @type {any[]} */ ([]),
    
    /** @type {InteractionEvent[]} */
    interactions: [],

    /** @type {InteractionEvent[]}  最近用于可视化的交互缓存（长度受 CONFIG.physics.recentCollisionsN 控制） */
    recentInteractions: [],

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
      vertexOwnerDate: event.vertexOwnerDate ?? null,
      edgeOwnerDate: event.edgeOwnerDate ?? null,
      timestamp: Date.now()
    };
    this.interactions.push(enriched);

    const N = CONFIG.physics.recentCollisionsN || 50;
    this.recentInteractions.push(enriched);
    if (this.interactions.length > N) {
      this.interactions.shift();
    }

    // 保持 interactions 不无限增长（可选：和 recent 分开）
    if (this.interactions.length > 10000) { // 一个安全上限，按需调整
      this.interactions.shift();
    }

    if (CONFIG.DEBUG) {
      console.log("记录 vertex-edge 碰撞:", enriched);
    }
  },

    // 导出 JSON（导出 boundary 碰撞和 vertex-edge 交互）
  exportJSON() {
    // For edge translation:
    const edgeAttributes = ["Energy", "Emotion", "Attention", "Motivation", "Engagement", "Meaning"];
    // Map interactions for JSON output
    const mappedInteractions = this.interactions.map(e => ({
      ...e,
      edge: (typeof e.edge === "number" ? (edgeAttributes[e.edge] ?? e.edge) : e.edge),
      vertexOwnerDate: e.vertexOwnerDate ?? null,
      edgeOwnerDate: e.edgeOwnerDate ?? null
    }));
    return JSON.stringify({
      vertexBoundaryCollisions: this.vertexBoundaryCollisions,
      interactions: mappedInteractions
    }, null, 2);
  },

  /**
   * 导出为 CSV 字符串
   * @returns {string}
   */
  exportCSV() {
    // Boundary collisions section
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
        e.pos?.x ?? "",
        e.pos?.y ?? "",
        e.timestamp,
        e.hexX ?? "",
        e.hexY ?? "",
        e.vx ?? "",
        e.vy ?? "",
        e.omega ?? ""
      ];
      lines.push(row.join(","));
    });
    // Interactions section
    lines.push(""); // blank line
    lines.push("--- vertex-edge interactions ---");
    // Updated intFields: add vertexOwnerDate, edgeOwnerDate between type and vertexIndex
    const intFields = [
      "type", "vertexOwnerDate", "edgeOwnerDate", "vertexIndex", "edge",
      "contact_x", "contact_y", "normal_x", "normal_y", "timestamp"
    ];
    lines.push(intFields.join(","));
    // Edge attribute mapping
    const edgeAttributes = ["Energy", "Emotion", "Attention", "Motivation", "Engagement", "Meaning"];
    this.interactions.forEach(e => {
      const row = [
        e.type ?? "",
        e.vertexOwnerDate ?? "",
        e.edgeOwnerDate ?? "",
        e.vertexIndex ?? "",
        (typeof e.edge === "number" ? (edgeAttributes[e.edge] ?? e.edge) : e.edge ?? ""),
        e.contactPoint?.x ?? "",
        e.contactPoint?.y ?? "",
        e.normal?.x ?? "",
        e.normal?.y ?? "",
        e.timestamp ?? ""
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