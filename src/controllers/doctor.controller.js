import * as doctorService from "../services/doctor.service.js";
import { ApiResponse, ApiError } from "../utils/ApiResponse.js";
import { uploads } from "../utils/uploadImagesToCloud.js";

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

class doctorController {
  registerDoctor = asyncHandler(async (req, res) => {
    try {
      const userId = req.user.userId;
      const file = req.file;
      console.log("payload", req.body);

      if (!file) {
        return res.status(400).json({ message: "Vui lòng chọn ảnh!" });
      }

      const avatar = await uploads(file, userId, "avatar doctor");

      // Process arrays từ FormData
      const processedData = { ...req.body };

      // Convert array fields từ FormData
      [
        "specialty",
        "targetPatients",
        "strengths",
        "experiences",
        "educations",
        "languages",
        "paymentMethods",
      ].forEach((field) => {
        if (req.body[field]) {
          if (Array.isArray(req.body[field])) {
            processedData[field] = req.body[field];
          } else {
            processedData[field] = [req.body[field]];
          }
        }
      });

      // Parse infoClinic JSON
      if (typeof processedData.infoClinic === "string") {
        try {
          processedData.infoClinic = JSON.parse(processedData.infoClinic);
        } catch (err) {
          return res.status(400).json({
            message: "Dữ liệu infoClinic không hợp lệ",
            error: err.message,
          });
        }
      }

      // Validate required fields - UPDATED TO MATCH FRONTEND
      const missingFields = [];

      // Check basic required fields
      if (!processedData.title?.trim()) {
        missingFields.push("title");
      }

      if (!processedData.name?.trim()) {
        missingFields.push("name");
      }

      if (!processedData.info?.trim()) {
        missingFields.push("info");
      }

      if (!processedData.highlights?.trim()) {
        missingFields.push("highlights");
      }

      // Check specialty array
      if (
        !processedData.specialty ||
        !Array.isArray(processedData.specialty) ||
        processedData.specialty.length === 0 ||
        !processedData.specialty.some((s) => s && s.trim())
      ) {
        missingFields.push("specialty");
      }

      // Check infoClinic fields
      if (!processedData.infoClinic?.clinicName?.trim()) {
        missingFields.push("infoClinic.clinicName");
      }

      if (!processedData.infoClinic?.phone?.trim()) {
        missingFields.push("infoClinic.phone");
      }

      if (!processedData.infoClinic?.address?.specificAddress?.trim()) {
        missingFields.push("infoClinic.address.specificAddress");
      }

      if (!processedData.infoClinic?.address?.provinceId) {
        missingFields.push("infoClinic.address.provinceId");
      }

      if (!processedData.infoClinic?.address?.districtId) {
        missingFields.push("infoClinic.address.districtId");
      }

      if (!processedData.infoClinic?.address?.wardId) {
        missingFields.push("infoClinic.address.wardId");
      }

      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Thiếu thông tin bắt buộc: ${missingFields.join(", ")}`,
          missingFields,
        });
      }

      // Clean and filter arrays to remove empty values
      const cleanArrayFields = (arr) => {
        return arr ? arr.filter((item) => item && item.trim()) : [];
      };

      const cleanedData = {
        ...processedData,
        specialty: cleanArrayFields(processedData.specialty),
        targetPatients: cleanArrayFields(processedData.targetPatients),
        strengths: cleanArrayFields(processedData.strengths),
        experiences: cleanArrayFields(processedData.experiences),
        educations: cleanArrayFields(processedData.educations),
        languages: cleanArrayFields(processedData.languages),
        paymentMethods: cleanArrayFields(processedData.paymentMethods),
      };

      const data = {
        ...cleanedData,
        avatar,
      };

      console.log(
        "Processed data before saving:",
        JSON.stringify(data, null, 2)
      );

      const doctor = await doctorService.registerDoctor({
        payload: data,
        userId,
      });

      res
        .status(201)
        .json(
          new ApiResponse(201, doctor, "Gửi yêu cầu đăng ký bác sĩ thành công")
        );
    } catch (error) {
      console.error("Register doctor error:", error);

      // Handle Mongoose validation errors
      if (error.name === "ValidationError") {
        const validationErrors = Object.keys(error.errors).map((key) => ({
          field: key,
          message: error.errors[key].message,
        }));

        return res.status(400).json({
          message: "Dữ liệu không hợp lệ",
          validationErrors,
          error: error.message,
        });
      }

      res
        .status(500)
        .json(
          new ApiResponse(
            500,
            null,
            error.message || "Gửi yêu cầu đăng ký bác sĩ thất bại"
          )
        );
    }
  });

  getDoctors = asyncHandler(async (req, res) => {
    try {
      const result = await doctorService.getDoctors({ ...req.query });

      res
        .status(200)
        .json(new ApiResponse(200, result, "Lấy danh sách bác sĩ thành công"));
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bác sĩ:", error);
      res
        .status(500)
        .json(
          new ApiResponse(500, null, "Đã xảy ra lỗi khi lấy danh sách bác sĩ")
        );
    }
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
    const { id, date } = req.params;
    const doctor = await doctorService.getDoctorById(id, date);
    res
      .status(200)
      .json(new ApiResponse(200, doctor, "Lấy thông tin bác sĩ thành công"));
  });

  getDoctorAvailableSlots = asyncHandler(async (req, res) => {
    const { date } = req.query;
    const { id } = req.params;
    const doctor = await doctorService.getDoctorSlotAvailability(id, date);
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

  updateDoctorPaymentMethodController = asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentMethod } = req.body;

      if (!paymentMethod) {
        throw new ApiError(400, "Vui lòng cung cấp phương thức thanh toán");
      }

      const updatedDoctor = await updateDoctorPaymentMethod(id, paymentMethod);

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedDoctor,
            "Cập nhật phương thức thanh toán thành công"
          )
        );
    } catch (error) {
      console.error("Lỗi cập nhật phương thức thanh toán:", error);
      res
        .status(error.statusCode || 500)
        .json(
          new ApiResponse(
            error.statusCode || 500,
            null,
            error.message || "Lỗi máy chủ"
          )
        );
    }
  });
}

export default doctorController;
