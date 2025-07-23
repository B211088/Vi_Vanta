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
    const result = await doctorService.getDoctors(req.query);

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
  createWorkingHour = asyncHandler(async (req, res) => {
    const workingHour = await doctorService.createWorkingHour(req.body);
    res
      .status(201)
      .json(new ApiResponse(201, workingHour, "Tạo lịch làm việc thành công"));
  });

  // Lấy lịch làm việc của bác sĩ
  getWorkingHoursByDoctorId = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const workingHours = await doctorService.getWorkingHoursByDoctorId(
      doctorId,
      req.query
    );
    res
      .status(200)
      .json(new ApiResponse(200, workingHours, "Lấy lịch làm việc thành công"));
  });

  // Lấy lịch làm việc theo khoảng thời gian
  getWorkingHoursByDateRange = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new ApiError(400, "Vui lòng cung cấp startDate và endDate");
    }

    const workingHours = await doctorService.getWorkingHoursByDateRange(
      doctorId,
      startDate,
      endDate
    );
    res
      .status(200)
      .json(new ApiResponse(200, workingHours, "Lấy lịch làm việc thành công"));
  });

  // Cập nhật lịch làm việc
  updateWorkingHour = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const workingHour = await doctorService.updateWorkingHour(id, req.body);
    res
      .status(200)
      .json(
        new ApiResponse(200, workingHour, "Cập nhật lịch làm việc thành công")
      );
  });

  deleteWorkingHour = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deletedWorkingHour = await doctorService.deleteWorkingHour(id);

    res
      .status(200)
      .json(
        new ApiResponse(200, deletedWorkingHour, "Xóa lịch làm việc thành công")
      );
  });

  // Cập nhật trạng thái slot thời gian
  updateTimeSlotAvailability = asyncHandler(async (req, res) => {
    const { id, slotIndex } = req.params;
    const { isAvailable } = req.body;

    const workingHour = await doctorService.updateTimeSlotAvailability(
      id,
      parseInt(slotIndex),
      isAvailable
    );
    res
      .status(200)
      .json(
        new ApiResponse(200, workingHour, "Cập nhật trạng thái slot thành công")
      );
  });

  // Thêm slot thời gian
  addTimeSlot = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const workingHour = await doctorService.addTimeSlot(id, req.body);
    res
      .status(200)
      .json(
        new ApiResponse(200, workingHour, "Thêm slot thời gian thành công")
      );
  });

  // Xóa slot thời gian
  removeTimeSlot = asyncHandler(async (req, res) => {
    const { id, slotIndex } = req.params;
    const workingHour = await doctorService.removeTimeSlot(
      id,
      parseInt(slotIndex)
    );
    res
      .status(200)
      .json(new ApiResponse(200, workingHour, "Xóa slot thời gian thành công"));
  });

  // Xóa lịch làm việc
  deleteHardWorkingHour = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const workingHour = await doctorService.deleteHardWorkingHour(id);
    res
      .status(200)
      .json(new ApiResponse(200, workingHour, "Xóa lịch làm việc thành công"));
  });

  // Lấy lịch làm việc theo ID
  getWorkingHourById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const workingHour = await doctorService.getWorkingHourById(id);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          workingHour,
          "Lấy thông tin lịch làm việc thành công"
        )
      );
  });

  // Lấy slot thời gian có sẵn
  getAvailableTimeSlots = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      throw new ApiError(400, "Vui lòng cung cấp ngày");
    }

    const availableSlots = await doctorService.getAvailableTimeSlots(
      doctorId,
      date
    );
    res
      .status(200)
      .json(new ApiResponse(200, availableSlots, "Lấy slot có sẵn thành công"));
  });

  // Tạo lịch làm việc mặc định
  createDefaultWorkingSchedule = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const workingHours = await doctorService.createDefaultWorkingSchedule(
      doctorId
    );
    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          workingHours,
          "Tạo lịch làm việc mặc định thành công"
        )
      );
  });

  // Lấy thống kê lịch làm việc
  getWorkingHourStats = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const stats = await doctorService.getWorkingHourStats(doctorId);
    res
      .status(200)
      .json(
        new ApiResponse(200, stats, "Lấy thống kê lịch làm việc thành công")
      );
  });

  // Lấy lịch làm việc của bác sĩ hiện tại (dành cho doctor role)
  getMyWorkingHours = asyncHandler(async (req, res) => {
    // Lấy doctorId từ userId trong token
    const userId = req.user.userId;
    const doctorService = await import("../services/doctor.service.js");
    const doctor = await doctorService.getDoctorByUserId(userId);

    const workingHours = await doctorService.getMyWorkingHours(doctor._id);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          workingHours,
          "Lấy lịch làm việc của tôi thành công"
        )
      );
  });

  // Tạo lịch làm việc cho chính mình (dành cho doctor role)
  createMyWorkingHour = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const doctorService = await import("../services/doctor.service.js");
    const doctor = await doctorService.getDoctorByUserId(userId);

    const workingHour = await doctorService.createWorkingHour({
      ...req.body,
      doctorId: doctor._id,
    });
    res
      .status(201)
      .json(new ApiResponse(201, workingHour, "Tạo lịch làm việc thành công"));
  });

  // Cập nhật lịch làm việc của chính mình
  updateMyWorkingHour = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    const doctor = await doctorService.getDoctorByUserId(userId);

    // Kiểm tra xem lịch làm việc có thuộc về bác sĩ này không
    const workingHour = await doctorService.getWorkingHourById(id);

    if (workingHour.doctorId._id.toString() !== doctor._id.toString()) {
      throw new ApiError(403, "Bạn không có quyền cập nhật lịch làm việc này");
    }

    const updatedWorkingHour = await doctorService.updateWorkingHour(
      id,
      req.body
    );
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedWorkingHour,
          "Cập nhật lịch làm việc thành công"
        )
      );
  });
}

export default doctorController;
