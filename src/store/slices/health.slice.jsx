// store/slices/health.slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Current user health info
  healthInfo: null,
  bmi: null,
  bmiCategory: null,

  metabolism: null,
  // All health info list (for admin)
  healthList: [],

  // Health statistics
  healthStats: null,

  // Loading states
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  statsLoading: false,

  // Error states
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  statsError: null,

  // Success states
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

const healthSlice = createSlice({
  name: "health",
  initialState,
  reducers: {
    // Get user health info
    fetchHealthInfoStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchHealthInfoSuccess: (state, action) => {
      state.loading = false;
      state.healthInfo = action.payload.healthInfo;
      state.bmi = action.payload.bmi;
      state.bmiCategory = action.payload.bmiCategory;
    },
    fetchHealthInfoFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Get all health info (admin)
    fetchAllHealthStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAllHealthSuccess: (state, action) => {
      state.loading = false;
      state.healthList = Array.isArray(action.payload) ? action.payload : [];
    },
    fetchAllHealthFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchMetabolismStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMetabolismSuccess: (state, action) => {
      state.loading = false;
      state.metabolism = action.payload;
    },
    fetchMetabolismFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create health info
    createHealthStart: (state) => {
      state.createLoading = true;
      state.createError = null;
      state.createSuccess = false;
    },
    createHealthSuccess: (state, action) => {
      state.createLoading = false;
      state.createSuccess = true;
      state.healthInfo = action.payload;
    },
    createHealthFailure: (state, action) => {
      state.createLoading = false;
      state.createError = action.payload;
    },

    // Update health info
    updateHealthStart: (state) => {
      state.updateLoading = true;
      state.updateError = null;
      state.updateSuccess = false;
    },
    updateHealthSuccess: (state, action) => {
      state.updateLoading = false;
      state.updateSuccess = true;
      state.healthInfo = action.payload.updatedHealthInfo;
      state.bmi = action.payload.bmi;
      state.bmiCategory = action.payload.bmiCategory;
    },
    updateHealthFailure: (state, action) => {
      state.updateLoading = false;
      state.updateError = action.payload;
    },

    // Delete health info
    deleteHealthStart: (state) => {
      state.deleteLoading = true;
      state.deleteError = null;
      state.deleteSuccess = false;
    },
    deleteHealthSuccess: (state, action) => {
      state.deleteLoading = false;
      state.deleteSuccess = true;
      // Remove deleted item from list if exists
      if (state.healthList.length > 0) {
        state.healthList = state.healthList.filter(
          (item) => item.id !== action.payload.deletedId
        );
      }
    },
    deleteHealthFailure: (state, action) => {
      state.deleteLoading = false;
      state.deleteError = action.payload;
    },

    // Health statistics
    fetchHealthStatsStart: (state) => {
      state.statsLoading = true;
      state.statsError = null;
    },
    fetchHealthStatsSuccess: (state, action) => {
      state.statsLoading = false;
      state.healthStats = action.payload;
    },
    fetchHealthStatsFailure: (state, action) => {
      state.statsLoading = false;
      state.statsError = action.payload;
    },

    // Clear states
    clearHealthInfo: (state) => {
      state.healthInfo = null;
      state.bmi = null;
      state.bmiCategory = null;
      state.loading = false;
      state.error = null;
    },
    clearErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.statsError = null;
    },
    clearSuccess: (state) => {
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
    resetHealthState: (state) => {
      Object.assign(state, initialState);
    },
  },
});

export const {
  // Get user health info
  fetchHealthInfoStart,
  fetchHealthInfoSuccess,
  fetchHealthInfoFailure,

  // Get all health info
  fetchAllHealthStart,
  fetchAllHealthSuccess,
  fetchAllHealthFailure,

  // Create health info
  createHealthStart,
  createHealthSuccess,
  createHealthFailure,

  // Update health info
  updateHealthStart,
  updateHealthSuccess,
  updateHealthFailure,

  // Delete health info
  deleteHealthStart,
  deleteHealthSuccess,
  deleteHealthFailure,

  // Health statistics
  fetchHealthStatsStart,
  fetchHealthStatsSuccess,
  fetchHealthStatsFailure,

  fetchMetabolismStart,
  fetchMetabolismSuccess,
  fetchMetabolismFailure,

  // Clear states
  clearHealthInfo,
  clearErrors,
  clearSuccess,
  resetHealthState,
} = healthSlice.actions;

export default healthSlice.reducer;
