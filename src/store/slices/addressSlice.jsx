import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  provinces: null,
  districts: null,
  wards: null,
  loading: false,
  error: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    getProvincesSuccess: (state, action) => {
      state.loading = false;
      state.provinces = action.payload;
    },
    getProvincesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    getDistrictsSuccess: (state, action) => {
      state.loading = false;
      state.districts = action.payload;
    },
    getDistrictsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    getWardsSuccess: (state, action) => {
      state.loading = false;
      state.wards = action.payload;
    },
    getWardsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadingStart: (state) => {
      state.loading = true;
    },
    loadingEnd: (state, action) => {
      state.loading = false;
      if (action.payload) {
        state.error = action.payload;
      }
    },
    clearError: (state, action) => {
      state.error = null;
      state.error = action.payload;
    },
  },
});

export const {
  getProvincesSuccess,
  getProvincesFailure,
  getDistrictsSuccess,
  getDistrictsFailure,
  getWardsSuccess,
  getWardsFailure,
  loadingStart,
  loadingEnd,
  clearError,
} = addressSlice.actions;

export default addressSlice.reducer;
