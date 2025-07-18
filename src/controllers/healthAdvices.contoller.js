import {
  createAdvice,
  deleteAdviceByUserAndType,
  getAdviceById,
  getAdvicesByUser,
  getLatestAdviceByUserAndType,
} from "../services/healthAdvices.service.js";

/**
 * [POST] /api/health-advices
 * Tạo lời khuyên mới
 */
export const createHealthAdvice = async (req, res) => {
  try {
    const advice = await createAdvice(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo lời khuyên thành công",
      data: advice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * [GET] /api/health-advices?userId=xxx&type=yyy
 * Lấy toàn bộ lời khuyên theo userId, có thể kèm type
 */
export const getHealthAdvices = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type } = req.query;

    if (!userId) {
      return res.status(400).json({ success: false, message: "Thiếu userId" });
    }

    const advices = await getAdvicesByUser(userId, type);
    res.status(200).json({
      success: true,
      data: advices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * [GET] /api/health-advices/latest?userId=xxx&type=yyy
 * Lấy lời khuyên mới nhất theo userId và type
 */
export const getLatestHealthAdvice = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log({ userId });
    const { type } = req.query;

    if (!userId || !type) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu userId hoặc type" });
    }

    const advice = await getLatestAdviceByUserAndType(userId, type);
    res.status(200).json({
      success: true,
      data: advice,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * [GET] /api/health-advices/:id
 * Lấy lời khuyên theo ID
 */
export const getHealthAdviceById = async (req, res) => {
  try {
    const advice = await getAdviceById(req.params.id);
    if (!advice) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy lời khuyên" });
    }
    res.status(200).json({ success: true, data: advice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * [DELETE] /api/health-advices?userId=xxx&type=yyy
 * Xóa lời khuyên theo userId và type
 */
export const deleteHealthAdvice = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type } = req.query;

    if (!userId || !type) {
      return res
        .status(400)
        .json({ success: false, message: "Thiếu userId hoặc type" });
    }

    await deleteAdviceByUserAndType(userId, type);
    res.status(200).json({
      success: true,
      message: "Xóa lời khuyên thành công",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
