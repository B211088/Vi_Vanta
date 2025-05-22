export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (
      !req.user ||
      !req.user.roles ||
      !roles.some((role) => req.user.roles.includes(role))
    ) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }
    next();
  };
};

import { ClinicStaff } from "../models/index.js";

export const authorizeClinicStaff = (allowedRoles = []) => {
  return async (req, res, next) => {
    const userId = req.user.userId;
    const clinicId = req.params.clinicId || req.body.clinicId || req.params.id;
    if (!clinicId) return res.status(400).json({ message: "Thiếu clinicId" });

    const staff = await ClinicStaff.findOne({
      userId,
      clinicId,
      isActive: true,
      deleted: false,
    });
    if (!staff || (allowedRoles.length && !allowedRoles.includes(staff.role))) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền truy cập phòng khám này" });
    }
    req.clinicStaff = staff;
    next();
  };
};
