import { InformationSociety } from "../models/index.js";
import { deleteFromCloudinary } from "../utils/uploadImagesToCloud.js";

export const getInformationSocietyHandle = async (userId) => {
  try {
    const informationSociety = await InformationSociety.find({ userId });
    return informationSociety;
  } catch (error) {
    throw new Error("Có lỗi xảy ra trong quá trình lấy thông tin xã hội!");
  }
};

export const createInformationSocietyHandle = async (userId, payload) => {
  try {
    const { documentName, pictureDocumentUrls } = payload;

    const informationSociety = new InformationSociety({
      userId,
      documentName,
      pictureDocuments: pictureDocumentUrls,
    });

    const informationSocietyData = await informationSociety.save();
    return informationSocietyData;
  } catch (error) {
    throw new Error("Có lỗi xảy ra trong quá trình thêm thông tin xã hội!");
  }
};

export const updateInformationSocietyHandle = async (
  informationSocietyId,
  payload
) => {
  try {
    const { documentName, pictureDocumentUrls } = payload;
    // Lấy thông tin xã hội hiện tại để lấy ảnh cũ
    const current = await InformationSociety.findById(informationSocietyId);
    if (!current) {
      throw new Error("Không tìm thấy thông tin xã hội để cập nhật");
    }
    // Xóa ảnh cũ nếu có
    // Trích xuất public_id từ ảnh cũ để xóa
    const publicIdsToDelete = current.pictureDocuments.map(
      (image) => image.public_id
    );
    // Tiến hành xóa các ảnh cũ
    const deletedResults = await Promise.all(
      publicIdsToDelete.map((publicId) => deleteFromCloudinary(publicId))
    );
    const anyFailed = deletedResults.some((res) => res.result !== "ok");
    if (anyFailed) {
      throw new Error("Có lỗi xảy ra trong quá trình xóa ảnh cũ");
    }

    const informationSocietyUpdateData = {
      documentName,
      pictureDocuments: pictureDocumentUrls,
    };

    const informationSocietyUpdate = await InformationSociety.findByIdAndUpdate(
      informationSocietyId,
      {
        $set: informationSocietyUpdateData,
      },
      { new: true }
    );
    if (informationSocietyUpdate) {
      return informationSocietyUpdate;
    }
  } catch (error) {
    throw new Error(
      "Có lỗi xảy ra trong quá trình thêm thông tin xã hội!",
      error.message
    );
  }
};

export const removeInformationSocietyHandle = async (informationSocietyId) => {
  try {
    const informationSociety = await InformationSociety.findById(
      informationSocietyId
    );
    if (!informationSociety) {
      throw new Error("Không tìm thấy thông tin xã hội để xóa");
    }
    // Xóa ảnh cũ nếu có
    // Trích xuất public_id từ ảnh cũ để xóa
    const publicIdsToDelete = informationSociety.pictureDocuments.map(
      (image) => image.public_id
    );
    // Tiến hành xóa các ảnh cũ
    const deletedResults = await Promise.all(
      publicIdsToDelete.map((publicId) => deleteFromCloudinary(publicId))
    );
    const anyFailed = deletedResults.some((res) => res.result !== "ok");
    if (anyFailed) {
      throw new Error("Có lỗi xảy ra trong quá trình xóa ảnh cũ");
    }
    await InformationSociety.findByIdAndDelete(informationSocietyId);
    return { succes: true, message: "Xóa thông tin thành công!" };
  } catch (error) {
    throw new Error("Có lỗi xảy ra trong quá trình thêm thông tin xã hội!");
  }
};
