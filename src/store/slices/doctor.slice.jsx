import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  doctors: [],
  doctor: null,
  loading: false,
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
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    // Register actions
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.successMessage = "Đăng ký thành công!";
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch doctors actions
    fetchDoctorsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDoctorsSuccess: (state, action) => {
      state.loading = false;
      state.doctors = action.payload.doctors;
      state.pagination = action.payload.pagination;
    },
    fetchDoctorsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch doctor by ID actions
    fetchDoctorStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDoctorSuccess: (state, action) => {
      state.loading = false;
      state.doctor = action.payload;
    },
    fetchDoctorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Fetch working hours actions
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

    // Create working hour actions
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

    // Clear messages
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
  fetchWorkingHourStart,
  fetchWorkingHourSuccess,
  fetchWorkingHourFailure,
  createWorkingHourStart,
  createWorkingHourSuccess,
  createWorkingHourFailure,
  updateWorkingHourStart,
  updateWorkingHourSuccess,
  updateWorkingHourFailure,
  deleteWorkingHourStart,
  deleteWorkingHourSuccess,
  deleteWorkingHourFailure,
  clearError,
  clearSuccessMessage,
  clearMessages,
} = doctorSlice.actions;

export default doctorSlice.reducer;
