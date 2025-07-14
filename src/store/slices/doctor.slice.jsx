import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  doctors: [],
  doctor: null,
  loading: false,
  error: null,
  pagination: {},
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
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
    clearError: (state, action) => {
      state.error = null;
      state.error = action.payload;
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
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
