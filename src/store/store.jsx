import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import addressReducer from "./slices/addressSlice";
import diseaseReducer from "./slices/diseaseSlice";
import collectionReducer from "./slices/collection.slice";
import chatbotReducer from "./slices/chatbot.slice";

export const rootReducer = combineReducers({
  auth: authReducer,
  address: addressReducer,
  disease: diseaseReducer,
  collection: collectionReducer,
  chatbot: chatbotReducer,
});
