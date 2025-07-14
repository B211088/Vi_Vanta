import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiResponse.js";

export const registerDoctor = async (doctorData) => {
  // Kiểm tra userId đã đăng ký chưa
  const existed = await Doctor.findOne({ userId: doctorData.userId });
  if (existed) throw new ApiError(400, "Bạn đã gửi yêu cầu hoặc đã là bác sĩ!");

  const doctor = new Doctor(doctorData);
  return await doctor.save();
};

export const getDoctors = async (query = {}, isAdmin = false) => {
  const {
    page = 1,
    limit = 10,
    status,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = query;
  const filter = {};

  if (!isAdmin) filter.status = "active";
  if (status && isAdmin) filter.status = status;
  if (search) filter.$text = { $search: search };

  const skip = (page - 1) * limit;
  const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

  const [doctors, total] = await Promise.all([
    Doctor.find(filter)
      .select("_id name userId specialty infoClinic rate")
      .populate("userId", "avatar")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Doctor.countDocuments(filter),
  ]);
  return {
    doctors,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getPendingDoctors = async () => {
  return Doctor.find({ status: "pending" }).lean();
};

export const approveDoctor = async (id) => {
  const doctor = await Doctor.findByIdAndUpdate(
    id,
    { status: "active" },
    { new: true }
  );
  await User.findByIdAndUpdate(doctor.userId, {
    $addToSet: { roles: "doctor" },
  });
  if (!doctor) throw new ApiError(404, "Không tìm thấy bác sĩ");
  return doctor;
};

export const rejectDoctor = async (id) => {
  const doctor = await Doctor.findByIdAndUpdate(
    id,
    { status: "rejected" },
    { new: true }
  );
  if (!doctor) throw new ApiError(404, "Không tìm thấy bác sĩ");
  return doctor;
};

export const getDoctorById = async (id) => {
  const doctor = await Doctor.findById(id).populate("userId", "avatar").lean();
  if (!doctor) throw new ApiError(404, "Không tìm thấy bác sĩ");
  return doctor;
};

export const getDoctorByUserId = async (userId) => {
  try {
    const doctor = await Doctor.findOne({ userId })
      .populate("userId", "avatar")
      .lean();
    if (!doctor) throw new ApiError(404, "Không tìm thấy bác sĩ");
    return doctor;
  } catch (error) {
    throw new ApiError(404, "Gặp lỗi khi lấy thông tin !");
  }
};
