import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import addressReducer from "./slices/addressSlice";
import collectionReducer from "./slices/collection.slice";
import chatbotReducer from "./slices/chatbot.slice";
import topicReducer from "./slices/topic.slice";
import articleReducer from "./slices/article.slices";
export const rootReducer = combineReducers({
  auth: authReducer,
  address: addressReducer,
  collection: collectionReducer,
  chatbot: chatbotReducer,
  topic: topicReducer,
  article: articleReducer,
});
