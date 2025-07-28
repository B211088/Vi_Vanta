import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  services: [],
  selectedService: null,
  serviceAnalytics: null,
  serviceStats: null,
  doctors: [],
  doctor: null,

  error: null,
  pagination: {},
  workingHour: [],
  // Loading states for different operations
  workingHourLoading: {
    fetch: false,
    create: false,
    update: false,
    delete: false,
  },
  // Success states for notifications
  successMessage: null,

  doctorAppointments: [],
  doctorAppointmentsPagination: {
    current: 1,
    pages: 0,
    total: 0,
  },
  doctorAppointmentsLoading: false,
  doctorAppointmentsError: null,
  appointments: [],
  selectedAppointment: null,
  appointmentsPagination: {
    current: 1,
    pages: 0,
    total: 0,
  },

  // Filters and search
  filters: {
    status: "all", // all, active, inactive
    category: "",
    priceRange: {
      min: 0,
      max: 0,
    },
    searchTerm: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  },

  // Statistics
  statistics: {
    total: 0,
    active: 0,
    inactive: 0,
    totalRevenue: 0,
    averagePrice: 0,
    mostBookedService: null,
  },
  // Fixed loading states - consistent object structure
  loading: {
    fetch: false,
    create: false,
    update: false,
    delete: false,
    toggle: false,
    duplicate: false,
    bulkUpdate: false,
    export: false,
    analytics: false,
    stats: false,
    register: false, // Added for register actions
  },
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    registerStart: (state) => {
      state.loading.register = true; // Fixed: use object property
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.loading.register = false; // Fixed: use object property
      state.user = action.payload.user;
      state.successMessage = "Đăng ký thành công!";
    },
    registerFailure: (state, action) => {
      state.loading.register = false; // Fixed: use object property
      state.error = action.payload;
    },

    // Fetch doctors actions
    fetchDoctorsStart: (state) => {
      state.loading.fetch = true; // Fixed: use object property
      state.error = null;
    },
    fetchDoctorsSuccess: (state, action) => {
      state.loading.fetch = false; // Fixed: use object property
      state.doctors = action.payload.doctors;
      state.pagination = action.payload.pagination;
    },
    fetchDoctorsFailure: (state, action) => {
      state.loading.fetch = false; // Fixed: use object property
      state.error = action.payload;
    },
    fetchDoctorStart: (state) => {
      state.loading.fetch = true; // Fixed: use object property
      state.error = null;
    },
    fetchDoctorSuccess: (state, action) => {
      state.loading.fetch = false;
      state.doctor = action.payload;
    },
    fetchDoctorFailure: (state, action) => {
      state.loading.fetch = false; // Fixed: use object property
      state.error = action.payload;
    },

    // Fetch appointments actions
    fetchAppointmentsStart: (state) => {
      state.doctorAppointmentsLoading = true;
      state.error = null;
    },
    fetchAppointmentsSuccess: (state, action) => {
      state.doctorAppointmentsLoading = false; // Fixed: use correct property
      state.doctorAppointments = action.payload.appointments;
      state.appointmentsPagination = action.payload.pagination;
      state.statistics = action.payload.statistics || state.statistics;
    },
    fetchAppointmentsFailure: (state, action) => {
      state.doctorAppointmentsLoading = false; // Fixed: use correct property
      state.error = action.payload;
    },

    // Get single appointment
    fetchAppointmentStart: (state) => {
      state.loading.fetch = true; // Fixed: use object property
      state.error = null;
    },
    fetchAppointmentSuccess: (state, action) => {
      state.loading.fetch = false; // Fixed: use object property
      state.selectedAppointment = action.payload;
    },
    fetchAppointmentFailure: (state, action) => {
      state.loading.fetch = false; // Fixed: use object property
      state.error = action.payload;
    },

    // Update appointment status
    updateAppointmentStatusStart: (state) => {
      state.loading.update = true;
      state.error = null;
      state.successMessage = null;
    },
    updateAppointmentStatusSuccess: (state, action) => {
      state.loading.update = false;
      const { appointmentId, status, updatedData } = action.payload;

      // Update in appointments list - cập nhật toàn bộ object
      const appointmentIndex = state.doctorAppointments.findIndex(
        (apt) => apt._id === appointmentId
      );

      console.log({ appointmentIndex });

      if (appointmentIndex !== -1) {
        state.doctorAppointments[appointmentIndex] = {
          ...state.doctorAppointments[appointmentIndex],
          ...updatedData,
        };
      }

      // Update selected appointment if it matches
      if (state.selectedAppointment?._id === appointmentId) {
        state.selectedAppointment = {
          ...state.selectedAppointment,
          ...updatedData,
        };
      }
    },
    updateAppointmentStatusFailure: (state, action) => {
      state.loading.update = false;
      state.error = action.payload;
    },

    // Update appointment details
    updateAppointmentStart: (state) => {
      state.loading.update = true;
      state.error = null;
      state.successMessage = null;
    },
    updateAppointmentSuccess: (state, action) => {
      state.loading.update = false;
      const updatedAppointment = action.payload;

      // Update in appointments list
      const appointmentIndex = state.doctorAppointments.findIndex(
        (apt) => apt._id === updatedAppointment._id
      );
      if (appointmentIndex !== -1) {
        state.doctorAppointments[appointmentIndex] = updatedAppointment;
      }

      // Update selected appointment if it matches
      if (state.selectedAppointment?._id === updatedAppointment._id) {
        state.selectedAppointment = updatedAppointment;
      }

      state.successMessage = "Cập nhật thông tin lịch hẹn thành công!";
    },
    updateAppointmentFailure: (state, action) => {
      state.loading.update = false;
      state.error = action.payload;
    },

    // Add appointment notes
    addAppointmentNotesStart: (state) => {
      state.loading.update = true;
      state.error = null;
    },
    addAppointmentNotesSuccess: (state, action) => {
      state.loading.update = false;
      const { appointmentId, notes } = action.payload;

      // Update in appointments list
      const appointmentIndex = state.doctorAppointments.findIndex(
        (apt) => apt._id === appointmentId
      );
      if (appointmentIndex !== -1) {
        state.doctorAppointments[appointmentIndex].doctorNotes = notes;
      }

      // Update selected appointment if it matches
      if (state.selectedAppointment?._id === appointmentId) {
        state.selectedAppointment.doctorNotes = notes;
      }

      state.successMessage = "Thêm ghi chú thành công!";
    },
    addAppointmentNotesFailure: (state, action) => {
      state.loading.update = false;
      state.error = action.payload;
    },

    // Bulk operations
    bulkUpdateAppointmentsStart: (state) => {
      state.loading.bulkUpdate = true; // Fixed: use correct property
      state.error = null;
    },
    bulkUpdateAppointmentsSuccess: (state, action) => {
      state.loading.bulkUpdate = false; // Fixed: use correct property
      const { appointmentIds, updates } = action.payload;

      // Update multiple appointments
      state.doctorAppointments = state.doctorAppointments.map((apt) => {
        if (appointmentIds.includes(apt._id)) {
          return { ...apt, ...updates };
        }
        return apt;
      });

      state.successMessage = `Cập nhật ${appointmentIds.length} lịch hẹn thành công!`;
    },
    bulkUpdateAppointmentsFailure: (state, action) => {
      state.loading.bulkUpdate = false; // Fixed: use correct property
      state.error = action.payload;
    },

    // Filter and search actions
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: "all",
        date: "",
        searchTerm: "",
      };
    },

    // Statistics update
    updateStatistics: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload };
    },

    // Clear selected appointment
    clearSelectedAppointment: (state) => {
      state.selectedAppointment = null;
    },

    // Message management
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },

    // Real-time updates
    appointmentUpdatedRealtime: (state, action) => {
      const updatedAppointment = action.payload;
      const appointmentIndex = state.doctorAppointments.findIndex(
        (apt) => apt._id === updatedAppointment._id
      );

      if (appointmentIndex !== -1) {
        state.doctorAppointments[appointmentIndex] = updatedAppointment;
      }

      if (state.selectedAppointment?._id === updatedAppointment._id) {
        state.selectedAppointment = updatedAppointment;
      }
    },

    // New appointment added
    newAppointmentAdded: (state, action) => {
      const newAppointment = action.payload;
      state.doctorAppointments.unshift(newAppointment);
      state.statistics.total += 1;

      if (newAppointment.status === "pending") {
        state.statistics.pending += 1;
      }
    },

    // WORKING HOUR ACTIONS - MOVED INSIDE REDUCERS
    fetchWorkingHourStart: (state) => {
      state.workingHourLoading.fetch = true;
      state.error = null;
    },
    fetchWorkingHourSuccess: (state, action) => {
      state.workingHourLoading.fetch = false;
      state.workingHour = action.payload;
    },
    fetchWorkingHourFailure: (state, action) => {
      state.workingHourLoading.fetch = false;
      state.error = action.payload;
    },
    createWorkingHourStart: (state) => {
      state.workingHourLoading.create = true;
      state.error = null;
      state.successMessage = null;
    },
    createWorkingHourSuccess: (state, action) => {
      state.workingHourLoading.create = false;
      state.workingHour.push(action.payload);
      state.successMessage = "Tạo ca làm việc thành công!";
    },
    createWorkingHourFailure: (state, action) => {
      state.workingHourLoading.create = false;
      state.error = action.payload;
    },

    // Update working hour actions
    updateWorkingHourStart: (state) => {
      state.workingHourLoading.update = true;
      state.error = null;
      state.successMessage = null;
    },
    updateWorkingHourSuccess: (state, action) => {
      state.workingHourLoading.update = false;
      const index = state.workingHour.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.workingHour[index] = action.payload;
      }
      state.successMessage = "Cập nhật ca làm việc thành công!";
    },
    updateWorkingHourFailure: (state, action) => {
      state.workingHourLoading.update = false;
      state.error = action.payload;
    },

    // Delete working hour actions
    deleteWorkingHourStart: (state) => {
      state.workingHourLoading.delete = true;
      state.error = null;
      state.successMessage = null;
    },
    deleteWorkingHourSuccess: (state, action) => {
      state.workingHourLoading.delete = false;
      state.workingHour = state.workingHour.filter(
        (item) => item._id !== action.payload
      );
      state.successMessage = "Xóa ca làm việc thành công!";
    },
    deleteWorkingHourFailure: (state, action) => {
      state.workingHourLoading.delete = false;
      state.error = action.payload;
    },

    fetchServicesStart: (state) => {
      state.loading.fetch = true;
      state.error = null;
    },
    fetchServicesSuccess: (state, action) => {
      state.loading.fetch = false;
      state.services = action.payload.services;
      state.pagination = action.payload.pagination || state.pagination;
      state.statistics = action.payload.statistics || state.statistics;
    },
    fetchServicesFailure: (state, action) => {
      state.loading.fetch = false;
      state.error = action.payload;
    },

    // Get single service
    fetchServiceStart: (state) => {
      state.loading.fetch = true;
      state.error = null;
    },
    fetchServiceSuccess: (state, action) => {
      state.loading.fetch = false;
      state.selectedService = action.payload;
    },
    fetchServiceFailure: (state, action) => {
      state.loading.fetch = false;
      state.error = action.payload;
    },

    // Create new service actions
    createServiceStart: (state) => {
      state.loading.create = true;
      state.error = null;
      state.successMessage = null;
    },
    createServiceSuccess: (state, action) => {
      state.loading.create = false;
      state.services.unshift(action.payload);
      state.statistics.total += 1;
      if (action.payload.isActive) {
        state.statistics.active += 1;
      }
      state.successMessage = "Tạo dịch vụ thành công!";
    },
    createServiceFailure: (state, action) => {
      state.loading.create = false;
      state.error = action.payload;
    },

    // Update service actions
    updateServiceStart: (state) => {
      state.loading.update = true;
      state.error = null;
      state.successMessage = null;
    },
    updateServiceSuccess: (state, action) => {
      state.loading.update = false;
      const updatedService = action.payload;

      // Update in services list
      const serviceIndex = state.services.findIndex(
        (service) => service._id === updatedService._id
      );
      if (serviceIndex !== -1) {
        state.services[serviceIndex] = updatedService;
      }

      // Update selected service if it matches
      if (state.selectedService?._id === updatedService._id) {
        state.selectedService = updatedService;
      }

      state.successMessage = "Cập nhật dịch vụ thành công!";
    },
    updateServiceFailure: (state, action) => {
      state.loading.update = false;
      state.error = action.payload;
    },

    // Toggle service status actions
    toggleServiceStatusStart: (state) => {
      state.loading.toggle = true;
      state.error = null;
      state.successMessage = null;
    },
    toggleServiceStatusSuccess: (state, action) => {
      state.loading.toggle = false;
      const { serviceId, isActive } = action.payload;

      // Update in services list
      const serviceIndex = state.services.findIndex(
        (service) => service._id === serviceId
      );
      if (serviceIndex !== -1) {
        const wasActive = state.services[serviceIndex].isActive;
        state.services[serviceIndex].isActive = isActive;

        // Update statistics
        if (wasActive && !isActive) {
          state.statistics.active -= 1;
          state.statistics.inactive += 1;
        } else if (!wasActive && isActive) {
          state.statistics.active += 1;
          state.statistics.inactive -= 1;
        }
      }

      // Update selected service if it matches
      if (state.selectedService?._id === serviceId) {
        state.selectedService.isActive = isActive;
      }

      state.successMessage = isActive
        ? "Kích hoạt dịch vụ thành công!"
        : "Tạm dừng dịch vụ thành công!";
    },
    toggleServiceStatusFailure: (state, action) => {
      state.loading.toggle = false;
      state.error = action.payload;
    },

    // Duplicate service actions
    duplicateServiceStart: (state) => {
      state.loading.duplicate = true;
      state.error = null;
      state.successMessage = null;
    },
    duplicateServiceSuccess: (state, action) => {
      state.loading.duplicate = false;
      const duplicatedService = action.payload;
      state.services.unshift(duplicatedService);
      state.statistics.total += 1;
      if (duplicatedService.isActive) {
        state.statistics.active += 1;
      }
      state.successMessage = "Sao chép dịch vụ thành công!";
    },
    duplicateServiceFailure: (state, action) => {
      state.loading.duplicate = false;
      state.error = action.payload;
    },

    // Delete service actions (soft delete)
    deleteServiceStart: (state) => {
      state.loading.delete = true;
      state.error = null;
      state.successMessage = null;
    },
    deleteServiceSuccess: (state, action) => {
      state.loading.delete = false;
      const serviceId = action.payload;

      // Remove from services list or mark as deleted
      const serviceIndex = state.services.findIndex(
        (service) => service._id === serviceId
      );
      if (serviceIndex !== -1) {
        const deletedService = state.services[serviceIndex];
        // For soft delete, mark as deleted instead of removing
        state.services[serviceIndex].isDeleted = true;
        state.services[serviceIndex].isActive = false;

        state.statistics.total -= 1;
        if (deletedService.isActive) {
          state.statistics.active -= 1;
        }
      }

      // Clear selected service if it matches
      if (state.selectedService?._id === serviceId) {
        state.selectedService = null;
      }

      state.successMessage = "Xóa dịch vụ thành công!";
    },
    deleteServiceFailure: (state, action) => {
      state.loading.delete = false;
      state.error = action.payload;
    },

    // Hard delete service actions
    hardDeleteServiceStart: (state) => {
      state.loading.delete = true;
      state.error = null;
      state.successMessage = null;
    },
    hardDeleteServiceSuccess: (state, action) => {
      state.loading.delete = false;
      const serviceId = action.payload;

      // Remove completely from services list
      const serviceIndex = state.services.findIndex(
        (service) => service._id === serviceId
      );
      if (serviceIndex !== -1) {
        const deletedService = state.services[serviceIndex];
        state.services.splice(serviceIndex, 1);

        state.statistics.total -= 1;
        if (deletedService.isActive) {
          state.statistics.active -= 1;
        }
      }

      // Clear selected service if it matches
      if (state.selectedService?._id === serviceId) {
        state.selectedService = null;
      }

      state.successMessage = "Xóa vĩnh viễn dịch vụ thành công!";
    },
    hardDeleteServiceFailure: (state, action) => {
      state.loading.delete = false;
      state.error = action.payload;
    },

    // Bulk update services actions
    bulkUpdateServicesStart: (state) => {
      state.loading.bulkUpdate = true;
      state.error = null;
      state.successMessage = null;
    },
    bulkUpdateServicesSuccess: (state, action) => {
      state.loading.bulkUpdate = false;
      const { serviceIds, updates } = action.payload;

      // Update multiple services
      state.services = state.services.map((service) => {
        if (serviceIds.includes(service._id)) {
          return { ...service, ...updates };
        }
        return service;
      });

      state.successMessage = `Cập nhật ${serviceIds.length} dịch vụ thành công!`;
    },
    bulkUpdateServicesFailure: (state, action) => {
      state.loading.bulkUpdate = false;
      state.error = action.payload;
    },

    // Export services actions
    exportServicesStart: (state) => {
      state.loading.export = true;
      state.error = null;
    },
    exportServicesSuccess: (state, action) => {
      state.loading.export = false;
      state.successMessage = "Xuất dữ liệu dịch vụ thành công!";
      // Handle export data if needed
    },
    exportServicesFailure: (state, action) => {
      state.loading.export = false;
      state.error = action.payload;
    },

    // Get service analytics actions
    fetchServiceAnalyticsStart: (state) => {
      state.loading.analytics = true;
      state.error = null;
    },
    fetchServiceAnalyticsSuccess: (state, action) => {
      state.loading.analytics = false;
      state.serviceAnalytics = action.payload;
    },
    fetchServiceAnalyticsFailure: (state, action) => {
      state.loading.analytics = false;
      state.error = action.payload;
    },

    // Get service statistics actions
    fetchServiceStatsStart: (state) => {
      state.loading.stats = true;
      state.error = null;
    },
    fetchServiceStatsSuccess: (state, action) => {
      state.loading.stats = false;
      state.serviceStats = action.payload;
    },
    fetchServiceStatsFailure: (state, action) => {
      state.loading.stats = false;
      state.error = action.payload;
    },

    // Filter and search actions
    setServiceFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearServiceFilters: (state) => {
      state.filters = {
        status: "all",
        category: "",
        priceRange: {
          min: 0,
          max: 0,
        },
        searchTerm: "",
        sortBy: "createdAt",
        sortOrder: "desc",
      };
    },

    // Statistics update
    updateServiceStatistics: (state, action) => {
      state.statistics = { ...state.statistics, ...action.payload };
    },

    // Clear selected service
    clearSelectedService: (state) => {
      state.selectedService = null;
    },

    // Clear service analytics
    clearServiceAnalytics: (state) => {
      state.serviceAnalytics = null;
    },

    // Clear service stats
    clearServiceStats: (state) => {
      state.serviceStats = null;
    },

    // Message management
    clearServiceError: (state) => {
      state.error = null;
    },
    clearServiceSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearServiceMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },

    // Real-time updates
    serviceUpdatedRealtime: (state, action) => {
      const updatedService = action.payload;
      const serviceIndex = state.services.findIndex(
        (service) => service._id === updatedService._id
      );

      if (serviceIndex !== -1) {
        state.services[serviceIndex] = updatedService;
      }

      if (state.selectedService?._id === updatedService._id) {
        state.selectedService = updatedService;
      }
    },

    // New service added (real-time)
    newServiceAdded: (state, action) => {
      const newService = action.payload;
      state.services.unshift(newService);
      state.statistics.total += 1;

      if (newService.isActive) {
        state.statistics.active += 1;
      }
    },

    // Service deleted (real-time)
    serviceDeletedRealtime: (state, action) => {
      const serviceId = action.payload;
      const serviceIndex = state.services.findIndex(
        (service) => service._id === serviceId
      );

      if (serviceIndex !== -1) {
        const deletedService = state.services[serviceIndex];
        state.services.splice(serviceIndex, 1);

        state.statistics.total -= 1;
        if (deletedService.isActive) {
          state.statistics.active -= 1;
        }
      }

      if (state.selectedService?._id === serviceId) {
        state.selectedService = null;
      }
    },

    // Reset service state
    resetServiceState: (state) => {
      return initialState;
    },
  },
});

export const {
  registerStart,
  registerSuccess,
  registerFailure,
  fetchDoctorsStart,
  fetchDoctorsSuccess,
  fetchDoctorsFailure,
  fetchDoctorStart,
  fetchDoctorSuccess,
  fetchDoctorFailure,
  fetchAppointmentsStart,
  fetchAppointmentsSuccess,
  fetchAppointmentsFailure,
  fetchAppointmentStart,
  fetchAppointmentSuccess,
  fetchAppointmentFailure,
  updateAppointmentStatusStart,
  updateAppointmentStatusSuccess,
  updateAppointmentStatusFailure,
  updateAppointmentStart,
  updateAppointmentSuccess,
  updateAppointmentFailure,
  addAppointmentNotesStart,
  addAppointmentNotesSuccess,
  addAppointmentNotesFailure,
  bulkUpdateAppointmentsStart,
  bulkUpdateAppointmentsSuccess,
  bulkUpdateAppointmentsFailure,
  setFilters,
  clearFilters,
  updateStatistics,
  clearSelectedAppointment,
  clearError,
  clearSuccessMessage,
  clearMessages,
  fetchWorkingHourStart,
  fetchWorkingHourSuccess,
  fetchWorkingHourFailure,
  appointmentUpdatedRealtime,
  newAppointmentAdded,
  createWorkingHourStart,
  createWorkingHourSuccess,
  createWorkingHourFailure,
  updateWorkingHourStart,
  updateWorkingHourSuccess,
  updateWorkingHourFailure,
  deleteWorkingHourStart,
  deleteWorkingHourSuccess,
  deleteWorkingHourFailure,
  fetchServicesStart,
  fetchServicesSuccess,
  fetchServicesFailure,
  fetchServiceStart,
  fetchServiceSuccess,
  fetchServiceFailure,
  createServiceStart,
  createServiceSuccess,
  createServiceFailure,
  updateServiceStart,
  updateServiceSuccess,
  updateServiceFailure,
  toggleServiceStatusStart,
  toggleServiceStatusSuccess,
  toggleServiceStatusFailure,
  duplicateServiceStart,
  duplicateServiceSuccess,
  duplicateServiceFailure,
  deleteServiceStart,
  deleteServiceSuccess,
  deleteServiceFailure,
  hardDeleteServiceStart,
  hardDeleteServiceSuccess,
  hardDeleteServiceFailure,
  bulkUpdateServicesStart,
  bulkUpdateServicesSuccess,
  bulkUpdateServicesFailure,
  exportServicesStart,
  exportServicesSuccess,
  exportServicesFailure,
  fetchServiceAnalyticsStart,
  fetchServiceAnalyticsSuccess,
  fetchServiceAnalyticsFailure,
  fetchServiceStatsStart,
  fetchServiceStatsSuccess,
  fetchServiceStatsFailure,
  setServiceFilters,
  clearServiceFilters,
  updateServiceStatistics,
  clearSelectedService,
  clearServiceAnalytics,
  clearServiceStats,
  clearServiceError,
  clearServiceSuccessMessage,
  clearServiceMessages,
  serviceUpdatedRealtime,
  newServiceAdded,
  serviceDeletedRealtime,
  resetServiceState,
} = doctorSlice.actions;

export default doctorSlice.reducer;
