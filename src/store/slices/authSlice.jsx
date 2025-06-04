import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  token: null,
  user: null,
  loading: false,
  error: null,
  address: null,
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
    updateUserProileSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
    },
    updateUserProileFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    uploadUserAvatarSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
    },
    uploadUserAvatarFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    getUserAddressSuccess: (state, action) => {
      state.loading = false;
      state.address = action.payload;
    },
    getUserAddressFailure: (state, action) => {
      state.loading = false;
      state.address = null;
      state.error = action.payload;
    },
    updateUserAddressSuccess: (state, action) => {
      state.loading = false;
      state.address = action.payload.userAddress;
    },
    updateUserAddressFailure: (state, action) => {
      state.loading = false;
      state.address = null;
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
  getUserAddressSuccess,
  getUserAddressFailure,
  loadUserFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  clearError,
  loginStart,
  loginSuccess,
  loginFailure,
  updateUserProileSuccess,
  updateUserProileFailure,
  updateUserAddressSuccess,
  updateUserAddressFailure,
  uploadUserAvatarSuccess,
  uploadUserAvatarFailure,
  logout,
  loadingStart,
  loadingEnd,
} = authSlice.actions;

export default authSlice.reducer;
