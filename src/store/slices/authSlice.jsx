import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  token: null,
  user: null,
  loading: false,
  error: null,
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
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.loading = false;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
    loadUserStart: (state) => {
      state.loading = true;
    },
    loadUserSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    loadUserFailure: (state, action) => {
      state.loading = false;
      state.user = null;
      state.isAuthenticated = false;
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
  loadUserStart,
  loadUserSuccess,
  loadUserFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  clearError,
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  loadingStart,
  loadingEnd,
} = authSlice.actions;
export default authSlice.reducer;
