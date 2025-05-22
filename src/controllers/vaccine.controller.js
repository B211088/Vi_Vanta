import {
  createVaccineHandle,
  getAllVaccinesHandle,
  getVaccineByIdHandle,
  updateVaccineHandle,
  deleteVaccineHandle,
  getVaccinesByCategoryHandle,
} from "../services/vaccine.service.js";
import { uploads } from "../utils/uploadImagesToCloud.js";

// Tạo một vắc-xin mới
export const createVaccine = async (req, res) => {
  try {
    const payload = req.body; // Lấy dữ liệu từ body request
    const userId = req.user.userId; // Lấy userId từ token đã xác thực
    const { images, thumbnail } = req.files;

    // Upload thumbnail lên Cloudinary
    const uploadedThumbnail = await uploads(thumbnail[0], userId, "Vaccines");
    payload.thumbnail = uploadedThumbnail;

    // Upload từng ảnh lên Cloudinary
    const uploadedImages = await Promise.all(
      images.map((image) => uploads(image, userId, "Vaccines"))
    );

    // Gắn URL của ảnh vào payload
    payload.images = uploadedImages;

    const newVaccine = await createVaccineHandle(payload);
    res.status(201).json({
      message: "Tạo vắc-xin thành công!",
      data: newVaccine,
    });
  } catch (error) {
    console.error("Lỗi khi tạo vắc-xin:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả vắc-xin
export const getAllVaccines = async (req, res) => {
  try {
    // Lấy page và limit từ query params
    const { page = 1, limit = 10 } = req.query;
    const result = await getAllVaccinesHandle(Number(page), Number(limit));
    res.status(200).json({
      message: "Lấy danh sách vắc-xin thành công!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một vắc-xin
export const getVaccineById = async (req, res) => {
  try {
    const { vaccineId } = req.params; // Lấy vaccineId từ params
    const vaccine = await getVaccineByIdHandle(vaccineId);
    res.status(200).json({
      message: "Lấy thông tin vắc-xin thành công!",
      data: vaccine,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin vắc-xin
export const updateVaccine = async (req, res) => {
  try {
    const { vaccineId } = req.params; // Lấy vaccineId từ params
    const { images, thumbnail } = req.files;
    const payload = req.body; // Lấy dữ liệu từ body request
    const userId = req.user.userId; // Lấy userId từ token đã xác thực

    // Kiểm tra xem có thumbnail không
    if (thumbnail && thumbnail.length === 0) {
      return res.status(400).json({ message: "Vui lòng thêm ảnh đại diện!" });
    }

    // Kiểm tra xem có images không
    if (!images || images.length === 0) {
      return res.status(400).json({ message: "Vui lòng thêm ảnh!" });
    }
    // Upload từng ảnh lên Cloudinary
    const uploadedThumbnail = await uploads(thumbnail[0], userId, "Vaccines");
    payload.thumbnail = uploadedThumbnail; // Gắn URL của ảnh vào payload
    const uploadedImages = await Promise.all(
      images.map((image) => uploads(image, userId, "Vaccines"))
    );

    // Gắn URL của ảnh vào payload
    payload.images = uploadedImages;
    console.log("Uploaded Images:", uploadedImages);

    const updatedVaccine = await updateVaccineHandle(vaccineId, payload);
    res.status(200).json({
      message: "Cập nhật thông tin vắc-xin thành công!",
      data: updatedVaccine,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật vắc-xin:", error.message);
    res.status(500).json({ message: error.message });
  }
};
// Xóa một vắc-xin
export const deleteVaccine = async (req, res) => {
  try {
    const { vaccineId } = req.params; // Lấy vaccineId từ params
    const result = await deleteVaccineHandle(vaccineId);
    res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách vắc-xin theo loại (category)
export const getVaccinesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params; // Lấy categoryId từ params
    const { page = 1, limit = 10 } = req.query; // Lấy page và limit từ query params
    const result = await getVaccinesByCategoryHandle(
      categoryId,
      Number(page),
      Number(limit)
    );
    res.status(200).json({
      message: "Lấy danh sách vắc-xin theo loại thành công!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
