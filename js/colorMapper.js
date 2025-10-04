export const ColorMapper = {
  attributeHues: {
    Energy: 0,
    Emotion: 30,
    Attention: 60,
    Motivation: 120,
    Engagement: 240,
    Meaning: 280
  },

  mapAttributeToBaseColor(attrName, attrValue) {
    const hue = this.attributeHues[attrName] || 0;
    let saturation = 85;
    if (attrValue.includes('high') || attrValue.includes('positive')) saturation = 100;
    else if (attrValue.includes('medium') || attrValue.includes('neutral')) saturation = 85;
    else if (attrValue.includes('low') || attrValue.includes('negative')) saturation = 70;
    return [hue, saturation, 80]; // [h, s, b]
  },

  applyCertainty(baseColor, certainty) {
    if (certainty === undefined) {
      // 渲染测试：兼容旧格式，直接返回 baseColor
      return baseColor;
    }

    let brightness;
    switch(certainty) {
      case 0: brightness = 60; break;   // 低
      case 1: brightness = 80; break;   // 中
      case 2: brightness = 100; break;  // 高
      default: brightness = 80; break;
    }
    return [baseColor[0], baseColor[1], brightness];
  }
};