import AIModel from "../models/aiModel.model.js";

// Tạo model mới
export const createAIModelHandle = async (payload) => {
  try {
    const aiModel = new AIModel(payload);
    await aiModel.save();
    return aiModel;
  } catch (error) {
    console.error("Lỗi khi tạo AIModel:", error.message);
    throw error;
  }
};

// Lấy tất cả model
export const getAllAIModelsHandle = async (filter = {}) => {
  try {
    return await AIModel.find(filter).select("-__v");
  } catch (error) {
    console.error("Lỗi khi lấy danh sách AIModel:", error.message);
    throw error;
  }
};

// Lấy chi tiết model theo id
export const getAIModelByIdHandle = async (id) => {
  try {
    return await AIModel.findById(id).select("-__v ");
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết AIModel:", error.message);
    throw error;
  }
};

// Cập nhật model
export const updateAIModelHandle = async (id, payload) => {
  try {
    const updated = await AIModel.findByIdAndUpdate(id, payload, {
      new: true,
    }).select("-__v");
    if (!updated) throw new Error("Không tìm thấy AIModel để cập nhật");
    return updated;
  } catch (error) {
    console.error("Lỗi khi cập nhật AIModel:", error.message);
    throw error;
  }
};

// Xóa model
export const deleteAIModelHandle = async (id) => {
  try {
    const deleted = await AIModel.findByIdAndDelete(id);
    if (!deleted) throw new Error("Không tìm thấy AIModel để xóa");
    return { message: "Xóa model thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa AIModel:", error.message);
    throw error;
  }
};
