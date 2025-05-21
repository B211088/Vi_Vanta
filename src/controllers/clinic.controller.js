import {
  inviteStaffByIdHandle,
  registerClinicHandle,
  rejectClinicHandle,
  verifyClinicHandle,
  getClinicByIdHandle,
  deleteClinicHandle,
  updateClinicInfoHandle,
  getClinicsHandle,
  getClinicByIdAndStatusHandle,
} from "../services/clinic.service.js";
import {
  addStaffToClinic,
  updateStaffRole,
  removeStaffFromClinic,
  getClinicStaff,
  toggleStaffStatus,
} from "../services/clinicStaff.service.js";
import { uploads } from "../utils/uploadImagesToCloud.js";

// Đăng ký phòng khám mới
export const registerClinic = async (req, res) => {
  try {
    const ownerId = req.user.userId;
    const payload = req.body;
    const { licenses, images, avatar } = req.files;
    console.log({ payload });
    // Kiểm tra input bắt buộc
    if (
      !payload.name ||
      !payload.licenseNumber ||
      !payload["address.wardId"] ||
      !payload["address.districtId"] ||
      !payload["address.provinceId"]
    ) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc!" });
    }

    // Xử lý upload licenses
    let licensesUpload = [];
    if (licenses && licenses.length > 0) {
      licensesUpload = await Promise.all(
        licenses.map((file) => uploads(file, ownerId, "ClinicLicenses"))
      );
      // Nếu có tên giấy phép từ form
      if (payload["licenses.name"]) {
        const licenseNames = Array.isArray(payload["licenses.name"])
          ? payload["licenses.name"]
          : [payload["licenses.name"]];
        licensesUpload = licensesUpload.map((file, idx) => ({
          ...file,
          name: licenseNames[idx] || "",
        }));
      }
    }
    if (licensesUpload.length > 0) payload.licenses = licensesUpload;

    // Xử lý avatar
    if (avatar && avatar.length > 0) {
      const avatarUpload = await uploads(avatar[0], ownerId, "ClinicAvatar");
      if (avatarUpload) payload.avatar = avatarUpload;
    }

    // Xử lý images
    if (images && images.length > 0) {
      const imagesUpload = await Promise.all(
        images.map((image) => uploads(image, ownerId, "ClinicImages")) // ✅ thêm await
      );
      payload.images = imagesUpload;
    }

    const clinic = await registerClinicHandle(ownerId, payload);
    res.status(201).json({ message: "Đăng ký phòng khám thành công", clinic });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Lấy tất cả các phòng khám theo status
export const getClinics = async (req, res) => {
  try {
    const { status = "all", page = 1, limit = 10 } = req.query;
    const result = await getClinicsHandle(
      status,
      parseInt(page),
      parseInt(limit)
    );

    res.json({
      message: `Lấy danh sách phòng khám ${status} thành công`,
      ...result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy chi tiết phòng khám  theo ID
export const getClinicByIdAndStatus = async (req, res) => {
  try {
    const clinicId = req.params.id;
    const { status = "all" } = req.query;

    if (!clinicId) {
      return res.status(400).json({ message: "Thiếu clinicId!" });
    }

    const clinic = await getClinicByIdAndStatusHandle(clinicId, status);
    res.json({
      message: `Lấy thông tin phòng khám ${status} thành công`,
      clinic,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Xác nhận/phê duyệt phòng khám
export const verifyClinic = async (req, res) => {
  try {
    const clinicId = req.params.id;
    const isVerified = req.body.isVerified;

    if (!clinicId || typeof isVerified !== "boolean") {
      return res.status(400).json({
        message: "Thiếu hoặc sai dữ liệu xác nhận!",
      });
    }

    const clinic = await verifyClinicHandle(clinicId, isVerified);
    res.json({
      message: isVerified
        ? "Xác nhận phòng khám thành công"
        : "Hủy xác nhận phòng khám thành công",
      clinic,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Từ chối phòng khám
export const rejectClinic = async (req, res) => {
  try {
    const clinicId = req.params.id;
    const reason = req.body.reason;

    if (!clinicId || !reason) {
      return res.status(400).json({
        message: "Thiếu clinicId hoặc lý do từ chối!",
      });
    }

    const clinic = await rejectClinicHandle(clinicId, reason);
    res.json({
      message: "Từ chối phòng khám thành công",
      clinic,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mời nhân viên vào phòng khám
export const inviteStaffById = async (req, res) => {
  try {
    const clinicId = req.params.clinicId;
    const userId = req.body.userId;
    if (!clinicId || !userId) {
      return res.status(400).json({ message: "Thiếu clinicId hoặc userId!" });
    }
    const staff = await inviteStaffByIdHandle(clinicId, userId);
    res.status(201).json({ message: "Mời nhân viên thành công", staff });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Lấy thông tin phòng khám theo ID
export const getClinicById = async (req, res) => {
  try {
    const clinicId = req.params.id;
    if (!clinicId) return res.status(400).json({ message: "Thiếu clinicId!" });
    const clinic = await getClinicByIdHandle(clinicId);
    res.json({ message: "Lấy thông tin phòng khám thành công", clinic });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Sửa thông tin phòng khám
export const updateClinicBasicInfo = async (req, res) => {
  try {
    const clinicId = req.params.id;
    const updateData = req.body;

    if (!clinicId || !updateData) {
      return res.status(400).json({
        message: "Thiếu clinicId hoặc dữ liệu cập nhật!",
      });
    }

    // Chỉ lấy các trường thông tin cơ bản được phép cập nhật
    const allowedFields = [
      "name",
      "description",
      "phoneNumber",
      "email",
      "services",
      "specialties",
    ];

    const filteredData = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    const clinic = await updateClinicInfoHandle(clinicId, filteredData);
    res.json({
      message: "Cập nhật thông tin phòng khám thành công",
      clinic,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa phòng khám
export const deleteClinic = async (req, res) => {
  try {
    const clinicId = req.params.id;
    const ownerId = req.user._id || req.user.userId;
    if (!clinicId || !ownerId) {
      return res.status(400).json({ message: "Thiếu clinicId hoặc ownerId!" });
    }
    const clinic = await deleteClinicHandle(clinicId, ownerId);
    res.json({ message: "Xóa phòng khám thành công", clinic });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addStaff = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { userId, role } = req.body;

    if (!clinicId || !userId) {
      return res.status(400).json({
        message: "Thiếu thông tin clinicId hoặc userId!",
      });
    }

    const staff = await addStaffToClinic(clinicId, userId, role);
    res.status(201).json({
      message: "Thêm nhân viên thành công",
      data: staff,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      message: error.message,
    });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { userId, role } = req.body;

    if (!clinicId || !userId || !role) {
      return res.status(400).json({
        message: "Thiếu thông tin cần thiết!",
      });
    }

    const staff = await updateStaffRole(clinicId, userId, role);
    res.json({
      message: "Cập nhật vai trò thành công",
      data: staff,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      message: error.message,
    });
  }
};

export const removeStaff = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { userId } = req.body;

    if (!clinicId || !userId) {
      return res.status(400).json({
        message: "Thiếu thông tin clinicId hoặc userId!",
      });
    }

    const result = await removeStaffFromClinic(clinicId, userId);
    res.json({
      message: result.message,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      message: error.message,
    });
  }
};

export const getStaffList = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { role, isActive, page, limit, sortBy, order } = req.query;

    if (!clinicId) {
      return res.status(400).json({
        message: "Thiếu thông tin clinicId!",
      });
    }

    const options = {
      role,
      isActive: isActive === "true",
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      order,
    };

    const result = await getClinicStaff(clinicId, options);
    res.json({
      message: "Lấy danh sách nhân viên thành công",
      ...result,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      message: error.message,
    });
  }
};

export const toggleStatus = async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { userId } = req.body;

    if (!clinicId || !userId) {
      return res.status(400).json({
        message: "Thiếu thông tin clinicId hoặc userId!",
      });
    }

    const staff = await toggleStaffStatus(clinicId, userId);
    res.json({
      message: `${
        staff.isActive ? "Kích hoạt" : "Vô hiệu hóa"
      } tài khoản nhân viên thành công`,
      data: staff,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      message: error.message,
    });
  }
};
