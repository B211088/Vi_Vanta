import { ClinicStaff, User, Clinic } from "../models/index.js";

class ClinicStaffError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ClinicStaffError";
  }
}

export const addStaffToClinic = async (clinicId, userId, role = "staff") => {
  try {
    // Check if clinic and user exist
    const [clinic, user] = await Promise.all([
      Clinic.findById(clinicId),
      User.findById(userId),
    ]);

    if (!clinic) throw new ClinicStaffError("Không tìm thấy phòng khám", 404);
    if (!user) throw new ClinicStaffError("Không tìm thấy người dùng", 404);

    // Check if user is already staff at this clinic
    const existingStaff = await ClinicStaff.findOne({
      clinicId,
      userId,
      deleted: false,
    });

    if (existingStaff) {
      throw new ClinicStaffError(
        "Người dùng đã là nhân viên của phòng khám này"
      );
    }

    // Add staff
    const clinicStaff = new ClinicStaff({
      clinicId,
      userId,
      role,
      isActive: true,
    });

    await clinicStaff.save();
    return clinicStaff;
  } catch (error) {
    throw error instanceof ClinicStaffError
      ? error
      : new ClinicStaffError(error.message);
  }
};

export const updateStaffRole = async (clinicId, userId, newRole) => {
  try {
    const validRoles = ["staff", "manager", "admin"];
    if (!validRoles.includes(newRole)) {
      throw new ClinicStaffError("Vai trò không hợp lệ");
    }

    const staff = await ClinicStaff.findOne({
      clinicId,
      userId,
      deleted: false,
    });

    if (!staff) {
      throw new ClinicStaffError("Không tìm thấy nhân viên", 404);
    }

    if (staff.role === "owner") {
      throw new ClinicStaffError(
        "Không thể thay đổi vai trò của chủ phòng khám"
      );
    }

    staff.role = newRole;
    await staff.save();
    return staff;
  } catch (error) {
    throw error instanceof ClinicStaffError
      ? error
      : new ClinicStaffError(error.message);
  }
};

export const removeStaffFromClinic = async (clinicId, userId) => {
  try {
    const staff = await ClinicStaff.findOne({
      clinicId,
      userId,
      deleted: false,
    });

    if (!staff) {
      throw new ClinicStaffError("Không tìm thấy nhân viên", 404);
    }

    if (staff.role === "owner") {
      throw new ClinicStaffError("Không thể xóa chủ phòng khám");
    }

    staff.deleted = true;
    staff.isActive = false;
    await staff.save();
    return { message: "Đã xóa nhân viên khỏi phòng khám" };
  } catch (error) {
    throw error instanceof ClinicStaffError
      ? error
      : new ClinicStaffError(error.message);
  }
};

export const getClinicStaff = async (clinicId, options = {}) => {
  try {
    const {
      role,
      isActive,
      page = 1,
      limit = 10,
      sortBy = "joinedAt",
      order = "desc",
    } = options;

    const query = { clinicId, deleted: false };
    if (role) query.role = role;
    if (typeof isActive === "boolean") query.isActive = isActive;

    const [staff, total] = await Promise.all([
      ClinicStaff.find(query)
        .populate("userId", "fullName email phone avatar")
        .sort({ [sortBy]: order === "desc" ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      ClinicStaff.countDocuments(query),
    ]);

    return {
      data: staff,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };
  } catch (error) {
    throw new ClinicStaffError("Lỗi khi lấy danh sách nhân viên");
  }
};

export const toggleStaffStatus = async (clinicId, userId) => {
  try {
    const staff = await ClinicStaff.findOne({
      clinicId,
      userId,
      deleted: false,
    });

    if (!staff) {
      throw new ClinicStaffError("Không tìm thấy nhân viên", 404);
    }

    if (staff.role === "owner") {
      throw new ClinicStaffError(
        "Không thể thay đổi trạng thái của chủ phòng khám"
      );
    }

    staff.isActive = !staff.isActive;
    await staff.save();
    return staff;
  } catch (error) {
    throw error instanceof ClinicStaffError
      ? error
      : new ClinicStaffError(error.message);
  }
};
