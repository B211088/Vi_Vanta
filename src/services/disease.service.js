import {
  Disease,
  Cause,
  Treatment,
  Symptom,
  Prevention,
  DiseaseCategory,
} from "../models/index.js";
import { deleteFromCloudinary } from "../utils/uploadImagesToCloud.js";

// Tạo một bệnh mới
export const createDiseaseHandle = async (payload) => {
  try {
    const {
      causes,
      treatments,
      symptoms,
      prevention,
      relatedDiseases,
      category,
    } = payload;

    // Kiểm tra và lấy ID từ các model liên quan
    const causeIds = await Cause.find({ _id: { $in: causes } }).select("_id");
    const treatmentIds = await Treatment.find({
      _id: { $in: treatments },
    }).select("_id");
    const symptomIds = await Symptom.find({ _id: { $in: symptoms } }).select(
      "_id"
    );
    const preventionIds = await Prevention.find({
      _id: { $in: prevention },
    }).select("_id");
    const relatedDiseaseIds = await Disease.find({
      _id: { $in: relatedDiseases },
    }).select("_id");
    const categoryId = await DiseaseCategory.findById({
      _id: { $in: category },
    }).select("_id");

    // Tạo bệnh mới
    const newDisease = new Disease({
      ...payload,
      causes: causeIds.map((cause) => cause._id),
      treatments: treatmentIds.map((treatment) => treatment._id),
      symptoms: symptomIds.map((symptom) => symptom._id),
      prevention: preventionIds.map((prevention) => prevention._id),
      relatedDiseases: relatedDiseaseIds.map((disease) => disease._id),
      category: categoryId.map((cat) => cat._id),
    });

    await newDisease.save();
    return newDisease;
  } catch (error) {
    console.error("Lỗi khi tạo bệnh:", error.message);
    throw new Error("Lỗi khi tạo bệnh");
  }
};

// Lấy danh sách tất cả các bệnh
export const getAllDiseasesHandle = async (page, limit) => {
  try {
    // Tính toán skip và limit cho phân trang
    const skip = (page - 1) * limit;

    // Lấy danh sách bệnh với phân trang và chỉ lấy các trường cần thiết
    const diseases = await Disease.find()
      .select("name scientificName thumbnail description category isActive")
      .skip(skip)
      .limit(limit);

    // Đếm tổng số bệnh để trả về tổng số trang
    const totalDiseases = await Disease.countDocuments();
    const totalPages = Math.ceil(totalDiseases / limit);

    return {
      diseases,
      pagination: {
        currentPage: page,
        totalPages,
        totalDiseases,
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bệnh:", error.message);
    throw new Error("Lỗi khi lấy danh sách bệnh");
  }
};

// Lấy danh sách tất cả các bệnh
export const getAllDiseasesActiveHandle = async (page, limit) => {
  try {
    // Tính toán skip và limit cho phân trang
    const skip = (page - 1) * limit;

    // Lấy danh sách bệnh với phân trang và chỉ lấy các trường cần thiết
    const diseases = await Disease.find({ isActive: true })
      .select("name scientificName thumbnail description category ") // Chỉ lấy các trường cần thiết
      .skip(skip)
      .limit(limit);

    // Đếm tổng số bệnh để trả về tổng số trang
    const totalDiseases = await Disease.countDocuments();
    const totalPages = Math.ceil(totalDiseases / limit);

    return {
      diseases,
      pagination: {
        currentPage: page,
        totalPages,
        totalDiseases,
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bệnh:", error.message);
    throw new Error("Lỗi khi lấy danh sách bệnh");
  }
};

// Lấy danh sách bệnh theo danh mục (DiseaseCategory)
export const getDiseasesByCategoryHandle = async (
  categoryId,
  page = 1,
  limit = 10
) => {
  try {
    const skip = (page - 1) * limit;

    // Lấy danh sách bệnh theo categoryId với phân trang
    const diseases = await Disease.find({ category: categoryId })
      .select("name scientificName thumbnail description category")
      .populate("category", "name description")
      .skip(skip)
      .limit(limit);

    // Đếm tổng số bệnh trong danh mục
    const totalDiseases = await Disease.countDocuments({
      category: categoryId,
    });
    const totalPages = Math.ceil(totalDiseases / limit);

    return {
      diseases,
      pagination: {
        currentPage: page,
        totalPages,
        totalDiseases,
      },
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bệnh theo danh mục:", error.message);
    throw new Error("Lỗi khi lấy danh sách bệnh theo danh mục");
  }
};

// Lấy thông tin chi tiết một bệnh
export const getDiseaseByIdHandle = async (diseaseId) => {
  try {
    const disease = await Disease.findById(diseaseId)
      .populate("causes", "name description")
      .populate("treatments", "name description")
      .populate("symptoms", "name description")
      .populate("preventions", "name description")
      .populate("relatedDiseases", "name scientificName")
      .populate("category", "name description")
      .select("-__v -createdAt -updatedAt");

    if (!disease) {
      throw new Error("Không tìm thấy bệnh");
    }

    return disease;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin bệnh:", error.message);
    throw new Error("Lỗi khi lấy thông tin bệnh");
  }
};

// Cập nhật thông tin bệnh
export const updateDiseaseHandle = async (diseaseId, payload) => {
  try {
    const {
      causes,
      treatments,
      symptoms,
      prevention,
      relatedDiseases,
      category,
      images,
      thumbnail, // Thêm thumbnail vào payload
      detailedArticle,
    } = payload;

    // Kiểm tra và lấy ID từ các model liên quan
    const causeIds = causes
      ? await Cause.find({ _id: { $in: causes } }).select("_id")
      : [];
    const treatmentIds = treatments
      ? await Treatment.find({ _id: { $in: treatments } }).select("_id")
      : [];
    const symptomIds = symptoms
      ? await Symptom.find({ _id: { $in: symptoms } }).select("_id")
      : [];
    const preventionIds = prevention
      ? await Prevention.find({ _id: { $in: prevention } }).select("_id")
      : [];
    const relatedDiseaseIds = relatedDiseases
      ? await Disease.find({ _id: { $in: relatedDiseases } }).select("_id")
      : [];
    const categoryId = category
      ? await DiseaseCategory.find({ _id: { $in: category } }).select("_id")
      : [];

    const existingDisease = await Disease.findById(diseaseId);
    if (!existingDisease) {
      throw new Error("Không tìm thấy bệnh để cập nhật");
    }

    // Xóa ảnh thumbnail cũ trên Cloudinary nếu có thumbnail mới
    if (thumbnail && existingDisease.thumbnail) {
      try {
        const result = await deleteFromCloudinary(
          existingDisease.thumbnail.public_id
        );
        if (result.result !== "ok") {
          console.warn(
            `Không thể xóa ảnh thumbnail với public_id: ${existingDisease.thumbnail.public_id}`
          );
        }
      } catch (error) {
        console.error(
          `Lỗi khi xóa ảnh thumbnail với public_id: ${existingDisease.thumbnail.public_id}`,
          error
        );
      }
    }

    // Xóa ảnh cũ trên Cloudinary nếu có ảnh mới
    if (existingDisease.images && existingDisease.images.length > 0) {
      await Promise.all(
        existingDisease.images.map(async (image) => {
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
      images && images.length > 0 ? images : existingDisease.images;

    // Cập nhật bệnh
    const updatedDisease = await Disease.findByIdAndUpdate(
      diseaseId,
      {
        ...payload,
        causes: causeIds.length
          ? causeIds.map((cause) => cause._id)
          : existingDisease.causes,
        treatments: treatmentIds.length
          ? treatmentIds.map((treatment) => treatment._id)
          : existingDisease.treatments,
        symptoms: symptomIds.length
          ? symptomIds.map((symptom) => symptom._id)
          : existingDisease.symptoms,
        prevention: preventionIds.length
          ? preventionIds.map((prevention) => prevention._id)
          : existingDisease.prevention,
        relatedDiseases: relatedDiseaseIds.length
          ? relatedDiseaseIds.map((disease) => disease._id)
          : existingDisease.relatedDiseases,
        category: categoryId ? categoryId._id : existingDisease.category,
        images: updatedImages, // Cập nhật ảnh mới nếu có
        thumbnail: thumbnail || existingDisease.thumbnail, // Cập nhật thumbnail mới nếu có
        detailedArticle: detailedArticle || existingDisease.detailedArticle, // Cập nhật bài viết chi tiết nếu có
      },
      { new: true }
    )
      .populate("causes", "name description")
      .populate("treatments", "name description")
      .populate("symptoms", "name description")
      .populate("preventions", "name description")
      .populate("relatedDiseases", "name scientificName")
      .populate("category", "name description")
      .select("-__v -createdAt -updatedAt");

    return updatedDisease;
  } catch (error) {
    console.error("Lỗi khi cập nhật bệnh:", error.message);
    throw new Error("Lỗi khi cập nhật bệnh");
  }
};

//chuyển trạng thái của bênh
export const toggleDiseaseActiveHandle = async (diseaseId, isActive) => {
  try {
    if (typeof isActive !== "boolean") {
      throw new Error("Giá trị isActive phải là true hoặc false");
    }

    const disease = await Disease.findByIdAndUpdate(
      diseaseId,
      { isActive },
      { new: true }
    );

    if (!disease) {
      throw new Error("Không tìm thấy bệnh để cập nhật trạng thái");
    }

    return disease;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái bệnh:", error.message);
    throw new Error("Lỗi khi cập nhật trạng thái bệnh");
  }
};
// Xóa một bệnh
export const deleteDiseaseHandle = async (diseaseId) => {
  try {
    // Lấy thông tin bệnh hiện tại
    const existingDisease = await Disease.findById(diseaseId);
    if (!existingDisease) {
      throw new Error("Không tìm thấy bệnh để xóa");
    }

    // Xóa ảnh thumbnail trên Cloudinary nếu có
    if (existingDisease.thumbnail) {
      try {
        const result = await deleteFromCloudinary(
          existingDisease.thumbnail.public_id
        );
        if (result.result !== "ok") {
          console.warn(
            `Không thể xóa ảnh thumbnail với public_id: ${existingDisease.thumbnail.public_id}`
          );
        }
      } catch (error) {
        console.error(
          `Lỗi khi xóa ảnh thumbnail với public_id: ${existingDisease.thumbnail.public_id}`,
          error
        );
      }
    }

    // Xóa ảnh trên Cloudinary nếu có
    if (existingDisease.images && existingDisease.images.length > 0) {
      await Promise.all(
        existingDisease.images.map(async (image) => {
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

    // Xóa bệnh khỏi cơ sở dữ liệu
    const deletedDisease = await Disease.findByIdAndDelete(diseaseId);
    if (!deletedDisease) {
      throw new Error("Không tìm thấy bệnh để xóa");
    }

    return { message: "Xóa bệnh thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa bệnh:", error.message);
    throw new Error("Lỗi khi xóa bệnh");
  }
};

// Tìm kiếm bệnh theo tên, tên khoa học, mã ICD hoặc mô tả
export const searchDiseasesHandle = async (query, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    // Sử dụng text index để tìm kiếm toàn văn
    const searchQuery = query
      ? {
          $text: { $search: query },
        }
      : {};

    const [diseases, total] = await Promise.all([
      Disease.find(searchQuery)
        .select(
          "_id name scientificName icd10Code thumbnail riskLevel isActive"
        )
        .skip(skip)
        .limit(limit),
      Disease.countDocuments(searchQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      diseases,
      pagination: {
        currentPage: page,
        totalPages,
        totalDiseases: total,
      },
    };
  } catch (error) {
    console.error("Lỗi khi tìm kiếm bệnh:", error.message);
    throw new Error("Lỗi khi tìm kiếm bệnh");
  }
};

// Tìm kiếm bệnh theo tên, tên khoa học, mã ICD hoặc mô tả
export const searchDiseasesActiveHandle = async (
  query,
  page = 1,
  limit = 10
) => {
  try {
    const skip = (page - 1) * limit;

    // Sử dụng text index để tìm kiếm toàn văn
    const searchQuery = query
      ? {
          $and: [{ isActive: true }, { $text: { $search: query } }],
        }
      : { isActive: true };

    const [diseases, total] = await Promise.all([
      Disease.find(searchQuery)
        .select("_id name scientificName icd10Code thumbnail riskLevel ")
        .skip(skip)
        .limit(limit),
      Disease.countDocuments(searchQuery),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      diseases,
      pagination: {
        currentPage: page,
        totalPages,
        totalDiseases: total,
      },
    };
  } catch (error) {
    console.error("Lỗi khi tìm kiếm bệnh:", error.message);
    throw new Error("Lỗi khi tìm kiếm bệnh");
  }
};
