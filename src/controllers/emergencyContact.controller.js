import {
  createEmergencyContactHandle,
  getEmergencyContactHandle,
  removeEmergencyContactHandle,
  updateEmergencyContactHandle,
} from "../services/emergencyContact.service.js";

export const getEmergencyContact = async (req, res) => {
  try {
    const emergencyContact = await getEmergencyContactHandle(req.user.userId);
    res.status(200).json({ emergencyContact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEmergencyContact = async (req, res) => {
  const { emergencyContactName, emergencyContactPhone } = req.body;
  if (!emergencyContactName) {
    res.status(400).json({ message: "Vui lòng thêm tên liên lạc khẩn cấp!" });
  }
  if (!emergencyContactPhone) {
    res
      .status(400)
      .json({ message: "Vui lòng thêm số điện thoại liên lạc khẩn cấp!" });
  }
  try {
    const emergencyContact = await createEmergencyContactHandle(
      req.user.userId,
      req.body
    );
    res.status(200).json({ emergencyContact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateEmergencyContact = async (req, res) => {
  const { emergencyContactName, emergencyContactPhone } = req.body;
  const emergencyContactId = req.params.id;
  if (!emergencyContactId) {
    res.status(400).json({ message: "Không xác định được liên lạc!" });
  }
  if (!emergencyContactName) {
    res.status(400).json({ message: "Vui lòng thêm tên liên lạc khẩn cấp!" });
  }
  if (!emergencyContactPhone) {
    res
      .status(400)
      .json({ message: "Vui lòng thêm số điện thoại liên lạc khẩn cấp!" });
  }
  try {
    const emergencyContact = await updateEmergencyContactHandle(
      emergencyContactId,
      req.body
    );
    res.status(200).json({ emergencyContact });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeEmergencyContact = async (req, res) => {
  const emergencyContactId = req.params.id;

  if (!emergencyContactId) {
    res.status(400).json({ message: "Không xác định được liên lạc!" });
  }

  try {
    const emergencyContact = await removeEmergencyContactHandle(
      emergencyContactId
    );
    if (emergencyContact.succes) {
      res.status(200).json({ message: emergencyContact.message });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
