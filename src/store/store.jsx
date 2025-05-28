import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import addressReducer from "./slices/addressSlice";
import bodyIndexReducer from "./slices/bodyIndex.slice";

export const rootReducer = combineReducers({
  auth: authReducer,
  address: addressReducer,
  bodyIndex: bodyIndexReducer,
});
