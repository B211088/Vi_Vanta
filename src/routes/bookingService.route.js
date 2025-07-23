import express from "express";
import BookingServiceController from "../controllers/bookingService.controller.js";

import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = express.Router();

// ================== PUBLIC ROUTES ==================

// Get all categories
router.get("/categories", BookingServiceController.getCategories);

// Search services across all doctors
router.get(
  "/search",

  BookingServiceController.searchServices
);

// Get services by category
router.get(
  "/category/:category",

  BookingServiceController.getServicesByCategory
);

// Get popular services
router.get("/popular", BookingServiceController.getPopularServices);

// Get specific service by ID (public view)
router.get(
  "/:serviceId",

  BookingServiceController.getServiceById
);

// Get services for a specific doctor (public view)
router.get(
  "/doctor/:doctorId",

  BookingServiceController.getServicesByDoctor
);

// ================== PROTECTED ROUTES ==================

// All routes below require authentication
router.use(verifyToken);

// ================== DOCTOR ROUTES ==================

// Get my services (doctor only)
router.get(
  "/my/service/:doctorId",
  verifyToken,
  authorizeRoles("doctor"),

  BookingServiceController.getMyServices
);

// Get my service statistics (doctor only)
router.get(
  "/my/stats/:doctorId",
  verifyToken,
  authorizeRoles("doctor"),
  BookingServiceController.getServiceStats
);

// Export my services (doctor only)
router.get(
  "/my/export/:doctorId",
  verifyToken,
  authorizeRoles("doctor"),
  BookingServiceController.exportServices
);

// Create new service for myself (doctor only)
router.post(
  "/my/create/:doctorId",
  authorizeRoles("doctor"),

  BookingServiceController.createService
);

// Update my service (doctor only)
router.put(
  "/my/:serviceId",
  verifyToken,
  authorizeRoles("doctor"),

  BookingServiceController.updateService
);

// Toggle my service status (doctor only)
router.patch(
  "/my/:serviceId/toggle",
  verifyToken,
  authorizeRoles("doctor"),

  BookingServiceController.toggleServiceStatus
);

// Duplicate my service (doctor only)
router.post(
  "/my/:serviceId/duplicate",
  verifyToken,
  authorizeRoles("doctor"),

  BookingServiceController.duplicateService
);

// Soft delete my service (doctor only)
router.delete(
  "/my/:serviceId",
  verifyToken,
  authorizeRoles("doctor"),

  BookingServiceController.deleteService
);

// Hard delete my service (doctor only)
router.delete(
  "/my/:serviceId/hard",
  verifyToken,
  authorizeRoles("doctor"),

  BookingServiceController.hardDeleteService
);

// Bulk update my services (doctor only)
router.patch(
  "/my/bulk-update",
  verifyToken,
  authorizeRoles("doctor"),

  BookingServiceController.bulkUpdateServices
);

// Get analytics for my service (doctor only)
router.get(
  "/my/:serviceId/analytics",
  verifyToken,
  authorizeRoles("doctor"),

  BookingServiceController.getServiceAnalytics
);

// ================== ADMIN ROUTES ==================

// Create service for any doctor (admin only)
router.post(
  "/doctor/:doctorId",
  verifyToken,
  authorizeRoles("admin"),

  BookingServiceController.createService
);

// Update any service (admin only)
router.put(
  "/:serviceId/admin",
  verifyToken,
  authorizeRoles("admin"),

  BookingServiceController.updateService
);

// Delete any service (admin only)
router.delete(
  "/:serviceId/admin",
  verifyToken,
  authorizeRoles("admin"),

  BookingServiceController.deleteService
);

// Hard delete any service (admin only)
router.delete(
  "/:serviceId/admin/hard",
  verifyToken,
  authorizeRoles("admin"),

  BookingServiceController.hardDeleteService
);

export default router;
