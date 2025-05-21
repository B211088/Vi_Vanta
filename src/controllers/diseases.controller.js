import {
  createDiseaseHandle,
  getAllDiseasesHandle,
  getDiseaseByIdHandle,
  updateDiseaseHandle,
  deleteDiseaseHandle,
  getDiseasesByCategoryHandle,
} from "../services/disease.service.js";
import {
  createPreventionHandle,
  getAllPreventionsHandle,
  getPreventionByIdHandle,
  updatePreventionHandle,
  deletePreventionHandle,
} from "../services/prevention.service.js";
import {
  createSymptomHandle,
  getAllSymptomsHandle,
  getSymptomByIdHandle,
  updateSymptomHandle,
  deleteSymptomHandle,
} from "../services/symptom.service.js";
import {
  createTreatmentHandle,
  getAllTreatmentsHandle,
  getTreatmentByIdHandle,
  updateTreatmentHandle,
  deleteTreatmentHandle,
} from "../services/treatment.service.js";
import {
  createCauseHandle,
  getAllCausesHandle,
  getCauseByIdHandle,
  updateCauseHandle,
  deleteCauseHandle,
} from "../services/causes.service.js";

import { uploads } from "../utils/uploadImagesToCloud.js";

// Tạo một bệnh mới
export const createDisease = async (req, res) => {
  try {
    const payload = req.body;
    const userId = req.user.userId; // Lấy userId từ token đã xác thực
    const { images, thumbnail } = req.files;
    if (!payload) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }
    if (!images || images.length === 0) {
      return res.status(400).json({ message: "Vui lòng thêm ảnh!" });
    }
    if (!thumbnail || thumbnail.length === 0) {
      return res.status(400).json({ message: "Vui lòng thêm ảnh đại diện!" });
    }
    const uploadedThumbnail = await uploads(thumbnail[0], userId, "Disease");
    payload.thumbnail = uploadedThumbnail;

    const imagesUrl = await Promise.all(
      images.map((file) => uploads(file, userId, "Disease"))
    );
    payload.images = imagesUrl;

    const newDisease = await createDiseaseHandle(payload);
    res.status(201).json({
      message: "Tạo bệnh thành công!",
      disease: newDisease,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả các bệnh
export const getAllDiseases = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Lấy page và limit từ query params
    const result = await getAllDiseasesHandle(Number(page), Number(limit));
    res.status(200).json({
      message: "Lấy danh sách bệnh thành công!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách bệnh theo danh mục (DiseaseCategory)
export const getDiseasesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params; // Lấy categoryId từ params
    const { page = 1, limit = 10 } = req.query; // Lấy page và limit từ query params

    // Gọi service để lấy danh sách bệnh theo danh mục
    const result = await getDiseasesByCategoryHandle(
      categoryId,
      Number(page),
      Number(limit)
    );

    res.status(200).json({
      message: "Lấy danh sách bệnh theo danh mục thành công!",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một bệnh
export const getDiseaseById = async (req, res) => {
  try {
    const { diseaseId } = req.params;
    const disease = await getDiseaseByIdHandle(diseaseId);
    res.status(200).json({
      message: "Lấy thông tin bệnh thành công!",
      disease,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin bệnh
export const updateDisease = async (req, res) => {
  try {
    const { diseaseId } = req.params;
    const payload = req.body;
    const { images, thumbnail } = req.files;
    const userId = req.user.userId; // Lấy userId từ token đã xác thực
    if (!payload) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }
    if (!images || images.length === 0) {
      return res.status(400).json({ message: "Vui lòng thêm ảnh!" });
    }
    if (!thumbnail || thumbnail.length === 0) {
      return res.status(400).json({ message: "Vui lòng thêm ảnh đại diện!" });
    }

    const uploadedThumbnail = await uploads(thumbnail[0], userId, "Disease");
    payload.thumbnail = uploadedThumbnail;

    const imagesUrl = await Promise.all(
      images.map((file) => uploads(file, userId, "Disease"))
    );

    payload.images = imagesUrl;

    const updatedDisease = await updateDiseaseHandle(diseaseId, payload);
    res.status(200).json({
      message: "Cập nhật bệnh thành công!",
      disease: updatedDisease,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa một bệnh
export const deleteDisease = async (req, res) => {
  try {
    const { diseaseId } = req.params;
    const result = await deleteDiseaseHandle(diseaseId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo một biện pháp phòng ngừa mới
export const createPrevention = async (req, res) => {
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
      images.map((file) => uploads(file, req.user.userId, "Prevention"))
    );

    payload.images = imagesUrl;

    const newPrevention = await createPreventionHandle(payload);
    res.status(201).json({
      message: "Tạo biện pháp phòng ngừa thành công!",
      prevention: newPrevention,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả biện pháp phòng ngừa
export const getAllPreventions = async (req, res) => {
  try {
    const preventions = await getAllPreventionsHandle();
    res.status(200).json({
      message: "Lấy danh sách biện pháp phòng ngừa thành công!",
      preventions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một biện pháp phòng ngừa
export const getPreventionById = async (req, res) => {
  try {
    const { preventionId } = req.params;
    const prevention = await getPreventionByIdHandle(preventionId);
    res.status(200).json({
      message: "Lấy thông tin biện pháp phòng ngừa thành công!",
      prevention,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin biện pháp phòng ngừa
export const updatePrevention = async (req, res) => {
  try {
    const { preventionId } = req.params;
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
      images.map((file) => uploads(file, req.user.userId, "Prevention"))
    );

    payload.images = imagesUrl;

    const updatedPrevention = await updatePreventionHandle(
      preventionId,
      payload
    );
    res.status(200).json({
      message: "Cập nhật biện pháp phòng ngừa thành công!",
      prevention: updatedPrevention,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa một biện pháp phòng ngừa
export const deletePrevention = async (req, res) => {
  try {
    const { preventionId } = req.params;
    const result = await deletePreventionHandle(preventionId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo một triệu chứng mới
export const createSymptom = async (req, res) => {
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
      images.map((file) => uploads(file, req.user.userId, "Symptom"))
    );
    payload.images = imagesUrl;
    const newSymptom = await createSymptomHandle(payload);
    res.status(201).json({
      message: "Tạo triệu chứng thành công!",
      symptom: newSymptom,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả triệu chứng
export const getAllSymptoms = async (req, res) => {
  try {
    const symptoms = await getAllSymptomsHandle();
    res.status(200).json({
      message: "Lấy danh sách triệu chứng thành công!",
      symptoms,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một triệu chứng
export const getSymptomById = async (req, res) => {
  try {
    const { symptomId } = req.params;
    const symptom = await getSymptomByIdHandle(symptomId);
    res.status(200).json({
      message: "Lấy thông tin triệu chứng thành công!",
      symptom,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật triệu chứng
export const updateSymptom = async (req, res) => {
  try {
    const { symptomId } = req.params;
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
      images.map((file) => uploads(file, req.user.userId, "Symptom"))
    );
    payload.images = imagesUrl;
    const updatedSymptom = await updateSymptomHandle(symptomId, payload);
    res.status(200).json({
      message: "Cập nhật triệu chứng thành công!",
      symptom: updatedSymptom,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa triệu chứng
export const deleteSymptom = async (req, res) => {
  try {
    const { symptomId } = req.params;
    const result = await deleteSymptomHandle(symptomId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo một phương pháp điều trị mới
export const createTreatment = async (req, res) => {
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
      images.map((file) => uploads(file, req.user.userId, "Treatment"))
    );

    payload.images = imagesUrl;

    const newTreatment = await createTreatmentHandle(payload);
    res.status(201).json({
      message: "Tạo phương pháp điều trị thành công!",
      treatment: newTreatment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả phương pháp điều trị
export const getAllTreatments = async (req, res) => {
  try {
    const treatments = await getAllTreatmentsHandle();
    res.status(200).json({
      message: "Lấy danh sách phương pháp điều trị thành công!",
      treatments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một phương pháp điều trị
export const getTreatmentById = async (req, res) => {
  try {
    const { treatmentId } = req.params;
    const treatment = await getTreatmentByIdHandle(treatmentId);
    res.status(200).json({
      message: "Lấy thông tin phương pháp điều trị thành công!",
      treatment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật phương pháp điều trị
export const updateTreatment = async (req, res) => {
  try {
    const { treatmentId } = req.params;
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
      images.map((file) => uploads(file, req.user.userId, "Treatment"))
    );

    payload.images = imagesUrl;

    const updatedTreatment = await updateTreatmentHandle(treatmentId, payload);
    res.status(200).json({
      message: "Cập nhật phương pháp điều trị thành công!",
      treatment: updatedTreatment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa phương pháp điều trị
export const deleteTreatment = async (req, res) => {
  try {
    const { treatmentId } = req.params;
    const result = await deleteTreatmentHandle(treatmentId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

// Lấy danh sách tất cả nguyên nhân
export const getAllCauses = async (req, res) => {
  try {
    const causes = await getAllCausesHandle();
    res.status(200).json({
      message: "Lấy danh sách nguyên nhân thành công!",
      causes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin chi tiết một nguyên nhân
export const getCauseById = async (req, res) => {
  try {
    const { causeId } = req.params;
    const cause = await getCauseByIdHandle(causeId);
    res.status(200).json({
      message: "Lấy thông tin nguyên nhân thành công!",
      cause,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật nguyên nhân
export const updateCause = async (req, res) => {
  try {
    const { causeId } = req.params;
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

    const updatedCause = await updateCauseHandle(causeId, payload);
    res.status(200).json({
      message: "Cập nhật nguyên nhân thành công!",
      cause: updatedCause,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa nguyên nhân
export const deleteCause = async (req, res) => {
  try {
    const { causeId } = req.params;
    const result = await deleteCauseHandle(causeId);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
