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
  }
};