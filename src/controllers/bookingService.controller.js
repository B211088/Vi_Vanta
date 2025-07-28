import Doctor from "../models/doctor.model.js";
import BookingServiceService from "../services/bookingService.service.js";

import { ApiError, ApiResponse, asyncHandler } from "../utils/ApiResponse.js";

class BookingServiceController {
  // Create a new booking service
  static createService = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const serviceData = req.body;

    // Verify doctor belongs to current user (if user is doctor)
    if (req.user.role === "doctor") {
      const doctor = await Doctor.findOne({
        _id: doctorId,
        userId: req.user.userId,
      });

      if (!doctor) {
        throw new ApiError(403, "Không có quyền tạo dịch vụ cho bác sĩ này");
      }
    }

    const service = await BookingServiceService.createService(
      serviceData,
      doctorId
    );

    res
      .status(201)
      .json(new ApiResponse(201, service, "Tạo dịch vụ thành công"));
  });

  // Get all services for a doctor
  static getServicesByDoctor = asyncHandler(async (req, res) => {
    const { doctorId } = req.params;
    const filters = req.query;

    const result = await BookingServiceService.getServicesByDoctor(
      doctorId,
      filters
    );

    res
      .status(200)
      .json(new ApiResponse(200, result, "Lấy danh sách dịch vụ thành công"));
  });

  // Get my services (for doctor role)
  static getMyServices = asyncHandler(async (req, res) => {
    const filters = req.query;
    const { doctorId } = req.params;
    // Get doctor by userId

    const result = await BookingServiceService.getServicesByDoctor(
      doctorId,
      filters
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Lấy danh sách dịch vụ của tôi thành công")
      );
  });

  // Get service by ID
  static getServiceById = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    const service = await BookingServiceService.getServiceById(serviceId);

    res
      .status(200)
      .json(new ApiResponse(200, service, "Lấy thông tin dịch vụ thành công"));
  });

  // Update service
  static updateService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const updateData = req.body;

    // Get doctor by userId
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    if (!doctor) {
      throw new ApiError(404, "Không tìm thấy thông tin bác sĩ");
    }

    const service = await BookingServiceService.updateService(
      serviceId,
      updateData,
      doctor._id
    );

    res
      .status(200)
      .json(new ApiResponse(200, service, "Cập nhật dịch vụ thành công"));
  });

  // Delete service (soft delete)
  static deleteService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    // Get doctor by userId
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    if (!doctor) {
      throw new ApiError(404, "Không tìm thấy thông tin bác sĩ");
    }

    const result = await BookingServiceService.deleteService(
      serviceId,
      doctor._id
    );

    res
      .status(200)
      .json(new ApiResponse(200, result, "Xóa dịch vụ thành công"));
  });

  // Hard delete service
  static hardDeleteService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    // Get doctor by userId
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    if (!doctor) {
      throw new ApiError(404, "Không tìm thấy thông tin bác sĩ");
    }

    const result = await BookingServiceService.hardDeleteService(
      serviceId,
      doctor._id
    );

    res
      .status(200)
      .json(new ApiResponse(200, result, "Xóa vĩnh viễn dịch vụ thành công"));
  });

  // Toggle service status
  static toggleServiceStatus = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    // Get doctor by userId
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    if (!doctor) {
      throw new ApiError(404, "Không tìm thấy thông tin bác sĩ");
    }

    const service = await BookingServiceService.toggleServiceStatus(
      serviceId,
      doctor._id
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, service, "Thay đổi trạng thái dịch vụ thành công")
      );
  });

  // Search services
  static searchServices = asyncHandler(async (req, res) => {
    const { q: searchTerm } = req.query;
    const filters = req.query;

    if (!searchTerm) {
      throw new ApiError(400, "Từ khóa tìm kiếm không được để trống");
    }

    const result = await BookingServiceService.searchServices(
      searchTerm,
      filters
    );

    res
      .status(200)
      .json(new ApiResponse(200, result, "Tìm kiếm dịch vụ thành công"));
  });

  // Get services by category

  // Get popular services
  static getPopularServices = asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;

    const services = await BookingServiceService.getPopularServices(
      parseInt(limit)
    );

    res
      .status(200)
      .json(new ApiResponse(200, services, "Lấy dịch vụ phổ biến thành công"));
  });

  // Get service statistics
  static getServiceStats = asyncHandler(async (req, res) => {
    // Get doctor by userId
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    if (!doctor) {
      throw new ApiError(404, "Không tìm thấy thông tin bác sĩ");
    }

    const stats = await BookingServiceService.getServiceStats(doctor._id);

    res
      .status(200)
      .json(new ApiResponse(200, stats, "Lấy thống kê dịch vụ thành công"));
  });

  // Bulk update services
  static bulkUpdateServices = asyncHandler(async (req, res) => {
    const { serviceIds, updateData } = req.body;

    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      throw new ApiError(400, "Danh sách ID dịch vụ không hợp lệ");
    }

    // Get doctor by userId
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    if (!doctor) {
      throw new ApiError(404, "Không tìm thấy thông tin bác sĩ");
    }

    const result = await BookingServiceService.bulkUpdateServices(
      serviceIds,
      updateData,
      doctor._id
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, result, "Cập nhật hàng loạt dịch vụ thành công")
      );
  });

  // Duplicate service
  static duplicateService = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    // Get doctor by userId
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    if (!doctor) {
      throw new ApiError(404, "Không tìm thấy thông tin bác sĩ");
    }

    const service = await BookingServiceService.duplicateService(
      serviceId,
      doctor._id
    );

    res
      .status(201)
      .json(new ApiResponse(201, service, "Sao chép dịch vụ thành công"));
  });

  // Get all categories
  static getCategories = asyncHandler(async (req, res) => {
    const categories = [
      { value: "consultation", label: "Tư vấn", icon: "💬" },
      { value: "examination", label: "Khám bệnh", icon: "🔍" },
      { value: "treatment", label: "Điều trị", icon: "💊" },
      { value: "surgery", label: "Phẫu thuật", icon: "🏥" },
      { value: "diagnostic", label: "Chẩn đoán", icon: "📋" },
      { value: "therapy", label: "Trị liệu", icon: "🩺" },
      { value: "vaccination", label: "Tiêm chủng", icon: "💉" },
      { value: "other", label: "Khác", icon: "📝" },
    ];

    res
      .status(200)
      .json(
        new ApiResponse(200, categories, "Lấy danh sách danh mục thành công")
      );
  });

  // Get service analytics
  static getServiceAnalytics = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const { period = "30d" } = req.query; // 7d, 30d, 90d, 1y

    // Get doctor by userId
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    if (!doctor) {
      throw new ApiError(404, "Không tìm thấy thông tin bác sĩ");
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // This would require integration with your Booking model
    // For now, returning mock data structure
    const analytics = {
      serviceId,
      period,
      dateRange: { startDate, endDate },
      metrics: {
        totalBookings: 0,
        revenue: 0,
        averageRating: 0,
        completionRate: 0,
        cancellationRate: 0,
      },
      trends: {
        bookingsByDate: [],
        revenueByDate: [],
        ratingsByDate: [],
      },
    };

    res
      .status(200)
      .json(
        new ApiResponse(200, analytics, "Lấy phân tích dịch vụ thành công")
      );
  });

  // Export services to CSV/Excel
  static exportServices = asyncHandler(async (req, res) => {
    const { format = "csv" } = req.query;

    // Get doctor by userId
    const doctor = await Doctor.findOne({ userId: req.user.userId });
    if (!doctor) {
      throw new ApiError(404, "Không tìm thấy thông tin bác sĩ");
    }

    const result = await BookingServiceService.getServicesByDoctor(doctor._id, {
      limit: 1000, // Get all services
    });

    // Convert services to export format
    const exportData = result.services.map((service) => ({
      "Tên dịch vụ": service.name,
      "Mô tả": service.description,
      "Giá (VND)": service.price,
      "Thời gian (phút)": service.duration,
      "Danh mục": service.category,
      "Trạng thái": service.isActive ? "Hoạt động" : "Không hoạt động",
      "Phổ biến": service.isPopular ? "Có" : "Không",
      "Số lượt đặt": service.bookingCount,
      Tags: service.tags.join(", "),
      "Ngày tạo": service.createdAt.toLocaleDateString("vi-VN"),
      "Ngày cập nhật": service.updatedAt.toLocaleDateString("vi-VN"),
    }));

    if (format === "csv") {
      // Set CSV headers
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=services.csv");

      // Convert to CSV (you would use a CSV library like 'csv-writer')
      // For now, returning JSON with instruction
      res
        .status(200)
        .json(new ApiResponse(200, exportData, "Dữ liệu xuất CSV thành công"));
    } else {
      res
        .status(200)
        .json(
          new ApiResponse(200, exportData, "Xuất dữ liệu dịch vụ thành công")
        );
    }
  });
}

export default BookingServiceController;
