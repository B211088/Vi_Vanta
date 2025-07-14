import {
  createAIModelHandle,
  getAllAIModelsHandle,
  getAIModelByIdHandle,
  updateAIModelHandle,
  deleteAIModelHandle,
  getAllAIModelsUserUseHandle,
} from "../services/aiModel.service.js";

// Tạo model mới
export const createAIModelController = async (req, res) => {
  try {
    const { name, provider } = req.body;
    if (!name || !provider) {
      return res
        .status(400)
        .json({ success: false, message: "Tên và provider là bắt buộc" });
    }
    const aiModel = await createAIModelHandle(req.body);
    res.status(201).json({ success: true, data: aiModel });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Lấy tất cả model
export const getAllAIModelsController = async (req, res) => {
  try {
    const modals = await getAllAIModelsHandle(req.query || {});
    res.status(200).json({ success: true, data: modals });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllAIModelsUserUseController = async (req, res) => {
  try {
    const modals = await getAllAIModelsUserUseHandle();
    res.status(200).json({ success: true, data: modals });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Lấy chi tiết model theo id
export const getAIModelByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });
    }
    const model = await getAIModelByIdHandle(id);
    if (!model) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy model" });
    }
    res.status(200).json({ success: true, data: model });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Cập nhật model
export const updateAIModelController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });
    }
    const updated = await updateAIModelHandle(id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Xóa model
export const deleteAIModelController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res
        .status(400)
        .json({ success: false, message: "ID không hợp lệ" });
    }
    const result = await deleteAIModelHandle(id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
