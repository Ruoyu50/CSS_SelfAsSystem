import { CONFIG } from './config.js';
import { Hexagon } from './hexagon.js';
import { validateDataArray } from './utils.js';
import { ColorMapper } from './colorMapper.js';
import { Physics } from './physics.js';
import { Logger } from './logger.js';
import { DataManager } from './dManager.js';
import { setupControls } from './controls.js';

let hexagons = [];
let mockData = [];

// 保留 preload
window.preload = function() {
  mockData = loadJSON("data/mockData.json",
    data => console.log("mockData 成功加载", data),
    err => console.error("mockData 加载失败", err)
  );
};

// 改成挂到 window
window.setup = function() {
  // window.hexagons = hexagons; // 让 hexagons 挂到全局，供 hexagon.js 调试使用
  
  if (CONFIG.DEBUG) console.log("setup 执行了");  const canvas = createCanvas(800, 600);
  canvas.parent("canvas-container");
  colorMode(HSB, 360, 100, 100);

  const dataArray = Array.isArray(mockData) ? mockData : Object.values(mockData || []);
  if (CONFIG.DEBUG) {
    console.log("mockData:", mockData);
    console.log("dataArray:", dataArray);
  }

  // 使用 import 导入的 validateDataArray
  if (!validateDataArray(dataArray)) {
    console.error("mockData.json 数据不完整，请检查字段！");
    noLoop();
    return;
  }

  if (CONFIG.DEBUG) console.log(`成功加载 ${dataArray.length} 条数据`);

  dataArray.forEach((data, index) => {
    const x = random(100, width - 100);
    const y = random(100, height - 100);
    const r = 50;
    const hex = new Hexagon(x, y, r, data, ColorMapper);
    hexagons.push(hex);
  });
  setupControls(); // 绑定导入/导出按钮
};

window.draw = function() {
  background(220, 20, 95);

  const dt = deltaTime / 16.6667; // 假设 60fps 为基准，每帧时间标准化

  // 阶段2.1 调试输出：打印第一个 hexagon 的状态
  if (CONFIG.DEBUG && hexagons.length > 0) {
    const h = hexagons[0];
    console.log(`第一个 hexagon -> x: ${h.x.toFixed(1)}, y: ${h.y.toFixed(1)}, angle: ${h.angle.toFixed(2)}, vx: ${h.vx.toFixed(2)}, vy: ${h.vy.toFixed(2)}, omega: ${h.omega.toFixed(3)}`);
  }
  // if (CONFIG.DEBUG) console.log("hexagons 数量:", hexagons.length);


// --- 顶点–边交互检测（phase4.2 动态点积 + 统一法线） ---
const tolerance = CONFIG.physics.tolerance;

// 顶点–边检测函数，避免重复代码
function detectVertexEdgeInteraction(hexA, hexB) {
  const vertices = hexA.computeWorldVertices();
  const hexBVerts = hexB.computeWorldVertices();
  const edges = [];
  for (let i = 0; i < 6; i++) {
    edges.push({start: hexBVerts[i], end: hexBVerts[(i+1)%6]});
  }

  vertices.forEach((v, vi) => {
    edges.forEach((e, ei) => {
      const res = Physics.vertexEdgeContactTest(v, e.start, e.end);
      if (res.distance <= tolerance) {
        // 统一法线朝外
        const centerToMid = {
          x: res.edgeMid.x - hexB.x,
          y: res.edgeMid.y - hexB.y
        };
        const len = Math.sqrt(centerToMid.x**2 + centerToMid.y**2);
        const normal = { x: centerToMid.x / len, y: centerToMid.y / len };

        // 顶点速度向量
        const vRel = { x: hexA.vx, y: hexA.vy };
        const dot = vRel.x * normal.x + vRel.y * normal.y;

        if (dot < 0) {
          [hexA.vx, hexB.vx] = [hexB.vx, hexA.vx];
          [hexA.vy, hexB.vy] = [hexB.vy, hexA.vy];
        }

        Logger.logInteraction({
          type: 'vertex_edge',
          vertexOwnerDate: hexA.props.date,
          edgeOwnerDate: hexB.props.date,
          vertexIndex: vi,
          edge: ei,
          contactPoint: res.closestPoint,
          normal: normal
        });

        if (CONFIG.DEBUG) {
          console.log(
            `检测: 顶点(${v.x.toFixed(1)},${v.y.toFixed(1)}) 最近点=(${res.closestPoint.x.toFixed(1)},${res.closestPoint.y.toFixed(1)}), 距离=${res.distance.toFixed(2)}, 外法线=(${normal.x.toFixed(2)},${normal.y.toFixed(2)}), 点积=${dot.toFixed(2)}`
          );
        }
      }
    });
  });
}

// AM → PM
hexagons.forEach(hexA => {
  if (hexA.props.time !== "am") return;
  hexagons.forEach(hexB => {
    if (hexB.props.time !== "pm") return;
    detectVertexEdgeInteraction(hexA, hexB);
  });
});

// PM → AM
hexagons.forEach(hexA => {
  if (hexA.props.time !== "pm") return;
  hexagons.forEach(hexB => {
    if (hexB.props.time !== "am") return;
    detectVertexEdgeInteraction(hexA, hexB);
  });
});

  hexagons.forEach(hex => {
    hex.update(dt);
    const collisions = Physics.checkBoundaryCollisions(hex, width, height);

    // if (CONFIG.DEBUG && collisions.length > 0) {
    //   console.log("碰撞:", collisions);
    // }

    collisions.forEach(c => {
        Logger.logVertexBoundary({
        hexId: hex.id,
        vertexIndex: c.vertexIndex,
        edge: c.edge,
        pos: c.pos,
        hex
      });
    });
    // 绘制六边形
    hex.draw();
  });
  // 绘制红点：遍历 Logger 所有记录
  (Logger.recentCollisions || []).forEach(e => {
    push();
    colorMode(HSB, 360, 100, 100); // 确保颜色模式正确
    fill(0, 100, 100);             // 红色
    noStroke();
    ellipse(e.pos.x, e.pos.y, 8, 8); // 用 e.pos
    pop();
  });
  // 可视化 vertex-edge 交互（phase4.21）
(Logger.recentInteractions || []).forEach(e => {
  if (!e.contactPoint) return;
  push();
  colorMode(HSB, 360, 100, 100);

  // 蓝点表示 contactPoint
  noStroke();
  fill(200, 80, 90);
  ellipse(e.contactPoint.x, e.contactPoint.y, 8, 8);

  // 画法线方向的小线段（便于看出法线方向）
  stroke(200, 80, 90);
  strokeWeight(2);
  const nx = e.normal?.x ?? 0;
  const ny = e.normal?.y ?? 0;
  const len = 14;
  line(e.contactPoint.x, e.contactPoint.y, e.contactPoint.x + nx * len, e.contactPoint.y + ny * len);
  pop();
});
};