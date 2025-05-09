export const classifyBMI = (weight, height) => {
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
