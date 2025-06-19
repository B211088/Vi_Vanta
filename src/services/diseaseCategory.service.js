import DiseaseCategory from "../models/diseaseCategory.model.js";

// Tạo một danh mục bệnh mới
export const createDiseaseCategoryHandle = async (payload) => {
  try {
    const newCategory = new DiseaseCategory(payload);
    await newCategory.save();
    const category = await DiseaseCategory.findById(newCategory._id)
      .populate("createdBy", "_id fullName")
      .populate("updatedBy", "_id fullName");
    return category;
  } catch (error) {
    console.error("Lỗi khi tạo danh mục bệnh:", error.message);
    throw new Error("Lỗi khi tạo danh mục bệnh");
  }
};

// Lấy danh sách tất cả danh mục bệnh
export const getAllDiseaseCategoriesHandle = async (page, limit) => {
  try {
    const skip = (page - 1) * limit;
    const categories = await DiseaseCategory.find({
      deleted: false,
      parent: null,
    })
      .populate("createdBy", "_id fullName")
      .populate("updatedBy", "_id fullName")
      .select("-__v ")
      .skip(skip)
      .limit(limit);

    // Chuyển sang array thường để dễ thao tác
    const plainCategories = categories.map((cat) => cat.toObject());

    // Kiểm tra từng category có con không
    for (let category of plainCategories) {
      const children = await DiseaseCategory.find({ parent: category._id });
      if (children.length > 0) {
        category.hasChildren = true;
      } else {
        category.hasChildren = false;
      }
    }

    const totalCategories = await DiseaseCategory.countDocuments({
      deleted: false,
      parent: null,
    });
    const totalPages = Math.ceil(totalCategories / limit);
    return {
      categories: plainCategories,
      pagination: { currentPage: page, totalPages, totalCategories },
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách danh mục bệnh:", error.message);
    throw new Error("Lỗi khi lấy danh sách danh mục bệnh");
  }
};

// Lấy thông tin chi tiết một danh mục bệnh
export const getDiseaseCategoryByIdHandle = async (categoryId) => {
  try {
    const category = await DiseaseCategory.findById(categoryId)
      .select("-__v -createdAt -updatedAt")
      .populate("parent", "_id name");
    if (!category) {
      throw new Error("Không tìm thấy danh mục bệnh");
    }
    return category;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin danh mục bệnh:", error.message);
    throw new Error("Lỗi khi lấy thông tin danh mục bệnh");
  }
};

export const getChildrenDiseaseCategoriesHandle = async (
  categoryId,
  page,
  limit
) => {
  try {
    const skip = (page - 1) * limit;
    const categories = await DiseaseCategory.find({ parent: categoryId })
      .populate("createdBy", "_id fullName")
      .populate("updatedBy", "_id fullName")
      .select("-__v ")
      .skip(skip)
      .limit(limit);

    // Chuyển sang array thường để dễ thao tác
    const plainCategories = categories.map((cat) => cat.toObject());

    // Kiểm tra từng category có con không
    for (let category of plainCategories) {
      const children = await DiseaseCategory.find({ parent: category._id });
      category.hasChildren = children.length > 0;
    }

    const totalCategories = await DiseaseCategory.countDocuments({
      parent: categoryId,
    });
    const totalPages = Math.ceil(totalCategories / limit);
    return {
      categories: plainCategories,
      pagination: { currentPage: page, totalPages, totalCategories },
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách danh mục bệnh con:", error.message);
    throw new Error("Lỗi khi lấy danh sách danh mục bệnh con");
  }
};

// Cập nhật danh mục bệnh
export const updateDiseaseCategoryHandle = async (categoryId, payload) => {
  try {
    const updatedCategory = await DiseaseCategory.findByIdAndUpdate(
      categoryId,
      { $set: payload },
      { new: true }
    ).select("-__v -createdAt -updatedAt");

    if (!updatedCategory) {
      throw new Error("Không tìm thấy danh mục bệnh để cập nhật");
    }

    return updatedCategory;
  } catch (error) {
    console.error("Lỗi khi cập nhật danh mục bệnh:", error.message);
    throw new Error("Lỗi khi cập nhật danh mục bệnh");
  }
};

// Xóa một danh mục bệnh
export const deleteDiseaseCategoryHandle = async (categoryId) => {
  try {
    // Kiểm tra có phân loại con không
    const children = await DiseaseCategory.find({ parent: categoryId });
    if (children.length > 0) {
      // Nếu có con, không cho xóa
      throw new Error("Không thể xóa vì phân loại này đang có phân loại con!");
    }

    // Thực hiện xóa
    const deletedCategory = await DiseaseCategory.findByIdAndDelete(categoryId);
    if (!deletedCategory) {
      throw new Error("Không tìm thấy danh mục bệnh để xóa");
    }

    return { message: "Xóa danh mục bệnh thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa danh mục bệnh:", error.message);
    throw new Error(error.message || "Lỗi khi xóa danh mục bệnh");
  }
};
