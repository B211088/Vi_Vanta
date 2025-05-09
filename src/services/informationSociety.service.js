import { InformationSociety } from "../models/index.js";

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
    const informationSocietyUpdateData = {
      documentName,
      pictureDocuments: pictureDocumentUrls,
    };

    const informationSocietyUpdate = await InformationSociety.findByIdAndUpdate(
      { _id: informationSocietyId },
      {
        $set: informationSocietyUpdateData,
      },
      { new: true }
    );
    if (informationSocietyUpdate) {
      return informationSocietyUpdate;
    }
  } catch (error) {
    throw new Error("Có lỗi xảy ra trong quá trình thêm thông tin xã hội!");
  }
};

export const removeInformationSocietyHandle = async (informationSocietyId) => {
  try {
    await InformationSociety.findByIdAndDelete({ _id: informationSocietyId });
    return { succes: true, message: "Xóa thông tin thành công!" };
  } catch (error) {
    throw new Error("Có lỗi xảy ra trong quá trình thêm thông tin xã hội!");
  }
};
