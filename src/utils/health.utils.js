import { activityFactors } from "../config/contants.config.js";

export const calculateBMI = (weight, height) => {
  if (height <= 0) {
    throw new Error("Chiều cao phải lớn hơn 0");
  }
  if (weight <= 0) {
    throw new Error("Cân nặng phải lớn hơn 0");
  }

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return bmi.toFixed(2);
};

export const calculateBMRForMale = (weight, height, age) => {
  if (height <= 0) {
    throw new Error("Chiều cao phải lớn hơn 0");
  }
  if (weight <= 0) {
    throw new Error("Cân nặng phải lớn hơn 0");
  }
  if (age <= 0) {
    throw new Error("Tuổi phải lớn hơn 0");
  }
  const heightInMeters = height / 100;
  const bmr = 10 * weight + 6.25 * heightInMeters * 100 - 5 * age + 5;
  return bmr.toFixed(2);
};

export const calculateBMRForFemale = (weight, height, age) => {
  if (height <= 0) {
    throw new Error("Chiều cao phải lớn hơn 0");
  }
  if (weight <= 0) {
    throw new Error("Cân nặng phải lớn hơn 0");
  }
  if (age <= 0) {
    throw new Error("Tuổi phải lớn hơn 0");
  }
  const heightInMeters = height / 100;
  const bmr = 10 * weight + 6.25 * heightInMeters * 100 - 5 * age - 161;
  return bmr.toFixed(2);
};

export const calculateTDEE = (bmr, activityLevel) => {
  if (!activityFactors[activityLevel]) {
    throw new Error("Cấp độ hoạt động không hợp lệ");
  }
  return (bmr * activityFactors[activityLevel]).toFixed(2);
};

export const calculateBodyFatPercent = (gender, waist, neck, hip, height) => {
  waist = Number(waist);
  neck = Number(neck);
  hip = Number(hip);
  height = Number(height);

  if (!gender || !waist || !neck || !height) {
    throw new Error("Thiếu thông tin cần thiết để tính body fat %");
  }

  if (
    waist <= 0 ||
    neck <= 0 ||
    height <= 0 ||
    (gender === "female" && hip <= 0)
  ) {
    throw new Error("Số đo phải lớn hơn 0");
  }

  const log10 = (value) => Math.log10(value);

  let bodyFatPercent;

  console.log(log10(height));

  if (gender === "male") {
    const x = waist - neck;
    if (x <= 0) throw new Error("Vòng eo phải lớn hơn vòng cổ");
    bodyFatPercent = 86.01 * log10(x) - 70.041 * log10(height) + 36.76;
  } else if (gender === "female") {
    const x = waist + hip - neck;
    if (x <= 0) throw new Error("Tổng (eo + mông - cổ) phải lớn hơn 0");
    bodyFatPercent = 163.205 * log10(x) - 97.684 * log10(height) - 78.387;
  } else {
    throw new Error("Giới tính không hợp lệ");
  }

  return Number(bodyFatPercent.toFixed(2));
};

export const calculateWHR = (waist, hip) => {
  waist = Number(waist);
  hip = Number(hip);
  if (!waist || !hip) {
    throw new Error("Thiếu thông tin cần thiết để tính WHR");
  }
  if (waist <= 0 || hip <= 0) {
    throw new Error("Số đo phải lớn hơn 0");
  }
  const whr = waist / hip;
  return Number(whr.toFixed(2));
};

export const classifyBMI = (bmi) => {
  if (bmi < 16)
    return {
      level: "Gầy độ III (rất gầy)",
      description:
        "Thiếu cân nghiêm trọng, có thể ảnh hưởng đến sức khỏe nghiêm trọng.",
      advice:
        "Bạn nên đi khám dinh dưỡng để được tư vấn chế độ ăn uống tăng cân và theo dõi sức khỏe tổng thể.",
    };
  if (bmi < 17)
    return {
      level: "Gầy độ II",
      description: "Thiếu cân mức độ nặng, nguy cơ thiếu hụt dưỡng chất.",
      advice:
        "Tăng cường dinh dưỡng, ăn đủ bữa và ưu tiên thực phẩm giàu calo, đạm.",
    };
  if (bmi < 18.5)
    return {
      level: "Gầy độ I",
      description: "Thiếu cân nhẹ, cần cải thiện thể trạng.",
      advice: "Bổ sung thêm khẩu phần ăn và tập luyện tăng cơ bắp.",
    };
  if (bmi < 25)
    return {
      level: "Bình thường",
      description: "Thể trạng tốt, cân nặng phù hợp.",
      advice: "Tiếp tục duy trì chế độ ăn uống và luyện tập lành mạnh.",
    };
  if (bmi < 30)
    return {
      level: "Thừa cân",
      description:
        "Cân nặng vượt ngưỡng lý tưởng, có thể tiềm ẩn nguy cơ bệnh lý.",
      advice:
        "Nên điều chỉnh chế độ ăn và tăng cường vận động nhẹ nhàng để giảm cân.",
    };
  if (bmi < 35)
    return {
      level: "Béo phì độ I",
      description:
        "Thừa cân rõ rệt, có nguy cơ cao mắc các bệnh mãn tính như tiểu đường, cao huyết áp.",
      advice:
        "Cần điều chỉnh chế độ ăn, tập thể dục thường xuyên và theo dõi sức khỏe định kỳ.",
    };
  if (bmi < 40)
    return {
      level: "Béo phì độ II",
      description: "Thừa cân nghiêm trọng, ảnh hưởng rõ đến sức khỏe.",
      advice:
        "Tham khảo ý kiến bác sĩ chuyên khoa để có phác đồ giảm cân phù hợp.",
    };
  return {
    level: "Béo phì độ III (nguy hiểm)",
    description:
      "Tình trạng béo phì rất nghiêm trọng, nguy cơ cao mắc bệnh tim mạch, tiểu đường, đột quỵ.",
    advice:
      "Cần can thiệp y tế càng sớm càng tốt. Ưu tiên khám dinh dưỡng, thể chất và theo dõi chặt chẽ.",
  };
};

export const classifyBMR = (bmr, gender) => {
  if (!bmr || !gender) {
    return {
      level: "Không xác định",
      description: "Thiếu dữ liệu cần thiết để phân loại BMR.",
      advice: "Vui lòng cung cấp đầy đủ chỉ số BMR và giới tính.",
    };
  }

  const maleThresholds = {
    low: 1300,
    average: 1700,
    high: 2100,
  };

  const femaleThresholds = {
    low: 1100,
    average: 1500,
    high: 1800,
  };

  const thresholds = gender === "male" ? maleThresholds : femaleThresholds;

  if (bmr < thresholds.low) {
    return {
      level: "Thấp",
      description:
        "Chuyển hóa cơ bản thấp, có thể dẫn đến mệt mỏi, thiếu năng lượng.",
      advice:
        "Xem xét chế độ ăn uống đủ chất và kiểm tra sức khỏe nội tiết, tuyến giáp nếu cần.",
    };
  }

  if (bmr < thresholds.average) {
    return {
      level: "Trung bình thấp",
      description:
        "Tốc độ trao đổi chất ở mức dưới trung bình, dễ tích tụ mỡ nếu không vận động.",
      advice:
        "Tăng cường vận động nhẹ nhàng và kiểm soát khẩu phần ăn để duy trì cân nặng.",
    };
  }

  if (bmr < thresholds.high) {
    return {
      level: "Trung bình",
      description:
        "Tốc độ trao đổi chất bình thường, cơ thể sử dụng năng lượng hiệu quả.",
      advice: "Tiếp tục duy trì chế độ sinh hoạt lành mạnh để giữ ổn định BMR.",
    };
  }

  return {
    level: "Cao",
    description:
      "Tốc độ trao đổi chất cao, cơ thể tiêu hao năng lượng nhiều hơn mức trung bình.",
    advice:
      "Nên bổ sung đủ dinh dưỡng để tránh thiếu hụt năng lượng, đặc biệt nếu tập luyện cường độ cao.",
  };
};

export const classifyTDEE = (tdee, activityLevel) => {
  switch (activityLevel) {
    case "sedentary":
      return {
        level: "Rất ít vận động",
        description: "Bạn có lối sống tĩnh tại, ít hoạt động thể chất.",
        advice:
          "Cân nhắc tăng cường vận động nhẹ nhàng mỗi ngày như đi bộ, tập yoga, nhằm cải thiện sức khỏe và duy trì cân nặng hợp lý.",
      };

    case "light":
      return {
        level: "Hoạt động nhẹ",
        description:
          "Bạn vận động nhẹ nhàng, có thể là đi lại, việc nhà, thể dục nhẹ vài lần/tuần.",
        advice:
          "Bạn nên kết hợp thêm các bài tập tăng nhịp tim hoặc luyện sức bền để nâng cao sức khỏe tim mạch và tiêu hao năng lượng hiệu quả hơn.",
      };

    case "moderate":
      return {
        level: "Hoạt động vừa phải",
        description:
          "Bạn luyện tập thường xuyên hoặc làm công việc yêu cầu vận động đều đặn.",
        advice:
          "Tiếp tục duy trì lịch tập đều đặn và ăn uống cân đối để ổn định thể trạng và cải thiện vóc dáng.",
      };

    case "active":
      return {
        level: "Hoạt động nhiều",
        description:
          "Bạn có lịch trình vận động thường xuyên và cường độ cao, đốt cháy nhiều calo mỗi ngày.",
        advice:
          "Đảm bảo cung cấp đủ dinh dưỡng, đặc biệt là protein và khoáng chất để phục hồi và phát triển cơ bắp.",
      };

    case "very_active":
      return {
        level: "Hoạt động rất nhiều",
        description:
          "Bạn là người tập luyện thể thao cường độ cao, hoặc làm công việc thể chất nặng hàng ngày.",
        advice:
          "Nên duy trì chế độ ăn uống giàu năng lượng, kết hợp nghỉ ngơi đầy đủ để tránh quá sức và duy trì hiệu suất hoạt động cao.",
      };

    default:
      return {
        level: "Không xác định",
        description: "Không thể xác định mức độ hoạt động.",
        advice:
          "Vui lòng cập nhật thông tin mức độ vận động chính xác để nhận phân tích phù hợp.",
      };
  }
};

export const classifyBodyFatPercent = (gender, bodyFatPercent) => {
  if (!gender || bodyFatPercent === undefined || bodyFatPercent === null) {
    return {
      category: "Không xác định",
      description: "Thiếu dữ liệu đầu vào để phân loại.",
      advice:
        "Vui lòng cung cấp đầy đủ thông tin giới tính và tỷ lệ mỡ cơ thể.",
    };
  }

  let category = "";
  let description = "";
  let advice = "";

  if (gender === "male") {
    if (bodyFatPercent < 6) {
      category = "Thiếu mỡ nghiêm trọng";
      description = "Tỷ lệ mỡ quá thấp, có thể gây ảnh hưởng xấu đến sức khỏe.";
      advice = "Tham khảo chuyên gia để điều chỉnh chế độ ăn và sinh hoạt.";
    } else if (bodyFatPercent <= 13) {
      category = "Vận động viên";
      description =
        "Tỷ lệ mỡ lý tưởng cho người luyện tập thể thao cường độ cao.";
      advice = "Duy trì chế độ ăn uống và tập luyện khoa học.";
    } else if (bodyFatPercent <= 17) {
      category = "Thể hình tốt";
      description = "Mức mỡ khỏe mạnh, phù hợp với lối sống năng động.";
      advice = "Tiếp tục duy trì thói quen sống lành mạnh.";
    } else if (bodyFatPercent <= 24) {
      category = "Bình thường";
      description = "Tỷ lệ mỡ cơ thể ở mức trung bình.";
      advice = "Nên duy trì chế độ ăn và luyện tập ổn định.";
    } else {
      category = "Béo";
      description = "Tỷ lệ mỡ cao, có thể dẫn đến các vấn đề sức khỏe.";
      advice = "Cần điều chỉnh chế độ ăn và tăng cường vận động để giảm mỡ.";
    }
  } else if (gender === "female") {
    if (bodyFatPercent < 14) {
      category = "Thiếu mỡ nghiêm trọng";
      description =
        "Tỷ lệ mỡ quá thấp, có thể ảnh hưởng đến nội tiết và sức khỏe sinh sản.";
      advice = "Cần bổ sung dinh dưỡng và tham khảo ý kiến bác sĩ.";
    } else if (bodyFatPercent <= 20) {
      category = "Vận động viên";
      description = "Tỷ lệ mỡ lý tưởng cho phụ nữ luyện tập thể thao.";
      advice = "Duy trì chế độ ăn uống, nghỉ ngơi và tập luyện điều độ.";
    } else if (bodyFatPercent <= 24) {
      category = "Thể hình tốt";
      description = "Tỷ lệ mỡ khỏe mạnh, phù hợp với lối sống năng động.";
      advice = "Tiếp tục duy trì thói quen sống lành mạnh.";
    } else if (bodyFatPercent <= 31) {
      category = "Bình thường";
      description = "Mức mỡ trong cơ thể ở ngưỡng bình thường.";
      advice = "Nên duy trì chế độ ăn, nghỉ ngơi và thể dục nhẹ nhàng.";
    } else {
      category = "Béo";
      description =
        "Tỷ lệ mỡ cao, có nguy cơ ảnh hưởng đến sức khỏe tim mạch, nội tiết.";
      advice =
        "Cần điều chỉnh chế độ ăn, tập thể dục đều đặn và theo dõi sức khỏe.";
    }
  }

  return { category, description, advice };
};

export const classifyWHR = (whr, gender) => {
  if (!whr || !gender) {
    return {
      category: "Không xác định",
      description: "Thiếu dữ liệu để phân loại WHR.",
      advice: "Vui lòng cung cấp đầy đủ chỉ số WHR và giới tính.",
    };
  }
  let category = "";
  let description = "";
  let advice = "";
  if (gender === "male") {
    if (whr <= 0.9) {
      category = "Bình thường";
      description = "WHR ở mức an toàn, nguy cơ thấp mắc các bệnh chuyển hóa.";
      advice = "Tiếp tục duy trì lối sống lành mạnh.";
    } else {
      category = "Nguy cơ cao";
      description =
        "WHR cao, tăng nguy cơ mắc bệnh tim mạch, tiểu đường, béo phì.";
      advice =
        "Nên điều chỉnh chế độ ăn, tăng vận động và kiểm tra sức khỏe định kỳ.";
    }
  } else if (gender === "female") {
    if (whr <= 0.85) {
      category = "Bình thường";
      description = "WHR ở mức an toàn, nguy cơ thấp mắc các bệnh chuyển hóa.";
      advice = "Tiếp tục duy trì lối sống lành mạnh.";
    } else {
      category = "Nguy cơ cao";
      description =
        "WHR cao, tăng nguy cơ mắc bệnh tim mạch, tiểu đường, béo phì.";
      advice =
        "Nên điều chỉnh chế độ ăn, tăng vận động và kiểm tra sức khỏe định kỳ.";
    }
  } else {
    category = "Không xác định";
    description = "Giới tính không hợp lệ.";
    advice = "Vui lòng kiểm tra lại thông tin.";
  }
  return { category, description, advice };
};
