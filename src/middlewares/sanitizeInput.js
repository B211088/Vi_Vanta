export const sanitizeInputMiddleware = (req, res, next) => {
  const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
  const disallowedCharsRegex = /[<>$%^&*{}[\]`~]/g;

  const errors = [];

  const checkObject = (obj, parentKey = "") => {
    for (const key in obj) {
      const value = obj[key];
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      if (typeof value === "string") {
        if (emojiRegex.test(value)) {
          errors.push(`Trường "${fullKey}" chứa emoji không hợp lệ.`);
        }
        if (disallowedCharsRegex.test(value)) {
          errors.push(`Trường "${fullKey}" chứa ký tự đặc biệt không hợp lệ.`);
        }
      } else if (typeof value === "object" && value !== null) {
        checkObject(value, fullKey); // đệ quy với object lồng
      }
    }
  };

  checkObject(req.body);
  checkObject(req.query);
  checkObject(req.params);

  if (errors.length > 0) {
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ",
      errors,
    });
  }

  next();
};
