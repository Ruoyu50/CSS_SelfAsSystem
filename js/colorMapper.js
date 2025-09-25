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
    let saturation = 80;
    if (attrValue.includes('high') || attrValue.includes('positive')) saturation = 90;
    else if (attrValue.includes('medium') || attrValue.includes('neutral')) saturation = 70;
    else if (attrValue.includes('low') || attrValue.includes('negative')) saturation = 50;
    return [hue, saturation, 80]; // [h, s, b]
  },

  applyCertainty(baseColor, certainty) {
    let brightness;
    switch(certainty) {
      case 0: brightness = 45; break;
      case 1: brightness = 70; break;
      case 2: brightness = 95; break;
      default: brightness = 70; break;
    }
    return [baseColor[0], baseColor[1], brightness];
  }
};