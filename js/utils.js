export const ATTRIBUTES = [
  "Energy",
  "Emotion",
  "Attention",
  "Motivation",
  "Engagement",
  "Meaning"
];

export function validateRecord(record) {
  // Basic required top-level fields
  if (!record || typeof record !== 'object') {
    console.warn('记录不是对象:', record);
    return false;
  }

  if (!('date' in record) || !('time' in record)) {
    console.warn('记录缺少 date 或 time 字段:', record);
    return false;
  }

  // Ensure each attribute key exists
  const missingAttrs = ATTRIBUTES.filter(a => !(a in record));
  if (missingAttrs.length > 0) {
    console.warn('记录缺少属性键:', missingAttrs, '记录:', record);
    return false;
  }

  // Check whether we have a global certainty or per-attribute certainty for all attributes
  const hasGlobalCertainty = ('certainty' in record) && (typeof record.certainty === 'number');

  const attrsHaveCertainty = ATTRIBUTES.every(name => {
    const v = record[name];
    if (v && typeof v === 'object') {
      return ('value' in v) && ('certainty' in v) && (typeof v.certainty === 'number');
    }
    // if it's a plain string (old format), it doesn't provide attribute-level certainty
    return false;
  });

  if (!hasGlobalCertainty && !attrsHaveCertainty) {
    console.warn('既没有全局 certainty，也没有为所有属性提供属性级certainty，请确保数据包含全局 certainty 或者每个属性都包含 {value, certainty} :', record);
    return false;
  }

  // If attribute objects exist, ensure their value is string and certainty in 0..2
  for (const name of ATTRIBUTES) {
    const v = record[name];
    if (v && typeof v === 'object') {
      if (typeof v.value !== 'string') {
        console.warn('属性', name, '的 value 不是字符串:', v);
        return false;
      }
      if (typeof v.certainty !== 'number' || v.certainty < 0 || v.certainty > 2) {
        console.warn('属性', name, '的 certainty 不是 0/1/2:', v);
        return false;
      }
    } else if (typeof v === 'string') {
      // ok in old format
    } else {
      console.warn('属性', name, '的格式不正确（既不是字符串也不是对象）:', v);
      return false;
    }
  }

  return true;
}

export function validateDataArray(dataArray) {
  if (!Array.isArray(dataArray)) {
    console.error('数据不是数组:', dataArray);
    return false;
  }
  return dataArray.every(validateRecord);
}