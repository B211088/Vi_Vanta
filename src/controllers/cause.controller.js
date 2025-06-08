// Tạo một nguyên nhân mới
export const createCause = async (req, res) => {
  try {
    const payload = req.body;
    const images = req.files;

    if (!payload) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }
    if (!images || images.length === 0) {
      return res.status(400).json({ message: "Vui lòng thêm ảnh!" });
    }

    const imagesUrl = await Promise.all(
      images.map((file) => uploads(file, req.user.userId, "Cause"))
    );

    payload.images = imagesUrl;

    const newCause = await createCauseHandle(payload);
    res.status(201).json({
      message: "Tạo nguyên nhân thành công!",
      cause: newCause,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
