import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifycations: [],
  pagination: null,
  loading: null,
  error: null,
};

const notifycationSlice = createSlice({
  name: "notifycation",
  initialState,
  reducers: {
    fetchNotifycationsStart: (state, action) => {
      state.loading = true;
      state.error = null;
    },
    fetchNotifycationsSuccess: (state, action) => {
      console.log(action.payload);
      state.loading = false;
      state.notifycations = action.payload.notifications;
      state.pagination = action.payload.pagination;
    },
    fetchNotifycationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchNotifycationsStart,
  fetchNotifycationsSuccess,
  fetchNotifycationsFailure,
} = notifycationSlice.actions;

export default notifycationSlice.reducer;
