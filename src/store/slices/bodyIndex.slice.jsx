import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bmiRecords: [],
  bmiRecord: null,
  emmRecords: [],
  emmRecord: null,
  bodyFatRecords: [],
  bodyFatRecord: null,
  whrRecords: [],
  whrRecord: null,
  loading: false,
  error: null,
};

const bodyIndexSlice = createSlice({
  name: "bodyIndex",
  initialState,
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setBMIRecords: (state, action) => {
      state.bmiRecords = action.payload;
      state.loading = false;
    },
    setBMIRecord: (state, action) => {
      state.bmiRecord = action.payload;
      state.bmiRecords = [...state.bmiRecords, action.payload];
      state.loading = false;
    },
    setEMMRecords: (state, action) => {
      state.emmRecords = action.payload;
      state.loading = false;
    },
    setEMMRecord: (state, action) => {
      state.emmRecord = action.payload;
      state.loading = false;
    },
    setBodyFatRecords: (state, action) => {
      state.bodyFatRecords = action.payload;
      state.loading = false;
    },
    setBodyFatRecord: (state, action) => {
      state.bodyFatRecord = action.payload;
      state.loading = false;
    },
    setWHRRecords: (state, action) => {
      state.whrRecords = action.payload;
      state.loading = false;
    },
    setWHRRecord: (state, action) => {
      state.whrRecord = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchStart,
  fetchFailure,
  setBMIRecords,
  setBMIRecord,
  setEMMRecords,
  setEMMRecord,
  setBodyFatRecords,
  setBodyFatRecord,
  setWHRRecords,
  setWHRRecord,
  clearError,
} = bodyIndexSlice.actions;

export default bodyIndexSlice.reducer;
