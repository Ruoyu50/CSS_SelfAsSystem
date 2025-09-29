import { CONFIG } from './config.js';
import { Hexagon } from './hexagon.js';
import { validateDataArray } from './utils.js';
import { ColorMapper } from './colorMapper.js';
import { Physics } from './physics.js';
import { Logger } from './logger.js';
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
    noLoop(); // 停止 draw 循环
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
  
  const tolerance = 5; // 顶点–边接触容差

  hexagons.forEach(hexA => {
    if (hexA.props.time !== "am") return; // 只做 AM × PM 示例

    hexagons.forEach(hexB => {
      if (hexB.props.time !== "pm") return;

      const vertices = hexA.computeWorldVertices();
      const edges = [];
      const hexBVerts = hexB.computeWorldVertices();
      for (let i = 0; i < 6; i++) {
        edges.push({start: hexBVerts[i], end: hexBVerts[(i+1)%6]});
      }

      vertices.forEach((v, vi) => {
        edges.forEach((e, ei) => {
          const res = Physics.vertexEdgeContactTest(v, e.start, e.end);
          // ✅ 在这里加调试输出
          if (CONFIG.DEBUG) {
            console.log(
              `检测: 顶点(${v.x.toFixed(1)},${v.y.toFixed(1)}) 最近点=(${res.closestPoint.x.toFixed(1)},${res.closestPoint.y.toFixed(1)}), 距离=${res.distance.toFixed(2)}, 法线=(${res.normal.x.toFixed(2)},${res.normal.y.toFixed(2)})`
            );
          }
          if (res.distance <= tolerance) {
            // 简单响应：交换速度分量
            [hexA.vx, hexB.vx] = [hexB.vx, hexA.vx];
            [hexA.vy, hexB.vy] = [hexB.vy, hexA.vy];

            // Logger
            Logger.logVertexBoundary({
              hexId: hexA.id,
              vertexIndex: vi,
              edge: ei,
              pos: res.closestPoint,
              hex: hexA
            });
          }
        });
      });
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
        pos: c.pos
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
};