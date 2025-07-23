import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  doctor: null,
  workingHour: [],
  // Available slots
  availableSlots: [],
  availableSlotsLoading: false,
  availableSlotsError: null,

  // Current appointment
  currentAppointment: null,
  currentAppointmentLoading: false,
  currentAppointmentError: null,

  // User appointments
  userAppointments: [],
  userAppointmentsPagination: {
    current: 1,
    pages: 0,
    total: 0,
  },
  userAppointmentsLoading: false,
  userAppointmentsError: null,

  // Doctor appointments
  doctorAppointments: [],
  doctorAppointmentsPagination: {
    current: 1,
    pages: 0,
    total: 0,
  },
  doctorAppointmentsLoading: false,
  doctorAppointmentsError: null,

  // Payment
  paymentResult: null,
  paymentLoading: false,
  paymentError: null,

  // Payment history
  paymentHistory: [],
  paymentHistoryPagination: {
    current: 1,
    pages: 0,
    total: 0,
  },
  paymentHistoryLoading: false,
  paymentHistoryError: null,

  // UI state
  selectedDate: null,
  selectedTime: null,
  selectedDoctor: null,
  bookingStep: "selectTime",

  // General states
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    // Fetch doctor by ID actions
    fetchDoctorStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDoctorSuccess: (state, action) => {
      state.loading = false;
      state.doctor = action.payload.doctor;
      state.workingHour = action.payload.workingHour;
    },
    fetchDoctorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    // Available slots actions
    getAvailableSlotsSuccess: (state, action) => {
      state.availableSlotsLoading = false;
      state.availableSlots = action.payload;
      state.availableSlotsError = null;
    },
    getAvailableSlotsFailure: (state, action) => {
      state.availableSlotsLoading = false;
      state.availableSlotsError = action.payload;
      state.availableSlots = [];
    },
    availableSlotsLoadingStart: (state) => {
      state.availableSlotsLoading = true;
      state.availableSlotsError = null;
    },

    // Create appointment actions
    createAppointmentSuccess: (state, action) => {
      state.currentAppointmentLoading = false;
      state.currentAppointment = action.payload;
      state.currentAppointmentError = null;
      state.bookingStep = "payment";
    },
    createAppointmentFailure: (state, action) => {
      state.currentAppointmentLoading = false;
      state.currentAppointmentError = action.payload;
    },
    createAppointmentLoadingStart: (state) => {
      state.currentAppointmentLoading = true;
      state.currentAppointmentError = null;
    },

    // Get appointment by ID actions
    getAppointmentByIdSuccess: (state, action) => {
      state.currentAppointmentLoading = false;
      state.currentAppointment = action.payload;
      state.currentAppointmentError = null;
    },
    getAppointmentByIdFailure: (state, action) => {
      state.currentAppointmentLoading = false;
      state.currentAppointmentError = action.payload;
    },
    getAppointmentByIdLoadingStart: (state) => {
      state.currentAppointmentLoading = true;
      state.currentAppointmentError = null;
    },

    // Update appointment status actions
    updateAppointmentStatusSuccess: (state, action) => {
      state.currentAppointmentLoading = false;
      state.currentAppointmentError = null;

      // Update current appointment
      if (
        state.currentAppointment &&
        state.currentAppointment._id === action.payload._id
      ) {
        state.currentAppointment = action.payload;
      }

      // Update in doctor appointments list
      const doctorIndex = state.doctorAppointments.findIndex(
        (apt) => apt._id === action.payload._id
      );
      if (doctorIndex !== -1) {
        state.doctorAppointments[doctorIndex] = action.payload;
      }

      // Update in user appointments list
      const userIndex = state.userAppointments.findIndex(
        (apt) => apt._id === action.payload._id
      );
      if (userIndex !== -1) {
        state.userAppointments[userIndex] = action.payload;
      }
    },
    updateAppointmentStatusFailure: (state, action) => {
      state.currentAppointmentLoading = false;
      state.currentAppointmentError = action.payload;
    },
    updateAppointmentStatusLoadingStart: (state) => {
      state.currentAppointmentLoading = true;
      state.currentAppointmentError = null;
    },

    // Cancel appointment actions
    cancelAppointmentSuccess: (state, action) => {
      state.currentAppointmentLoading = false;
      state.currentAppointmentError = null;

      // Update current appointment
      if (
        state.currentAppointment &&
        state.currentAppointment._id === action.payload._id
      ) {
        state.currentAppointment = action.payload;
      }

      // Update in user appointments list
      const userIndex = state.userAppointments.findIndex(
        (apt) => apt._id === action.payload._id
      );
      if (userIndex !== -1) {
        state.userAppointments[userIndex] = action.payload;
      }
    },
    cancelAppointmentFailure: (state, action) => {
      state.currentAppointmentLoading = false;
      state.currentAppointmentError = action.payload;
    },
    cancelAppointmentLoadingStart: (state) => {
      state.currentAppointmentLoading = true;
      state.currentAppointmentError = null;
    },

    // Get user appointments actions
    getUserAppointmentsSuccess: (state, action) => {
      state.userAppointmentsLoading = false;
      state.userAppointments = action.payload.appointments;
      state.userAppointmentsPagination = action.payload.pagination;
      state.userAppointmentsError = null;
    },
    getUserAppointmentsFailure: (state, action) => {
      state.userAppointmentsLoading = false;
      state.userAppointmentsError = action.payload;
    },
    getUserAppointmentsLoadingStart: (state) => {
      state.userAppointmentsLoading = true;
      state.userAppointmentsError = null;
    },

    // Get doctor appointments actions
    getDoctorAppointmentsSuccess: (state, action) => {
      state.doctorAppointmentsLoading = false;
      state.doctorAppointments = action.payload.appointments;
      state.doctorAppointmentsPagination = action.payload.pagination;
      state.doctorAppointmentsError = null;
    },
    getDoctorAppointmentsFailure: (state, action) => {
      state.doctorAppointmentsLoading = false;
      state.doctorAppointmentsError = action.payload;
    },
    getDoctorAppointmentsLoadingStart: (state) => {
      state.doctorAppointmentsLoading = true;
      state.doctorAppointmentsError = null;
    },

    // Process payment actions
    processPaymentSuccess: (state, action) => {
      state.paymentLoading = false;
      state.paymentResult = action.payload;
      state.paymentError = null;
      state.bookingStep = "confirmation";
    },
    processPaymentFailure: (state, action) => {
      state.paymentLoading = false;
      state.paymentError = action.payload;
    },
    processPaymentLoadingStart: (state) => {
      state.paymentLoading = true;
      state.paymentError = null;
    },

    // Get payment history actions
    getPaymentHistorySuccess: (state, action) => {
      state.paymentHistoryLoading = false;
      state.paymentHistory = action.payload.payments;
      state.paymentHistoryPagination = action.payload.pagination;
      state.paymentHistoryError = null;
    },
    getPaymentHistoryFailure: (state, action) => {
      state.paymentHistoryLoading = false;
      state.paymentHistoryError = action.payload;
    },
    getPaymentHistoryLoadingStart: (state) => {
      state.paymentHistoryLoading = true;
      state.paymentHistoryError = null;
    },

    // UI actions
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
      state.availableSlots = []; // Clear slots when date changes
    },

    setSelectedTime: (state, action) => {
      state.selectedTime = action.payload;
    },

    setSelectedDoctor: (state, action) => {
      state.selectedDoctor = action.payload;
    },

    setBookingStep: (state, action) => {
      state.bookingStep = action.payload;
    },

    // General actions
    loadingStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    loadingEnd: (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.error = action.payload;
      }
    },

    clearError: (state) => {
      state.error = null;
      state.availableSlotsError = null;
      state.currentAppointmentError = null;
      state.userAppointmentsError = null;
      state.doctorAppointmentsError = null;
      state.paymentError = null;
      state.paymentHistoryError = null;
    },

    clearBookingData: (state) => {
      state.selectedDate = null;
      state.selectedTime = null;
      state.selectedDoctor = null;
      state.bookingStep = "selectTime";
      state.currentAppointment = null;
      state.availableSlots = [];
      state.paymentResult = null;
    },

    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
      state.currentAppointmentError = null;
    },
  },
});

export const {
  // Available slots
  getAvailableSlotsSuccess,
  getAvailableSlotsFailure,
  availableSlotsLoadingStart,

  // Create appointment
  createAppointmentSuccess,
  createAppointmentFailure,
  createAppointmentLoadingStart,

  // Get appointment by ID
  getAppointmentByIdSuccess,
  getAppointmentByIdFailure,
  getAppointmentByIdLoadingStart,

  // Update appointment status
  updateAppointmentStatusSuccess,
  updateAppointmentStatusFailure,
  updateAppointmentStatusLoadingStart,

  // Cancel appointment
  cancelAppointmentSuccess,
  cancelAppointmentFailure,
  cancelAppointmentLoadingStart,

  // Get user appointments
  getUserAppointmentsSuccess,
  getUserAppointmentsFailure,
  getUserAppointmentsLoadingStart,

  // Get doctor appointments
  getDoctorAppointmentsSuccess,
  getDoctorAppointmentsFailure,
  getDoctorAppointmentsLoadingStart,

  // Process payment
  processPaymentSuccess,
  processPaymentFailure,
  processPaymentLoadingStart,

  // Get payment history
  getPaymentHistorySuccess,
  getPaymentHistoryFailure,
  getPaymentHistoryLoadingStart,

  // UI actions
  setSelectedDate,
  setSelectedTime,
  setSelectedDoctor,
  setBookingStep,

  // General actions
  loadingStart,
  loadingEnd,
  clearError,
  clearBookingData,
  clearCurrentAppointment,
  fetchDoctorStart,
  fetchDoctorSuccess,
  fetchDoctorFailure,
} = bookingSlice.actions;

export default bookingSlice.reducer;
