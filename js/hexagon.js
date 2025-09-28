// 固定六个属性的顺序（逆时针，从正上方开始）
const ATTRIBUTES_ORDER = [
  "Energy",
  "Emotion",
  "Attention",
  "Motivation",
  "Engagement",
  "Meaning"
];

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
    this.x = x;
    this.y = y;
    this.r = r;
    this.props = props;
    this.triangles = [];
    this.colorMapper = colorMapper;

    this.buildTriangles();
  }

  buildTriangles() {
  ATTRIBUTES_ORDER.forEach((attrName, i) => {
    const angle1 = (i * 60 - 90) * PI / 180; // 从正上方开始
    const angle2 = ((i + 1) * 60 - 90) * PI / 180;

    const vertices = [
      { x: this.x, y: this.y }, // 中心点
      { x: this.x + this.r * cos(angle1), y: this.y + this.r * sin(angle1) },
      { x: this.x + this.r * cos(angle2), y: this.y + this.r * sin(angle2) }
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

  draw() {
    this.triangles.forEach(triangle => triangle.draw());
  }
}

// // 导出类
// window.Hexagon = Hexagon;
// window.Triangle = Triangle;
