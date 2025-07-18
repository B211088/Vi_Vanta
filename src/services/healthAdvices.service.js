import HealthAdvice from "../models/healthAdvices.model.js";

/**
 * Tạo mới lời khuyên. Nếu đã tồn tại lời khuyên cùng userId và type, sẽ xóa trước.
 */
export const createAdvice = async (data) => {
  try {
    const { userId, type } = data;

    // Xóa lời khuyên cũ cùng userId và type (nếu có)
    await HealthAdvice.deleteMany({ userId, type });

    // Tạo lời khuyên mới
    const advice = new HealthAdvice(data);
    return await advice.save();
  } catch (error) {
    console.error("Lỗi tạo lời khuyên:", error.message);
    throw new Error("Không thể tạo lời khuyên mới");
  }
};

/**
 * Lấy lời khuyên mới nhất theo userId và type
 */
export const getLatestAdviceByUserAndType = async (userId, type) => {
  try {
    return await HealthAdvice.findOne({ userId, type })
      .select("value soure createdAt updatedAt type _id")
      .sort({ createdAt: -1 });
  } catch (error) {
    console.error("Lỗi khi lấy lời khuyên:", error.message);
    throw new Error("Có lỗi khi lấy lời khuyên");
  }
};

/**
 * Lấy tất cả lời khuyên theo userId (nếu có type thì lọc theo type)
 */
export const getAdvicesByUser = async (userId, type = null) => {
  try {
    const filter = { userId };
    if (type) filter.type = type;

    return await HealthAdvice.find(filter).sort({ createdAt: -1 });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách lời khuyên:", error.message);
    throw new Error("Có lỗi khi lấy lời khuyên");
  }
};

/**
 * Lấy lời khuyên theo id
 */
export const getAdviceById = async (id) => {
  try {
    return await HealthAdvice.findById(id);
  } catch (error) {
    console.error("Lỗi khi lấy lời khuyên theo ID:", error.message);
    throw new Error("Có lỗi khi lấy lời khuyên");
  }
};

/**
 * Xóa lời khuyên theo userId và type
 */
export const deleteAdviceByUserAndType = async (userId, type) => {
  try {
    return await HealthAdvice.deleteMany({ userId, type });
  } catch (error) {
    console.error("Lỗi khi xóa lời khuyên:", error.message);
    throw new Error("Không thể xóa lời khuyên");
  }
};
