import { Hexagon, Triangle } from './hexagon.js';
import { validateDataArray } from './utils.js';
import { ColorMapper } from './colorMapper.js';
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
  console.log("setup 执行了");
  const canvas = createCanvas(800, 600);
  canvas.parent("canvas-container");
  colorMode(HSB, 360, 100, 100);

  const dataArray = Array.isArray(mockData) ? mockData : Object.values(mockData || []);
  console.log("mockData:", mockData);
  console.log("dataArray:", dataArray);

  // 使用 import 导入的 validateDataArray
  if (!validateDataArray(dataArray)) {
    console.error("mockData.json 数据不完整，请检查字段！");
    noLoop(); // 停止 draw 循环
    return;
  }

  console.log(`成功加载 ${dataArray.length} 条数据`);

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

//   console.log("hexagons 数量:", hexagons.length);
  hexagons.forEach(hex => hex.draw());
};