export function validateRecord(record) {
  const requiredFields = [
    "date",
    "time",
    "certainty",
    "Energy",
    "Emotion",
    "Attention",
    "Motivation",
    "Engagement",
    "Meaning"
  ];

  const missing = requiredFields.filter(field => !(field in record));
  if (missing.length > 0) {
    console.warn("记录缺少字段:", missing, "记录内容:", record);
    return false;
  }
  return true;
}

export function validateDataArray(dataArray) {
  if (!Array.isArray(dataArray)) {
    console.error("数据不是数组:", dataArray);
    return false;
  }
  return dataArray.every(validateRecord);
}