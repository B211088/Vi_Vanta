/**
 * Utility functions for generating URL-friendly slugs
 */

/**
 * Chuyển đổi tiếng Việt có dấu thành không dấu
 */
const removeVietnameseTones = (str) => {
  const vietnameseMap = {
    à: "a",
    á: "a",
    ạ: "a",
    ả: "a",
    ã: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ậ: "a",
    ẩ: "a",
    ẫ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ặ: "a",
    ẳ: "a",
    ẵ: "a",
    è: "e",
    é: "e",
    ẹ: "e",
    ẻ: "e",
    ẽ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ệ: "e",
    ể: "e",
    ễ: "e",
    ì: "i",
    í: "i",
    ị: "i",
    ỉ: "i",
    ĩ: "i",
    ò: "o",
    ó: "o",
    ọ: "o",
    ỏ: "o",
    õ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ộ: "o",
    ổ: "o",
    ỗ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ợ: "o",
    ở: "o",
    ỡ: "o",
    ù: "u",
    ú: "u",
    ụ: "u",
    ủ: "u",
    ũ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ự: "u",
    ử: "u",
    ữ: "u",
    ỳ: "y",
    ý: "y",
    ỵ: "y",
    ỷ: "y",
    ỹ: "y",
    đ: "d",
    À: "A",
    Á: "A",
    Ạ: "A",
    Ả: "A",
    Ã: "A",
    Â: "A",
    Ầ: "A",
    Ấ: "A",
    Ậ: "A",
    Ẩ: "A",
    Ẫ: "A",
    Ă: "A",
    Ằ: "A",
    Ắ: "A",
    Ặ: "A",
    Ẳ: "A",
    Ẵ: "A",
    È: "E",
    É: "E",
    Ẹ: "E",
    Ẻ: "E",
    Ẽ: "E",
    Ê: "E",
    Ề: "E",
    Ế: "E",
    Ệ: "E",
    Ể: "E",
    Ễ: "E",
    Ì: "I",
    Í: "I",
    Ị: "I",
    Ỉ: "I",
    Ĩ: "I",
    Ò: "O",
    Ó: "O",
    Ọ: "O",
    Ỏ: "O",
    Õ: "O",
    Ô: "O",
    Ồ: "O",
    Ố: "O",
    Ộ: "O",
    Ổ: "O",
    Ỗ: "O",
    Ơ: "O",
    Ờ: "O",
    Ớ: "O",
    Ợ: "O",
    Ở: "O",
    Ỡ: "O",
    Ù: "U",
    Ú: "U",
    Ụ: "U",
    Ủ: "U",
    Ũ: "U",
    Ư: "U",
    Ừ: "U",
    Ứ: "U",
    Ự: "U",
    Ử: "U",
    Ữ: "U",
    Ỳ: "Y",
    Ý: "Y",
    Ỵ: "Y",
    Ỷ: "Y",
    Ỹ: "Y",
    Đ: "D",
  };

  return str.replace(
    /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/g,
    (char) => {
      return vietnameseMap[char] || char;
    }
  );
};

/**
 * Tạo slug từ text
 */
export const generateSlug = (text) => {
  if (!text) return "";

  return removeVietnameseTones(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Loại bỏ ký tự đặc biệt
    .replace(/\s+/g, "-") // Thay thế khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, "-") // Loại bỏ dấu gạch ngang liên tiếp
    .replace(/^-|-$/g, ""); // Loại bỏ dấu gạch ngang ở đầu và cuối
};

/**
 * Validate slug format
 */
export const isValidSlug = (slug) => {
  if (!slug || typeof slug !== "string") return false;

  // Slug chỉ chứa chữ cái thường, số và dấu gạch ngang
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 100;
};

/**
 * Tạo slug ngẫu nhiên
 */
export const generateRandomSlug = (prefix = "") => {
  const randomString = Math.random().toString(36).substring(2, 8);
  const timestamp = Date.now().toString(36);

  return prefix
    ? `${prefix}-${randomString}-${timestamp}`
    : `${randomString}-${timestamp}`;
};

/**
 * Cải thiện slug cho SEO
 */
export const optimizeSlugForSEO = (slug, maxLength = 60) => {
  if (!slug) return "";

  // Cắt ngắn slug nếu quá dài
  if (slug.length > maxLength) {
    // Tìm dấu gạch ngang gần nhất với độ dài tối đa
    const cutPoint = slug.lastIndexOf("-", maxLength);
    slug =
      cutPoint > maxLength * 0.7
        ? slug.substring(0, cutPoint)
        : slug.substring(0, maxLength);
  }

  // Loại bỏ dấu gạch ngang ở cuối nếu có
  return slug.replace(/-+$/, "");
};

/**
 * Chuyển đổi slug thành title dạng readable
 */
export const slugToTitle = (slug) => {
  if (!slug) return "";

  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Kiểm tra slug có phù hợp với tiêu đề không
 */
export const isSlugMatchTitle = (slug, title) => {
  if (!slug || !title) return false;

  const generatedSlug = generateSlug(title);
  return slug === generatedSlug || slug.startsWith(generatedSlug);
};

export default {
  generateSlug,
  isValidSlug,
  generateRandomSlug,
  optimizeSlugForSEO,
  slugToTitle,
  isSlugMatchTitle,
  removeVietnameseTones,
};
