// js/dataManager.js
import { validateDataArray } from './utils.js';
import { Hexagon } from './hexagon.js';
import { ColorMapper } from './colorMapper.js';
import { Logger } from './logger.js';

export const DataManager = {
  parseCSV(text) {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());
    const records = lines.slice(1).map(line => {
      const cols = line.split(",");
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = cols[i];
      });
      return obj;
    });
    return records;
  },

  parseJSON(text) {
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("JSON 解析失败:", err);
      return [];
    }
  },

  importData(records) {
    if (!validateDataArray(records)) {
      console.error("导入数据验证失败！");
      return;
    }

    // 清空
    window.hexagons = [];
    Logger.clear();

    records.forEach((data) => {
      const x = random(100, width - 100);
      const y = random(100, height - 100);
      const r = 50;
      const hex = new Hexagon(x, y, r, data, ColorMapper);
      window.hexagons.push(hex);
    });

    console.log(`成功导入 ${records.length} 条数据`);
    const status = document.getElementById("status");
    if (status) status.textContent = `✅ 成功导入 ${records.length} 条数据`;
  }
};