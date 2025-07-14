import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import addressReducer from "./slices/addressSlice";

import topicReducer from "./slices/topic.slice";
import articleReducer from "./slices/article.slices";
import chatbotReducer from "./slices/chatbot.slice";
import doctorReducer from "./slices/doctor.slice";
import healthReducer from "./slices/health.slice";

export const rootReducer = combineReducers({
  auth: authReducer,
  address: addressReducer,
  topic: topicReducer,
  article: articleReducer,
  chatbot: chatbotReducer,
  doctor: doctorReducer,
  health: healthReducer,
});
