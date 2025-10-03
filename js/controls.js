// js/controls.js
import { DataManager } from './dManager.js';
import { Logger } from './logger.js';

export function setupControls() {
  const fileInput = document.getElementById("fileInput");
  const btnExportJSON = document.getElementById("btnExportJSON");
  const btnExportCSV = document.getElementById("btnExportCSV");

  if (fileInput) {
    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const text = await file.text();
      let records = [];
      if (file.name.endsWith(".json")) {
        records = DataManager.parseJSON(text);
      } else if (file.name.endsWith(".csv")) {
        records = DataManager.parseCSV(text);
      }

      DataManager.importData(records);
    });
  }

  if (btnExportJSON) {
    btnExportJSON.addEventListener("click", () => {
      const blob = new Blob([Logger.exportJSON()], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "interactions.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  if (btnExportCSV) {
    btnExportCSV.addEventListener("click", () => {
      const blob = new Blob([Logger.exportCSV()], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "interactions.csv";
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}