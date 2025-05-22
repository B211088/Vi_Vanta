import Vaccine from "../models/vaccine.model.js";
import { deleteFromCloudinary } from "../utils/uploadImagesToCloud.js";

// Tạo một vắc-xin mới
export const createVaccineHandle = async (payload) => {
  try {
    const newVaccine = new Vaccine(payload);
    await newVaccine.save();
    return newVaccine;
  } catch (error) {
    console.error("Lỗi khi tạo vắc-xin:", error.message);
    throw new Error("Lỗi khi tạo vắc-xin");
  }
};

// Lấy danh sách tất cả vắc-xin
export const getAllVaccinesHandle = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const vaccines = await Vaccine.find()
      .select("name  description  storageTemperature  thumbnail isActive")
      .populate({ path: "targetDiseases", select: "name" })
      .skip(skip)
      .limit(limit);

    const totalVaccines = await Vaccine.countDocuments();
    const totalPages = Math.ceil(totalVaccines / limit);

    return {
      vaccines,
      pagination: {
        currentPage: page,
        totalPages,
        totalVaccines,
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách vắc-xin:", error.message);
    throw new Error("Lỗi khi lấy danh sách vắc-xin");
  }
};

// Lấy danh sách vắc-xin theo loại (category)
export const getVaccinesByCategoryHandle = async (
  categoryId,
  page = 1,
  limit = 10
) => {
  try {
    const skip = (page - 1) * limit;

    // Lấy danh sách vắc-xin theo categoryId với phân trang
    const vaccines = await Vaccine.find({ categoryId })
      .select(
        "name manufacturer description dosesRequired storageTemperature targetDiseases  thumbnail images isActive"
      )
      .skip(skip)
      .limit(limit);

    // Đếm tổng số vắc-xin trong danh mục
    const totalVaccines = await Vaccine.countDocuments({
      category: categoryId,
    });
    const totalPages = Math.ceil(totalVaccines / limit);

    return {
      vaccines,
      pagination: {
        currentPage: page,
        totalPages,
        totalVaccines,
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách vắc-xin theo loại:", error.message);
    throw new Error("Lỗi khi lấy danh sách vắc-xin theo loại");
  }
};

// Lấy thông tin chi tiết một vắc-xin
export const getVaccineByIdHandle = async (vaccineId) => {
  try {
    const vaccine = await Vaccine.findById(vaccineId)
      .populate({
        path: "targetDiseases",
        select: "name scientificName icd10Code",
      })
      .select("-__v -createdAt -updatedAt");
    if (!vaccine) {
      throw new Error("Không tìm thấy vắc-xin");
    }
    return vaccine;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin vắc-xin:", error.message);
    throw new Error("Lỗi khi lấy thông tin vắc-xin");
  }
};

// Cập nhật thông tin vắc-xin
export const updateVaccineHandle = async (vaccineId, payload) => {
  try {
    // Lấy thông tin vắc-xin hiện tại
    const currentVaccine = await Vaccine.findById(vaccineId);
    if (!currentVaccine) {
      throw new Error("Không tìm thấy vắc-xin để cập nhật");
    }

    // Xóa ảnh thumbnail cũ trên Cloudinary nếu có thumbnail mới
    if (payload.thumbnail && currentVaccine.thumbnail) {
      try {
        const result = await deleteFromCloudinary(
          currentVaccine.thumbnail.public_id
        );
        if (result.result !== "ok") {
          console.warn(
            `Không thể xóa ảnh thumbnail với public_id: ${currentVaccine.thumbnail.public_id}`
          );
        }
      } catch (error) {
        console.error(
          `Lỗi khi xóa ảnh thumbnail với public_id: ${currentVaccine.thumbnail.public_id}`,
          error
        );
      }
    }

    // Xóa ảnh cũ trên Cloudinary nếu có ảnh mới
    if (
      payload.images &&
      payload.images.length > 0 &&
      currentVaccine.images.length > 0
    ) {
      await Promise.all(
        currentVaccine.images.map(async (image) => {
          try {
            const result = await deleteFromCloudinary(image.public_id);
            if (result.result !== "ok") {
              console.warn(
                `Không thể xóa ảnh với public_id: ${image.public_id}`
              );
            }
          } catch (error) {
            console.error(
              `Lỗi khi xóa ảnh với public_id: ${image.public_id}`,
              error
            );
          }
        })
      );
    }

    // Nếu không có ảnh mới, giữ nguyên ảnh cũ
    const updatedImages =
      payload.images && payload.images.length > 0
        ? payload.images
        : currentVaccine.images;

    // Cập nhật vắc-xin
    const updatedVaccine = await Vaccine.findByIdAndUpdate(
      vaccineId,
      {
        ...payload,
        images: updatedImages,
        thumbnail: payload.thumbnail || currentVaccine.thumbnail,
      },
      { new: true }
    ).select("-__v -createdAt -updatedAt");

    if (!updatedVaccine) {
      throw new Error("Không thể cập nhật vắc-xin");
    }

    return updatedVaccine;
  } catch (error) {
    console.error("Lỗi khi cập nhật vắc-xin:", error.message);
    throw new Error("Lỗi khi cập nhật vắc-xin");
  }
};

// Xóa một vắc-xin
export const deleteVaccineHandle = async (vaccineId) => {
  try {
    // Lấy thông tin vắc-xin để lấy danh sách ảnh
    const vaccine = await Vaccine.findById(vaccineId);
    if (!vaccine) {
      throw new Error("Không tìm thấy vắc-xin để xóa");
    }

    // Xóa ảnh thumbnail trên Cloudinary nếu có
    if (vaccine.thumbnail) {
      try {
        const result = await deleteFromCloudinary(vaccine.thumbnail.public_id);
        if (result.result !== "ok") {
          console.warn(
            `Không thể xóa ảnh thumbnail với public_id: ${vaccine.thumbnail.public_id}`
          );
        }
      } catch (error) {
        console.error(
          `Lỗi khi xóa ảnh thumbnail với public_id: ${vaccine.thumbnail.public_id}`,
          error
        );
      }
    }

    // Xóa ảnh liên quan nếu có
    if (vaccine.images && vaccine.images.length > 0) {
      await Promise.all(
        vaccine.images.map(async (image) => {
          try {
            const result = await deleteFromCloudinary(image.public_id);
            if (result.result !== "ok") {
              console.warn(
                `Không thể xóa ảnh với public_id: ${image.public_id}`
              );
            }
          } catch (error) {
            console.error(
              `Lỗi khi xóa ảnh với public_id: ${image.public_id}`,
              error
            );
          }
        })
      );
    }

    // Xóa vắc-xin khỏi cơ sở dữ liệu
    const deletedVaccine = await Vaccine.findByIdAndDelete(vaccineId);
    if (!deletedVaccine) {
      throw new Error("Không thể xóa vắc-xin");
    }

    return { message: "Xóa vắc-xin thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa vắc-xin:", error.message);
    throw new Error("Lỗi khi xóa vắc-xin");
  }
};
