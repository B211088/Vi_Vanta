export const caculateBMI = (weight, height) => {
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

export const classifyBMI = (bmi) => {
  if (bmi < 16) return "Gầy độ III (rất gầy)";
  if (bmi < 17) return "Gầy độ II";
  if (bmi < 18.5) return "Gầy độ I";
  if (bmi < 25) return "Bình thường";
  if (bmi < 30) return "Thừa cân";
  if (bmi < 35) return "Béo phì độ I";
  if (bmi < 40) return "Béo phì độ II";
  return "Béo phì độ III (nguy hiểm)";
};
