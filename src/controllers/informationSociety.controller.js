import {
  createInformationSocietyHandle,
  getInformationSocietyHandle,
  removeInformationSocietyHandle,
  updateInformationSocietyHandle,
  uploadpictureDocumentToCloudinary,
} from "../services/informationSociety.service.js";

export const getInformationSociety = async (req, res) => {
  try {
    const informationSociety = await getInformationSocietyHandle(
      req.user.userId
    );
    res.status(200).json({ informationSociety });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createInformationSociety = async (req, res) => {
  try {
    const userId = req.user.userId;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Vui lòng thêm ảnh!" });
    }

    const pictureDocumentUrls = await Promise.all(
      files.map((file) => uploadpictureDocumentToCloudinary(file, userId))
    );

    const createdInfo = await createInformationSocietyHandle(userId, {
      documentName: req.body.documentName,
      pictureDocumentUrls,
    });

    res
      .status(200)
      .json({ message: "Thêm thông tin thành công!", createdInfo });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateInformationSociety = async (req, res) => {
  try {
    const userId = req.user.userId;
    const files = req.files;

    const pictureDocumentUrls = await Promise.all(
      files.map((file) => uploadpictureDocumentToCloudinary(file, userId))
    );

    const updateInformation = await updateInformationSocietyHandle(
      req.params.id,
      { documentName: req.body.documentName, pictureDocumentUrls }
    );
    if (updateInformation) {
      res
        .status(200)
        .json({ message: "Thay đổi thông tin thành công", updateInformation });
    }
    res.status(401).json({
      message: "Thay đổi thông tin không thành công thành công",
      updateInformation,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeInformationSociety = async (req, res) => {
  try {
    const removeInformation = await removeInformationSocietyHandle(
      req.params.id
    );
    if (removeInformation.succes) {
      res.status(200).json({ message: removeInformation.message });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
