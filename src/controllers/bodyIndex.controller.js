import {
  calculateBMIHandle,
  calculateBodyFatHandle,
  calculateEMMHandle,
  calculateWHRHandle,
  deleteBMIRecordHandle,
  deleteBodyFatRecordHandle,
  deleteEMMRecordHandle,
  deleteWHRRecordHandle,
  getBMIRecordByIdHandle,
  getBMIRecordsHandle,
  getBodyFatRecordByIdHandle,
  getBodyFatRecordsHandle,
  getEMMRecordByIdHandle,
  getEMMRecordsHandle,
  getWHRRecordByIdHandle,
  getWHRRecordsHandle,
} from "../services/bodyIndex.service.js";
import {
  classifyBMI,
  classifyBMR,
  classifyBodyFatPercent,
  classifyTDEE,
  classifyWHR,
} from "../utils/health.utils.js";

export const getBMIRecords = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(404).json({ message: "Không tìm thấy đối tượng!" });
    }
    const bmiRecords = await getBMIRecordsHandle(userId);
    res.status(200).json({
      message: "Lấy các chỉ số BMI thành công!",
      bmiRecords,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBMIRecordById = async (req, res) => {
  try {
    const recordId = req.params.id;

    if (!recordId) {
      return res.status(400).json({ message: "Thiếu ID hồ sơ BMI!" });
    }

    const bmiRecord = await getBMIRecordByIdHandle(recordId);

    const plainRecord = bmiRecord.toObject();

    if (plainRecord.bmi) {
      plainRecord.categoryBMI = classifyBMI(plainRecord.bmi);
    }

    res.status(200).json({
      message: "Lấy hồ sơ BMI thành công!",
      bmiRecord: plainRecord,
    });
  } catch (error) {
    console.error("Lỗi khi lấy BMI Record:", error.message);
    res.status(500).json({ message: "Lỗi máy chủ. Không thể lấy dữ liệu." });
  }
};

export const calculateBMI = async (req, res) => {
  try {
    const userId = req.user.userId;
    const payload = req.body;

    const { weight, height } = req.body;
    if (!weight || !height) {
      return res
        .status(400)
        .json({ message: "Thiếu dữ liệu để tính toán chỉ số BMI!" });
    }
    if (!userId) {
      return res.status(404).json({ message: "Không tìm thấy đối tượng!" });
    }
    const bodyIndex = await calculateBMIHandle({
      userId,
      weight: Number(weight),
      height: Number(height),
    });

    const plainRecord = bodyIndex.toObject();
    if (plainRecord.bmi) {
      plainRecord.categoryBMI = classifyBMI(plainRecord.bmi);
    }
    res.status(200).json({
      message: "Tính toán chỉ số BMI",
      bmiRecord: plainRecord,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBMIRecord = async (req, res) => {
  try {
    const recordId = req.params.id;
    if (!recordId) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ BMI!" });
    }
    const result = await deleteBMIRecordHandle(recordId);
    res.status(200).json({
      message: "Xóa hồ sơ BMI thành công!",
      success: true,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getEMMRecords = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(404).json({ message: "Không tìm thấy đối tượng!" });
    }
    const emmRecords = await getEMMRecordsHandle(userId);

    res.status(200).json({
      message: "Lấy các chỉ số EMM thành công!",
      emmRecords,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getEMMRecordById = async (req, res) => {
  try {
    const recordId = req.params.id;
    if (!recordId) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ EMM!" });
    }
    const emmRecord = await getEMMRecordByIdHandle(recordId);

    const plainRecord = emmRecord.toObject();
    if (plainRecord.bmr) {
      plainRecord.categoryBMR = classifyBMR(
        plainRecord.bmr,
        plainRecord.gender
      );
    }
    if (plainRecord.tdee || plainRecord.activityLevel) {
      plainRecord.categoryTDEE = classifyTDEE(
        plainRecord.tdee,
        plainRecord.activityLevel
      );
    }
    res.status(200).json({
      message: "Lấy hồ sơ EMM thành công!",
      emmRecord: plainRecord,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const calculateEMM = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { weight, height, age, gender, activityLevel } = req.body;
    if (!userId) {
      return res.status(404).json({ message: "Không tìm thấy đối tượng!" });
    }
    if (!weight || !height || !age || !gender || !activityLevel) {
      return res
        .status(400)
        .json({ message: "Thiếu dữ liệu để tính toán chỉ số EMM!" });
    }
    const emmRecord = await calculateEMMHandle({
      userId,
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      gender,
      activityLevel,
    });
    const plainRecord = emmRecord.toObject();
    if (plainRecord.bmr) {
      plainRecord.categoryBMR = classifyBMR(
        plainRecord.bmr,
        plainRecord.gender
      );
    }
    if (plainRecord.tdee || plainRecord.activityLevel) {
      plainRecord.categoryTDEE = classifyTDEE(
        plainRecord.tdee,
        plainRecord.activityLevel
      );
    }
    res.status(200).json({
      message: "Tính toán chỉ số EMM thành công!",
      emmRecord: plainRecord,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteEMMRecord = async (req, res) => {
  try {
    const recordId = req.params.id;
    if (!recordId) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ BMI!" });
    }
    const result = await deleteEMMRecordHandle(recordId);
    res.status(200).json({
      message: "Xóa hồ sơ BMI thành công!",
      success: true,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBodyFatRecords = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(404).json({ message: "Không tìm thấy đối tượng!" });
    }
    const bodyFatRecords = await getBodyFatRecordsHandle(userId);

    res.status(200).json({
      message: "Lấy các chỉ số Body Fat thành công!",
      bodyFatRecords,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getBodyFatRecordById = async (req, res) => {
  try {
    const recordId = req.params.id;
    if (!recordId) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ EMM!" });
    }
    const emmRecord = await getBodyFatRecordByIdHandle(recordId);

    const plainRecord = emmRecord.toObject();
    if (plainRecord.bodyFatPercent) {
      plainRecord.categoryBodyFat = classifyBodyFatPercent(
        plainRecord.gender,
        plainRecord.bodyFatPercent
      );
    }

    res.status(200).json({
      message: "Lấy hồ sơ EMM thành công!",
      bodyFatRecord: plainRecord,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const calculateBodyFat = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { gender, waist, neck, hip, height, weight } = req.body;

    if (!userId) {
      return res.status(404).json({ message: "Không tìm thấy đối tượng!" });
    }
    if (gender === "female") {
      if (!gender || !waist || !neck || !hip || !weight || !height) {
        return res
          .status(400)
          .json({ message: "Thiếu dữ liệu để tính toán phần trăm mỡ cơ thể!" });
      }
    } else {
      if (!gender || !waist || !neck || !weight || !height) {
        return res
          .status(400)
          .json({ message: "Thiếu dữ liệu để tính toán phần trăm mỡ cơ thể!" });
      }
    }

    const bodyFat = await calculateBodyFatHandle({
      userId,
      gender,
      waist: Number(waist),
      neck: Number(neck),
      hip: hip ? Number(hip) : null,
      weight: Number(weight),
      height: Number(height),
    });
    const plainRecord = bodyFat.toObject();
    if (plainRecord.bodyFatPercent) {
      plainRecord.categoryBodyFat = classifyBodyFatPercent(
        plainRecord.gender,
        plainRecord.bodyFatPercent
      );
    }
    res.status(200).json({
      message: "Tính toán phần trăm mỡ cơ thể thành công!",
      bodyFat: plainRecord,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteBodyFatRecord = async (req, res) => {
  try {
    const recordId = req.params.id;
    if (!recordId) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy hồ sơ Body Fat!" });
    }
    const result = await deleteBodyFatRecordHandle(recordId);
    res.status(200).json({
      message: "Xóa hồ sơ BMI thành công!",
      success: true,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getWHRRecords = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(404).json({ message: "Không tìm thấy đối tượng!" });
    }
    const whrRecords = await getWHRRecordsHandle(userId);
    res.status(200).json({
      message: "Lấy các chỉ số WHR thành công!",
      whrRecords,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getWHRRecordById = async (req, res) => {
  try {
    const recordId = req.params.id;
    if (!recordId) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ WHR!" });
    }
    const whrRecord = await getWHRRecordByIdHandle(recordId);
    const plainRecord = whrRecord.toObject();
    if (plainRecord.whr) {
      plainRecord.categoryWHR = classifyWHR(
        plainRecord.whr,
        plainRecord.gender
      );
    }
    res.status(200).json({
      message: "Lấy hồ sơ WHR thành công!",
      whrRecord: plainRecord,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const calculateWHR = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { waist, hip, gender } = req.body;
    console.log(waist, hip);
    if (!userId) {
      return res.status(404).json({ message: "Không tìm thấy đối tượng!" });
    }
    if (
      !waist ||
      !hip ||
      !gender ||
      isNaN(Number(waist)) ||
      isNaN(Number(hip))
    ) {
      return res.status(400).json({
        message: "Thiếu dữ liệu hoặc dữ liệu không hợp lệ để tính toán WHR!",
      });
    }

    const whr = await calculateWHRHandle({
      userId,
      waist: Number(waist),
      hip: Number(hip),
      gender,
    });

    const plainRecord = whr.toObject();
    if (plainRecord.whr) {
      plainRecord.categoryWHR = classifyWHR(
        plainRecord.whr,
        plainRecord.gender
      );
    }
    res.status(200).json({
      message: "Tính toán WHR thành công!",
      whr: plainRecord,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteWHRRecord = async (req, res) => {
  try {
    const recordId = req.params.id;
    if (!recordId) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ WHR!" });
    }
    const result = await deleteWHRRecordHandle(recordId);
    res.status(200).json({
      message: "Xóa hồ sơ WHR thành công!",
      success: true,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
