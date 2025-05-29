export const CLINIC_STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  REJECTED: "rejected",
};

export const VALID_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const TIME_REGEX = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
export const activityFactors = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};
export const CREATE_CALCULATION_LIMIT = 10;
