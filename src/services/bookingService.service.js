import BookingService from "../models/bookingService.model.js";
import Doctor from "../models/doctor.model.js";
import { ApiError } from "../utils/ApiResponse.js";

class BookingServiceService {
  // Create a new booking service
  static async createService(serviceData, doctorId) {
    try {
      // Verify doctor exists and belongs to current user
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        throw new ApiError(404, "Bác sĩ không tồn tại");
      }

      // Check if service name already exists for this doctor
      const existingService = await BookingService.findOne({
        doctorId,
        name: serviceData.name,
        isActive: true,
      });

      if (existingService) {
        throw new ApiError(400, "Tên dịch vụ đã tồn tại");
      }

      const service = new BookingService({
        ...serviceData,
        doctorId,
      });

      await service.save();
      await service.populate("doctorId", "name specialty infoClinic");

      return service;
    } catch (error) {
      throw error;
    }
  }

  // Get all services for a doctor
  static async getServicesByDoctor(doctorId, filters = {}) {
    try {
      const {
        isActive,
        category,
        isPopular,
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = filters;

      let query = { doctorId };

      // Apply filters
      if (isActive !== undefined) query.isActive = isActive;
      if (category) query.category = category;
      if (isPopular !== undefined) query.isPopular = isPopular;

      // Sorting
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Pagination
      const skip = (page - 1) * limit;

      const services = await BookingService.find(query)
        .populate("doctorId", "name specialty infoClinic")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await BookingService.countDocuments(query);

      return {
        services,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get service by ID
  static async getServiceById(serviceId) {
    try {
      const service = await BookingService.findById(serviceId).populate(
        "doctorId",
        "name specialty infoClinic rate"
      );

      if (!service) {
        throw new ApiError(404, "Dịch vụ không tồn tại");
      }

      return service;
    } catch (error) {
      throw error;
    }
  }

  // Update service
  static async updateService(serviceId, updateData, doctorId) {
    try {
      const service = await BookingService.findById(serviceId);

      if (!service) {
        throw new ApiError(404, "Dịch vụ không tồn tại");
      }

      if (service.doctorId.toString() !== doctorId.toString()) {
        throw new ApiError(403, "Không có quyền cập nhật dịch vụ này");
      }

      // Check if name is being changed and already exists
      if (updateData.name && updateData.name !== service.name) {
        const existingService = await BookingService.findOne({
          doctorId,
          name: updateData.name,
          _id: { $ne: serviceId },
          isActive: true,
        });

        if (existingService) {
          throw new ApiError(400, "Tên dịch vụ đã tồn tại");
        }
      }

      Object.assign(service, updateData);
      await service.save();
      await service.populate("doctorId", "name specialty infoClinic");

      return service;
    } catch (error) {
      throw error;
    }
  }

  // Soft delete service (set isActive to false)
  static async deleteService(serviceId, doctorId) {
    try {
      const service = await BookingService.findById(serviceId);

      if (!service) {
        throw new ApiError(404, "Dịch vụ không tồn tại");
      }

      if (service.doctorId.toString() !== doctorId.toString()) {
        throw new ApiError(403, "Không có quyền xóa dịch vụ này");
      }

      // Check if there are pending bookings for this service
      // You might want to add this check based on your Booking model
      // const pendingBookings = await Booking.countDocuments({
      //   serviceId,
      //   status: { $in: ['pending', 'confirmed', 'checked-in'] }
      // });

      // if (pendingBookings > 0) {
      //   throw new ApiError(400, "Không thể xóa dịch vụ có lịch hẹn đang chờ");
      // }

      service.isActive = false;
      await service.save();

      return { message: "Xóa dịch vụ thành công" };
    } catch (error) {
      throw error;
    }
  }

  // Hard delete service
  static async hardDeleteService(serviceId, doctorId) {
    try {
      const service = await BookingService.findById(serviceId);

      if (!service) {
        throw new ApiError(404, "Dịch vụ không tồn tại");
      }

      if (service.doctorId.toString() !== doctorId.toString()) {
        throw new ApiError(403, "Không có quyền xóa dịch vụ này");
      }

      await BookingService.findByIdAndDelete(serviceId);

      return { message: "Xóa vĩnh viễn dịch vụ thành công" };
    } catch (error) {
      throw error;
    }
  }

  // Toggle service active status
  static async toggleServiceStatus(serviceId, doctorId) {
    try {
      const service = await BookingService.findById(serviceId);

      if (!service) {
        throw new ApiError(404, "Dịch vụ không tồn tại");
      }

      if (service.doctorId.toString() !== doctorId.toString()) {
        throw new ApiError(
          403,
          "Không có quyền thay đổi trạng thái dịch vụ này"
        );
      }

      await service.toggleActive();
      await service.populate("doctorId", "name specialty infoClinic");

      return service;
    } catch (error) {
      throw error;
    }
  }

  // Search services across all doctors
  static async searchServices(searchTerm, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "bookingCount",
        sortOrder = "desc",
      } = filters;

      const services = await BookingService.searchServices(searchTerm, filters);

      // Apply pagination
      const skip = (page - 1) * limit;
      const paginatedServices = services.skip(skip).limit(parseInt(limit));

      // Get total count
      const total = await BookingService.countDocuments({
        isActive: true,
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { description: { $regex: searchTerm, $options: "i" } },
          { tags: { $in: [new RegExp(searchTerm, "i")] } },
        ],
      });

      // Apply sorting
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
      const sortedServices = await paginatedServices.sort(sortOptions);

      return {
        services: sortedServices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get services by category
  static async getServicesByCategory(category, filters = {}) {
    try {
      const { page = 1, limit = 10 } = filters;

      const skip = (page - 1) * limit;

      const services = await BookingService.findByCategory(category, true)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ bookingCount: -1, isPopular: -1 });

      const total = await BookingService.countDocuments({
        category,
        isActive: true,
      });

      return {
        services,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Get popular services
  static async getPopularServices(limit = 10) {
    try {
      const services = await BookingService.getPopularServices(limit);
      return services;
    } catch (error) {
      throw error;
    }
  }

  // Get service statistics for doctor
  static async getServiceStats(doctorId) {
    try {
      const stats = await BookingService.aggregate([
        { $match: { doctorId: doctorId } },
        {
          $group: {
            _id: null,
            totalServices: { $sum: 1 },
            activeServices: {
              $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
            },
            popularServices: {
              $sum: { $cond: [{ $eq: ["$isPopular", true] }, 1, 0] },
            },
            totalBookings: { $sum: "$bookingCount" },
            averagePrice: { $avg: "$price" },
            maxPrice: { $max: "$price" },
            minPrice: { $min: "$price" },
          },
        },
      ]);

      // Get category breakdown
      const categoryStats = await BookingService.aggregate([
        { $match: { doctorId: doctorId, isActive: true } },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            totalBookings: { $sum: "$bookingCount" },
            averagePrice: { $avg: "$price" },
          },
        },
        { $sort: { count: -1 } },
      ]);

      return {
        overview: stats[0] || {
          totalServices: 0,
          activeServices: 0,
          popularServices: 0,
          totalBookings: 0,
          averagePrice: 0,
          maxPrice: 0,
          minPrice: 0,
        },
        categoryBreakdown: categoryStats,
      };
    } catch (error) {
      throw error;
    }
  }

  // Bulk update services
  static async bulkUpdateServices(serviceIds, updateData, doctorId) {
    try {
      // Verify all services belong to the doctor
      const services = await BookingService.find({
        _id: { $in: serviceIds },
        doctorId,
      });

      if (services.length !== serviceIds.length) {
        throw new ApiError(
          400,
          "Một số dịch vụ không tồn tại hoặc không thuộc về bác sĩ"
        );
      }

      const result = await BookingService.updateMany(
        {
          _id: { $in: serviceIds },
          doctorId,
        },
        updateData
      );

      return {
        message: `Cập nhật thành công ${result.modifiedCount} dịch vụ`,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      throw error;
    }
  }

  // Duplicate service
  static async duplicateService(serviceId, doctorId) {
    try {
      const originalService = await BookingService.findById(serviceId);

      if (!originalService) {
        throw new ApiError(404, "Dịch vụ không tồn tại");
      }

      if (originalService.doctorId.toString() !== doctorId.toString()) {
        throw new ApiError(403, "Không có quyền sao chép dịch vụ này");
      }

      const duplicatedService = new BookingService({
        ...originalService.toObject(),
        _id: undefined,
        name: `${originalService.name} (Copy)`,
        bookingCount: 0,
        isPopular: false,
        createdAt: undefined,
        updatedAt: undefined,
      });

      await duplicatedService.save();
      await duplicatedService.populate("doctorId", "name specialty infoClinic");

      return duplicatedService;
    } catch (error) {
      throw error;
    }
  }
}

export default BookingServiceService;
