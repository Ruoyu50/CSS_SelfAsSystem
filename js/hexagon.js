import { CONFIG } from './config.js';

const DEBUG = false;
// 固定六个属性的顺序（逆时针，从正上方开始）
const ATTRIBUTES_ORDER = [
  "Energy",
  "Emotion",
  "Attention",
  "Motivation",
  "Engagement",
  "Meaning"
];

let HEXAGON_ID_COUNTER = 0;

// 单个三角形
export class Triangle {
  constructor(vertices, color) {
    this.vertices = vertices; // [{x, y}, ...]
    this.color = color;       // [h, s, b]
  }

  draw() {
    push();
    fill(this.color[0], this.color[1], this.color[2]);
    stroke(0, 0, 20);
    strokeWeight(1);
    beginShape();
    this.vertices.forEach(v => {
      vertex(v.x, v.y);
    });
    endShape(CLOSE);
    pop();
  }
}

// 六边形（由六个三角形组成）
export class Hexagon {
  constructor(x, y, r, props, colorMapper) {
    this.id = HEXAGON_ID_COUNTER++;
    this.x = x;
    this.y = y;
    this.r = r;
    this.props = props;
    this.triangles = [];
    this.colorMapper = colorMapper;

    // 新增：运动相关
    this.vx = random(-2, 2);   // 随机初始速度
    this.vy = random(-2, 2);
    this.angle = 0;            // 初始角度
    this.omega = (props.time === "am") ? -0.02 : 0.02; // AM 顺时针，PM 逆时针

    this.buildTriangles();
  }

  buildTriangles() {
    this.triangles = []; // 每次重建清空
    ATTRIBUTES_ORDER.forEach((attrName, i) => {
      const angle1 = (i * 60 - 90) * PI / 180; // 从正上方开始
      const angle2 = ((i + 1) * 60 - 90) * PI / 180;

      // 改动：三角形顶点使用 this.angle
      const vertices = [
        { x: this.x, y: this.y }, // 中心点
        { x: this.x + this.r * cos(angle1 + this.angle), y: this.y + this.r * sin(angle1 + this.angle) },
        { x: this.x + this.r * cos(angle2 + this.angle), y: this.y + this.r * sin(angle2 + this.angle) }
      ];

      // 渲染测试：使用属性级 certainty
      const attrObj = this.props[attrName]; 
      let finalColor;

      if (typeof attrObj === "object" && attrObj.value && attrObj.certainty !== undefined) {
        // 新格式 { value: "...", certainty: n }
        const baseColor = this.colorMapper.mapAttributeToBaseColor(attrName, attrObj.value);
        finalColor = this.colorMapper.applyCertainty(baseColor, attrObj.certainty);
      } else {
        // 兼容旧格式（字符串 + 全局 certainty）
        const baseColor = this.colorMapper.mapAttributeToBaseColor(attrName, this.props[attrName]);
        finalColor = this.colorMapper.applyCertainty(baseColor, this.props.certainty);
      }

      this.triangles.push(new Triangle(vertices, finalColor));
    });
  }

update(dt=1) {
    // 帧率独立：速度乘以 dt
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // 限制速度范围，避免飞出画布过快
    this.vx = constrain(this.vx, -CONFIG.physics.maxSpeed, CONFIG.physics.maxSpeed);
    this.vy = constrain(this.vy, -CONFIG.physics.maxSpeed, CONFIG.physics.maxSpeed);
    // 摩擦衰减
this.vx *= CONFIG.physics.friction;
this.vy *= CONFIG.physics.friction;
this.omega *= CONFIG.physics.friction;

    // 更新角度
    this.angle += this.omega * dt;

    // 重建三角形顶点
    this.buildTriangles();

    // 调试输出：第一个 hexagon
    if (CONFIG.DEBUG && this === window.hexagons?.[0]) {
        console.log(`角度: ${this.angle.toFixed(2)}, vx: ${this.vx.toFixed(2)}, vy: ${this.vy.toFixed(2)}, omega: ${this.omega.toFixed(3)}`);
    }
  }

  draw() {
    this.triangles.forEach(triangle => triangle.draw());
  }

  // 计算六边形六个顶点的世界坐标（正上方起，逆时针）
  computeWorldVertices() {
    const vertices = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * 60 - 90) * PI / 180 + this.angle;
      vertices.push({
        x: this.x + this.r * cos(angle),
        y: this.y + this.r * sin(angle)
      });
    }
    return vertices;
  }
}

// // 导出类
// window.Hexagon = Hexagon;
// window.Triangle = Triangle;
