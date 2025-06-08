export const parseArrayFields = (payload, fields) => {
  fields.forEach((field) => {
    if (payload[field] && typeof payload[field] === "string") {
      try {
        payload[field] = JSON.parse(payload[field]);
      } catch {
        payload[field] = [payload[field]];
      }
    }
  });
};

export const toObjectIdArray = (arr) => {
  if (!arr) return [];
  if (Array.isArray(arr)) return arr;
  if (typeof arr === "string") return [arr];
  return [];
};
