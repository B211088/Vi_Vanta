import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  children: [],
  child: null,
  loading: null,
  error: null,
  vaccinationRecords: [],
};
const childrenSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    fetchVaccinationRecordsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchVaccinationRecordsSuccess: (state, action) => {
      state.loading = false;
      state.vaccinationRecords = action.payload;
    },
    fetchVaccinationRecordsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchChildrenStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchChildrenSuccess: (state, action) => {
      state.loading = false;
      state.children = action.payload.children;
    },
    fetchChildrenFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addChildStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addChildSuccess: (state, action) => {
      state.loading = false;
      state.children = [...state.children, action.payload];
    },
    addChildFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateChildStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateChildSuccess: (state, action) => {
      state.loading = false;
      state.children = state.children.map((child) =>
        child._id === action.payload._id ? action.payload : child
      );
    },
    updateChildFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteChildStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteChildSuccess: (state, action) => {
      state.loading = false;
      state.children = state.children.filter(
        (child) => child._id !== action.payload._id
      );
    },
    deleteChildFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    checkingVaccinacationRecordStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    checkingVaccinacationRecordSuccess: (state, action) => {
      state.loading = false;
      state.vaccinationRecords.push(action.payload);
      const childId = action.payload.childId;
      state.children = state.children.map((child) => {
        if (child._id === childId) {
          return {
            ...child,
            completedCount: (child.completedCount || 0) + 1,
            overdueCount: child.overdueCount > 0 ? child.overdueCount - 1 : 0,
          };
        }
        return child;
      });
    },
    checkingVaccinacationRecordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchVaccinationRecordsStart,
  fetchVaccinationRecordsSuccess,
  fetchVaccinationRecordsFailure,
  fetchChildrenStart,
  fetchChildrenSuccess,
  fetchChildrenFailure,
  addChildStart,
  addChildSuccess,
  addChildFailure,
  updateChildStart,
  updateChildSuccess,
  updateChildFailure,
  deleteChildStart,
  deleteChildSuccess,
  deleteChildFailure,
  checkingVaccinacationRecordStart,
  checkingVaccinacationRecordSuccess,
  checkingVaccinacationRecordFailure,
} = childrenSlice.actions;

export default childrenSlice.reducer;
