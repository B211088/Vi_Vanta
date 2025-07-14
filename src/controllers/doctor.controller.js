import * as doctorService from "../services/doctor.service.js";
import { ApiResponse, ApiError } from "../utils/ApiResponse.js";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

class doctorController {
  registerDoctor = asyncHandler(async (req, res) => {
    const doctor = await doctorService.registerDoctor({
      ...req.body,
      userId: req.user.userId,
    });
    res
      .status(201)
      .json(
        new ApiResponse(201, doctor, "Gửi yêu cầu đăng ký bác sĩ thành công")
      );
  });

  getDoctors = asyncHandler(async (req, res) => {
    const isAdmin = req.user?.role === "admin";
    const result = await doctorService.getDoctors(req.query, isAdmin);
    res
      .status(200)
      .json(new ApiResponse(200, result, "Lấy danh sách bác sĩ thành công"));
  });

  getPendingDoctors = asyncHandler(async (req, res) => {
    const doctors = await doctorService.getPendingDoctors();
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          doctors,
          "Lấy danh sách bác sĩ chờ duyệt thành công"
        )
      );
  });

  approveDoctor = asyncHandler(async (req, res) => {
    const doctor = await doctorService.approveDoctor(req.params.id);
    res
      .status(200)
      .json(new ApiResponse(200, doctor, "Duyệt bác sĩ thành công"));
  });

  rejectDoctor = asyncHandler(async (req, res) => {
    const doctor = await doctorService.rejectDoctor(req.params.id);
    res
      .status(200)
      .json(new ApiResponse(200, doctor, "Từ chối bác sĩ thành công"));
  });

  getDoctorById = asyncHandler(async (req, res) => {
    const doctor = await doctorService.getDoctorById(req.params.id);
    res
      .status(200)
      .json(new ApiResponse(200, doctor, "Lấy thông tin bác sĩ thành công"));
  });

  getDoctorByUserId = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const doctor = await doctorService.getDoctorByUserId(userId);
    res
      .status(200)
      .json(new ApiResponse(200, doctor, "Lấy thông tin bác sĩ thành công"));
  });
}

export default doctorController;
