import { Clinic, ClinicStaff, User, Notification } from "../models/index.js";
import { deleteFromCloudinary } from "../utils/uploadImagesToCloud.js";
// Hàm chuyển đổi payload từ form-data sang object chuẩn cho Clinic
function normalizeClinicPayload(payload) {
  const {
    name,
    description,
    phoneNumber,
    email,
    website,
    specialties = [],
    services = [],
    licenses = [],
    images = [],
    avatar,
  } = payload;

  return {
    name,
    description,
    address: {
      wardId: payload["address.wardId"],
      districtId: payload["address.districtId"],
      provinceId: payload["address.provinceId"],
      specialAddress: payload["address.specialAddress"],
    },
    location: {
      type: "Point",
      coordinates:
        typeof payload["location.coordinates"] === "string"
          ? payload["location.coordinates"].split(",").map(Number)
          : [0, 0],
    },
    workingHours: payload["workingHours[0].day"]
      ? {
          day: payload["workingHours[0].day"],
          open: payload["workingHours[0].open"],
          close: payload["workingHours[0].close"],
        }
      : payload["workingHours.day"]
      ? {
          day: payload["workingHours.day"],
          open: payload["workingHours.open"],
          close: payload["workingHours.close"],
        }
      : {},
    phoneNumber,
    email,
    website,
    specialties: Array.isArray(specialties)
      ? specialties
      : [specialties].filter(Boolean),
    services: Array.isArray(services) ? services : [services].filter(Boolean),
    licenses,
    images,
    avatar,
  };
}

// Đăng ký phòng khám mới
export const registerClinicHandle = async (ownerId, payload) => {
  try {
    // Chuẩn hóa lại payload
    const normalizedPayload = normalizeClinicPayload(payload);

    const existed = await Clinic.findOne({
      ownerId,
    });
    if (existed) throw new Error("Người dùng đã đăng ký phòng khám!");

    const newClinic = new Clinic({
      ...normalizedPayload,
      ownerId,
      isVerified: false,
      status: "pending",
    });
    await newClinic.save();
    return newClinic;
  } catch (error) {
    console.error("Lỗi khi đăng ký phòng khám:", error.message);
    throw new Error(error.message || "Lỗi khi đăng ký phòng khám");
  }
};

// Hợp nhất getAllPendingClinicsHandle và getAllActiveClinicsHandle
export const getClinicsHandle = async (
  status = "all",
  page = 1,
  limit = 10
) => {
  try {
    let query = {};
    if (status === "pending") {
      query = { $or: [{ status: "pending" }] };
    } else if (status === "active") {
      query = { $or: [{ status: "active" }, { isVerified: true }] };
    } else if (status === "rejected") {
      query = { status: "rejected" };
    } else if (status === "all") {
      query = {};
    } else {
      throw new Error("Trạng thái không hợp lệ!");
    }

    const skip = (page - 1) * limit;

    const [clinics, total] = await Promise.all([
      Clinic.find(query)
        .select(
          "avatar name licenseNumber phoneNumber description services specialties"
        )
        .populate("ownerId", "fullName email phone")
        .populate(
          "address.wardId address.districtId address.provinceId",
          "name"
        )
        .skip(skip)
        .limit(limit)
        .lean(),
      Clinic.countDocuments(query),
    ]);

    return {
      data: clinics,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  } catch (error) {
    throw new Error(
      `Lỗi khi lấy danh sách phòng khám ${status}: ${error.message}`
    );
  }
};

// Hợp nhất getPendingClinicByIdHandle và getActiveClinicByIdHandle
export const getClinicByIdAndStatusHandle = async (
  clinicId,
  status = "all"
) => {
  try {
    let query = { _id: clinicId };
    if (status === "pending") {
      query.$or = [{ status: "pending" }, { isVerified: false }];
    } else if (status === "active") {
      query.$or = [{ status: "active" }, { isVerified: true }];
    }

    const clinic = await Clinic.findOne(query)
      .populate("ownerId", "fullName email phone")
      .populate("address.wardId address.districtId address.provinceId", "name")
      .lean();

    if (!clinic) {
      throw new Error(`Không tìm thấy phòng khám ${status}`);
    }
    return clinic;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Xác nhận/phê duyệt phòng khám (chỉ admin mới được xác nhận)
// Đồng thời thêm role "clinic" cho user chủ phòng khám nếu chưa có
export const verifyClinicHandle = async (clinicId, isVerified = true) => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(
      clinicId,
      {
        isVerified,
        status: isVerified ? "active" : "pending",
      },
      { new: true }
    );
    if (!clinic) throw new Error("Không tìm thấy phòng khám để xác nhận!");

    // Thêm role "clinic" cho user chủ phòng khám nếu chưa có
    if (isVerified && clinic.ownerId) {
      const user = await User.findById(clinic.ownerId);
      if (user && (!user.roles || !user.roles.includes("clinic"))) {
        user.roles = Array.isArray(user.roles)
          ? [...user.roles, "clinic"]
          : ["clinic"];
        await user.save();
      }
    }

    if (isVerified && clinic.ownerId) {
      const staff = {
        userId: clinic.ownerId,
        clinicId,
        role: "owner",
      };

      const existingStaff = await ClinicStaff.findOne({
        userId: staff.userId,
        clinicId: staff.clinicId,
      });

      if (existingStaff) {
        existingStaff.role = staff.role;
        existingStaff.isActive = true;
        existingStaff.deleted = false;
        await existingStaff.save();
      } else {
        staff.isActive = true;
        staff.deleted = false;
        staff.role = staff.role;
        const newStaff = new ClinicStaff(staff);
        await newStaff.save();
      }
    }

    return clinic;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi xác nhận phòng khám");
  }
};

// Từ chối/phê duyệt không phòng khám (chỉ admin mới được từ chối) và gửi thông báo cho chủ phòng khám
export const rejectClinicHandle = async (clinicId, reason = "") => {
  try {
    const clinic = await Clinic.findByIdAndUpdate(
      clinicId,
      {
        isVerified: false,
        status: "rejected",
      },
      { new: true }
    );
    if (!clinic) throw new Error("Không tìm thấy phòng khám để từ chối!");

    // Gửi thông báo cho chủ phòng khám
    await Notification.create({
      userId: clinic.ownerId,
      clinicId: clinic._id,
      type: "system",
      title: "Phòng khám bị từ chối xác nhận",
      message: `Phòng khám "${clinic.name}" đã bị từ chối xác nhận. Lý do: ${reason}`,
      data: { clinicId: clinic._id, reason },
    });

    return clinic;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi từ chối phòng khám");
  }
};

export const inviteStaffByIdHandle = async (clinicId, userId) => {
  // Kiểm tra user có tồn tại không
  const user = await User.findById(userId);
  if (!user) throw new Error("Không tìm thấy người dùng với ID này!");

  // Kiểm tra đã là nhân viên chưa
  let staff = await ClinicStaff.findOne({ clinicId, userId });
  if (staff) {
    if (staff.deleted) {
      staff.deleted = false;
      staff.isActive = true;
      await staff.save();
      return staff;
    }
    throw new Error("Người dùng này đã là nhân viên của phòng khám!");
  }

  // Tạo mới nhân viên
  staff = new ClinicStaff({ clinicId, userId, isActive: true });
  await staff.save();
  return staff;
};

// Lấy thông tin phòng khám theo ID
export const getClinicByIdHandle = async (clinicId) => {
  try {
    const clinic = await Clinic.findById(clinicId)
      .populate("ownerId", "fullName email phone")
      .populate("address.wardId address.districtId address.provinceId", "name")
      .lean();
    if (!clinic) throw new Error("Không tìm thấy phòng khám!");
    return clinic;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi lấy thông tin phòng khám");
  }
};

// Cập nhật phòng khám: tách cập nhật avatar, images, thông tin cơ bản, địa chỉ
export const updateClinicInfoHandle = async (clinicId, updateData) => {
  try {
    const clinic = await Clinic.findById(clinicId);
    if (!clinic) throw new Error("Không tìm thấy phòng khám!");

    // Chỉ cập nhật các trường cơ bản này nếu có trong updateData
    const fields = [
      "name",
      "description",
      "phoneNumber",
      "email",
      "services",
      "specialties",
    ];
    fields.forEach((field) => {
      if (updateData[field] !== undefined) {
        clinic[field] = updateData[field];
      }
    });

    const updateClinic = await Clinic.findByIdAndUpdate(
      clinicId,
      {
        $set: {
          name: clinic.name,
          description: clinic.description,
          phoneNumber: clinic.phoneNumber,
          email: clinic.email,
          services: clinic.services,
          specialties: clinic.specialties,
        },
      },
      { new: true }
    );
    return updateClinic;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi cập nhật thông tin phòng khám");
  }
};

//Cập nhật lịch làm việc
export const updateClinicWorkingHoursHandle = async (
  clinicId,
  workingHours
) => {
  try {
    const clinic = await Clinic.findById(clinicId);
    if (!clinic) throw new Error("Không tìm thấy phòng khám!");

    // Kiểm tra định dạng workingHours hợp lệ
    if (
      !workingHours ||
      !workingHours.day ||
      !workingHours.open ||
      !workingHours.close
    ) {
      throw new Error("Thông tin lịch làm việc không hợp lệ!");
    }

    // Kiểm tra định dạng giờ hợp lệ (HH:mm)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (
      !timeRegex.test(workingHours.open) ||
      !timeRegex.test(workingHours.close)
    ) {
      throw new Error("Định dạng giờ không hợp lệ! Sử dụng định dạng HH:mm");
    }

    // Kiểm tra ngày hợp lệ
    const validDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    if (!validDays.includes(workingHours.day)) {
      throw new Error("Ngày trong tuần không hợp lệ!");
    }

    // Kiểm tra giờ mở cửa phải sớm hơn giờ đóng cửa
    const [openHour, openMin] = workingHours.open.split(":").map(Number);
    const [closeHour, closeMin] = workingHours.close.split(":").map(Number);
    if (
      openHour > closeHour ||
      (openHour === closeHour && openMin >= closeMin)
    ) {
      throw new Error("Giờ mở cửa phải sớm hơn giờ đóng cửa!");
    }

    // Cập nhật lịch làm việc
    clinic.workingHours = workingHours;
    await clinic.save();

    return clinic;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi cập nhật lịch làm việc");
  }
};

// Xóa phòng khám (chỉ chủ phòng khám hoặc admin)
export const deleteClinicHandle = async (clinicId, ownerId) => {
  try {
    const clinic = await Clinic.findOneAndDelete({ _id: clinicId, ownerId });
    if (!clinic)
      throw new Error("Không tìm thấy phòng khám hoặc không có quyền xóa!");
    return clinic;
  } catch (error) {
    throw new Error(error.message || "Lỗi khi xóa phòng khám");
  }
};
