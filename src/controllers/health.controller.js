import {
  getAllHealthInfoHandle,
  createHealthInfoHandle,
  updateHealthInfoHandle,
  deleteHealthInfoHandle,
  getUserHealthInfoByIdHandle,
} from "../services/health.service.js";
import { v4 as uuidv4 } from "uuid";
import {
  CONTEXT_HISTORY_LIMIT,
  DEFAULT_K,
  DEFAULT_MAX_TOKEN,
  DEFAULT_MODEL,
  DEFAULT_SIMILARITY_THRESHOLD,
  OPENAI_API_KEY,
} from "../config/openai.config.js";
import OpenAI from "openai";
import EmbedService from "../services/ragOpenAI.service.js";
import AIChatService from "../services/aiChat.service.js";
import { createAdvice } from "../services/healthAdvices.service.js";

const service = new EmbedService();
const chatService = new AIChatService();
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
// Lấy danh sách tất cả thông tin sức khỏe
export const getAllHealth = async (req, res) => {
  try {
    const healthInfo = await getAllHealthInfoHandle();
    res.status(200).json({
      message: "Lấy danh sách thông tin sức khỏe thành công!",
      healthInfo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin sức khỏe theo ID
export const getUserHealthInfoById = async (req, res) => {
  const userId = req.user.userId;

  if (!userId) {
    return res.status(400).json({ message: "Không xác định được đối tượng!" });
  }

  try {
    const healthInfo = await getUserHealthInfoByIdHandle(userId);

    if (!healthInfo) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin sức khỏe!" });
    }

    res.status(200).json({
      message: "Lấy thông tin sức khỏe thành công!",
      healthInfo,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo thông tin sức khỏe mới
export const createHealth = async (req, res) => {
  const payload = req.body;
  const userId = req.user.userId;

  if (!payload) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  try {
    payload.userId = userId;
    const newHealthInfo = await createHealthInfoHandle(payload);

    res.status(201).json({
      message: "Tạo thông tin sức khỏe thành công!",
      newHealthInfo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thông tin sức khỏe
export const updateUserHealth = async (req, res) => {
  const userId = req.user.userId;
  const payload = req.body;

  if (!userId) {
    return res.status(400).json({ message: "Không xác định được đối tượng!" });
  }

  if (!payload) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }

  try {
    // Kiểm tra dữ liệu đầu vào
    if (
      payload.weight &&
      (typeof payload.weight !== "number" || payload.weight <= 0)
    ) {
      return res.status(400).json({ message: "Cân nặng không hợp lệ!" });
    }

    if (
      payload.height &&
      (typeof payload.height !== "number" || payload.height <= 0)
    ) {
      return res.status(400).json({ message: "Chiều cao không hợp lệ!" });
    }
    payload.userId = userId;
    const updatedHealthInfo = await updateHealthInfoHandle(userId, payload);

    res.status(200).json({
      message: "Cập nhật thông tin sức khỏe thành công!",
      updatedHealthInfo,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa thông tin sức khỏe
export const deleteHealth = async (req, res) => {
  const { healthId } = req.params;

  if (!healthId) {
    return res
      .status(400)
      .json({ message: "Không xác định được ID sức khỏe!" });
  }

  try {
    const result = await deleteHealthInfoHandle(healthId);

    if (!result) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy thông tin sức khỏe để xóa!" });
    }

    res.status(200).json({
      message: "Xóa thông tin sức khỏe thành công!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hàm đánh giá nhịp tim
const evaluateHeartRate = (heartRate, age) => {
  if (!heartRate || !age) return null;

  const maxHeartRate = 220 - age;
  const restingHeartRate = heartRate;

  if (restingHeartRate < 60) {
    return "Thấp (có thể do thể lực tốt hoặc cần kiểm tra)";
  } else if (restingHeartRate <= 100) {
    return "Bình thường";
  } else {
    return "Cao (nên tham khảo ý kiến bác sĩ)";
  }
};

// Hàm tạo lời khuyên dinh dưỡng
const generateNutritionAdvice = (bmi, bmiCategory, goal, calorieGoal) => {
  const advice = {
    calories: Math.round(calorieGoal),
    protein: Math.round((calorieGoal * 0.25) / 4), // 25% calo từ protein
    carbs: Math.round((calorieGoal * 0.45) / 4), // 45% calo từ carbs
    fat: Math.round((calorieGoal * 0.3) / 9), // 30% calo từ fat
    recommendations: [],
  };

  // Lời khuyên cụ thể theo BMI
  if (bmiCategory === "Thiếu cân") {
    advice.recommendations.push(
      "Tăng cường ăn uống với các bữa ăn nhỏ nhưng thường xuyên",
      "Bổ sung protein chất lượng cao: thịt nạc, cá, trứng, đậu",
      "Thêm các loại hạt và bơ để tăng calo lành mạnh"
    );
  } else if (bmiCategory === "Thừa cân" || bmiCategory === "Béo phì") {
    advice.recommendations.push(
      "Ưu tiên thực phẩm ít calo nhưng giàu dinh dưỡng",
      "Tăng cường rau xanh, trái cây và ngũ cốc nguyên hạt",
      "Hạn chế đồ ăn chế biến sẵn và đồ uống có đường"
    );
  }

  // Lời khuyên theo mục tiêu
  if (goal === "lose") {
    advice.recommendations.push(
      "Ăn nhiều rau xanh để tăng cảm giác no",
      "Uống đủ nước (2-2.5L/ngày)",
      "Ăn chậm và nhai kỹ để tăng cảm giác no"
    );
  } else if (goal === "gain") {
    advice.recommendations.push(
      "Ăn 5-6 bữa nhỏ trong ngày",
      "Bổ sung smoothie hoặc sữa sau tập luyện",
      "Chọn thực phẩm giàu calo lành mạnh"
    );
  }

  return advice;
};

// Hàm tạo lời khuyên tập luyện
const generateExerciseAdvice = (activityLevel, goal, bmiCategory) => {
  const advice = {
    cardio: "",
    strength: "",
    recommendations: [],
  };

  if (goal === "lose") {
    advice.cardio =
      "150-300 phút cardio cường độ vừa hoặc 75-150 phút cường độ cao/tuần";
    advice.strength = "Tập cơ 2-3 lần/tuần để duy trì khối lượng cơ";
    advice.recommendations.push(
      "Kết hợp cardio và tập tạ để đốt cháy mỡ hiệu quả",
      "Tập HIIT 2-3 lần/tuần",
      "Đi bộ nhanh 30-45 phút/ngày"
    );
  } else if (goal === "gain") {
    advice.cardio = "2-3 buổi cardio nhẹ/tuần (20-30 phút)";
    advice.strength = "Tập tạ 4-5 lần/tuần, tập trung vào compound exercises";
    advice.recommendations.push(
      "Ưu tiên tập tạ với trọng lượng nặng",
      "Nghỉ ngơi đủ giữa các buổi tập",
      "Tập trung vào squat, deadlift, bench press"
    );
  } else {
    advice.cardio = "150 phút cardio cường độ vừa/tuần";
    advice.strength = "Tập cơ 2-3 lần/tuần";
    advice.recommendations.push(
      "Duy trì thói quen tập luyện đều đặn",
      "Kết hợp các loại hình tập luyện khác nhau",
      "Tập yoga hoặc pilates để tăng sự linh hoạt"
    );
  }

  return advice;
};

// Hàm tạo cảnh báo sức khỏe
const generateHealthWarnings = (
  bmiCategory,
  whrCategory,
  heartRateStatus,
  chronicDiseases,
  allergies
) => {
  const warnings = [];

  if (bmiCategory === "Béo phì") {
    warnings.push(
      "BMI cho thấy tình trạng béo phì. Nên tham khảo ý kiến bác sĩ để có kế hoạch giảm cân an toàn."
    );
  }

  if (whrCategory === "Cao") {
    warnings.push(
      "Tỷ lệ vòng eo/hông cao, tăng nguy cơ bệnh tim mạch. Nên tập trung giảm mỡ bụng."
    );
  }

  if (heartRateStatus && heartRateStatus.includes("Cao")) {
    warnings.push(
      "Nhịp tim nghỉ cao hơn bình thường. Nên kiểm tra sức khỏe tim mạch."
    );
  }

  if (chronicDiseases && chronicDiseases.length > 0) {
    warnings.push(
      "Có bệnh mãn tính. Mọi thay đổi về chế độ ăn và tập luyện cần tham khảo ý kiến bác sĩ."
    );
  }

  if (allergies && allergies.length > 0) {
    warnings.push(
      `Cần tránh các thực phẩm gây dị ứng: ${allergies.join(", ")}`
    );
  }

  return warnings;
};

// Hàm tính BMI
const calculateBMI = (weight, height) => {
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
};

// Hàm tính BMR (Basal Metabolic Rate) theo công thức Mifflin-St Jeor
const calculateBMR = (weight, height, age, gender) => {
  if (gender === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

// Hàm tính TDEE (Total Daily Energy Expenditure)
const calculateTDEE = (bmr, activityLevel) => {
  const activityMultipliers = {
    sedentary: 1.2, // Ít vận động
    light: 1.375, // Vận động nhẹ 1-3 ngày/tuần
    moderate: 1.55, // Vận động vừa phải 3-5 ngày/tuần
    active: 1.725, // Vận động nhiều 6-7 ngày/tuần
    very_active: 1.9, // Vận động rất nhiều hoặc công việc thể lực
  };

  return bmr * (activityMultipliers[activityLevel] || 1.55);
};

// Hàm tính lượng calo cần thiết theo mục tiêu
const calculateCalorieGoal = (tdee, goal) => {
  switch (goal) {
    case "lose":
      return tdee - 500; // Giảm 500 calo/ngày để giảm ~0.5kg/tuần
    case "gain":
      return tdee + 500; // Tăng 500 calo/ngày để tăng ~0.5kg/tuần
    case "maintain":
    default:
      return tdee;
  }
};

// Hàm tính chỉ số WHR (Waist-to-Hip Ratio)
const calculateWHR = (waist, hip) => {
  if (!waist || !hip) return null;
  return waist / hip;
};

// Hàm phân loại WHR
const classifyWHR = (whr, gender) => {
  if (!whr) return null;

  if (gender === "male") {
    if (whr < 0.9) return "Thấp";
    if (whr <= 1.0) return "Vừa phải";
    return "Cao";
  } else {
    if (whr < 0.8) return "Thấp";
    if (whr <= 0.85) return "Vừa phải";
    return "Cao";
  }
};

// Hàm phân loại BMI
const classifyBMI = (bmi) => {
  if (bmi < 18.5) return "Thiếu cân";
  if (bmi < 25) return "Bình thường";
  if (bmi < 30) return "Thừa cân";
  return "Béo phì";
};

// Hàm tạo prompt đơn giản cho AI
const createSimpleHealthAdvicePrompt = (userInfo, calculations) => {
  const { height, weight, age, activityLevel, goal, gender } = userInfo;
  const { bmi, bmiCategory, calorieGoal, tdee } = calculations;

  return `Bạn là một chuyên gia dinh dưỡng. Hãy tư vấn sức khỏe ngắn gọn cho người dùng:

          THÔNG TIN:
          - Tuổi: ${age}
          - Giới tính: ${gender === "male" ? "Nam" : "Nữ"}
          - Chiều cao: ${height}cm
          - Cân nặng: ${weight}kg
          - Mức độ hoạt động: ${activityLevel}
          - Mục tiêu: ${
            goal === "lose"
              ? "Giảm cân"
              : goal === "gain"
              ? "Tăng cân"
              : "Duy trì cân nặng"
          }
          - BMI: ${bmi.toFixed(1)} (${bmiCategory})
          - TDEE (Tổng năng lượng tiêu hao mỗi ngày): ${tdee.toFixed(0)} calo
          - Calo khuyến nghị: ${calorieGoal.toFixed(0)} - ${(
    calorieGoal + 200
  ).toFixed(0)} calo/ngày

          Hãy đưa ra lời khuyên ngắn gọn theo cấu trúc:

          Nếu BMI đã đạt chuẩn (18.5–24.9) mà người dùng vẫn muốn tăng hoặc giảm cân, hoặc nếu BMI ở mức bất thường (thiếu cân hoặc béo phì) nhưng mục tiêu không phù hợp, hãy:
          **KHUYẾN CÁO**: Đưa ra cảnh báo y khoa nếu cần thay đổi lại mục tiêu hoặc theo dõi sức khỏe kỹ hơn.

          Sau đó tiếp tục với các phần bên dưới (hoặc bỏ qua phần khuyến cáo nếu không cần):

          1. **ĐÁNH GIÁ**: Tình trạng sức khỏe hiện tại dựa trên BMI, nguy cơ tiềm ẩn nếu có.
          2. **DINH DƯỠNG**: Đề xuất tổng calo nên nạp mỗi ngày, cách chia khẩu phần (Carb / Protein / Fat), thực phẩm nên ưu tiên và nên tránh.
          3. **TẬP LUYỆN**: Gợi ý loại hình tập luyện, tần suất phù hợp với thể trạng và mục tiêu (giảm mỡ, tăng cơ, giữ form).
          4. **LỜI KHUYÊN**: Những lưu ý cần thiết như theo dõi cân nặng, kiểm tra sức khỏe định kỳ, tư vấn chuyên sâu nếu cần.

          Viết bằng tiếng Việt, giọng điệu khoa học và rõ ràng, như một chuyên gia dinh dưỡng y khoa thực thụ.`;
};

// Hàm chính tư vấn sức khỏe đơn giản
export const getSimpleHealthAdvice = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { weight, height, age, activityLevel, goal, gender } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!weight || !height || !age || !gender) {
      return res.status(400).json({
        message:
          "Thiếu thông tin cơ bản: cân nặng, chiều cao, tuổi, giới tính!",
      });
    }

    if (age <= 0 || weight <= 0 || height <= 0) {
      return res.status(400).json({
        message: "Thông tin không hợp lệ!",
      });
    }

    // Tính toán các chỉ số
    const bmi = calculateBMI(weight, height);
    const bmiCategory = classifyBMI(bmi);
    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel || "sedentary");
    const calorieGoal = calculateCalorieGoal(tdee, goal || "maintain");

    // Tạo prompt cho AI
    const prompt = createSimpleHealthAdvicePrompt(
      { weight, height, age, activityLevel, goal, gender },
      { bmi, bmiCategory, calorieGoal, tdee }
    );

    // Gọi OpenAI API (giả sử bạn có cấu hình OpenAI)
    const aiResponse = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: "Bạn là một chuyên gia dinh dưỡng chuyên nghiệp.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.7,
    });

    const aiAdvice = aiResponse.choices[0].message.content;

    if (userId) {
      await createAdvice({
        userId,
        type: "metabolism",
        value: aiAdvice,
      });
    }
    // Phản hồi
    const response = {
      message: "Tư vấn sức khỏe thành công!",
      healthMetrics: {
        bmi: Math.round(bmi * 10) / 10,
        bmiCategory,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        dailyCalories: Math.round(calorieGoal),
      },
      advice: aiAdvice,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Lỗi khi tạo tư vấn sức khỏe:", error);

    // Nếu AI lỗi, trả về lời khuyên cơ bản
    const bmi = calculateBMI(req.body.weight, req.body.height);
    const bmiCategory = classifyBMI(bmi);
    const bmr = calculateBMR(
      req.body.weight,
      req.body.height,
      req.body.age,
      req.body.gender
    );
    const tdee = calculateTDEE(bmr, req.body.activityLevel || "sedentary");
    const calorieGoal = calculateCalorieGoal(tdee, req.body.goal || "maintain");

    res.status(200).json({
      message: "Tư vấn sức khỏe cơ bản thành công!",
      healthMetrics: {
        bmi: Math.round(bmi * 10) / 10,
        bmiCategory,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        dailyCalories: Math.round(calorieGoal),
      },
      advice: `Dựa trên BMI ${bmi.toFixed(1)} (${bmiCategory}), bạn nên ${
        req.body.goal === "lose"
          ? "giảm cân bằng cách tạo deficit calo"
          : req.body.goal === "gain"
          ? "tăng cân bằng cách tăng calo"
          : "duy trì cân nặng hiện tại"
      }. Mục tiêu calo hàng ngày: ${Math.round(calorieGoal)} calo.`,
      note: "Hệ thống AI tạm thời không khả dụng, sử dụng lời khuyên cơ bản.",
    });
  }
};
