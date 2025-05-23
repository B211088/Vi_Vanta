import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import addressReducer from "./slices/addressSlice";

export const rootReducer = combineReducers({
  auth: authReducer,
  address: addressReducer,
});
