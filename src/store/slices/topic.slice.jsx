import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  topics: [],
  topic: null,
  loading: false,
  error: null,
};

const topicSlice = createSlice({
  name: "topics",
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
    fetchTopicsSuccess: (state, action) => {
      state.loading = false;
      state.topics = action.payload;
    },
    fetchTopicsFailer: (state, action) => {
      state.loading = false;
      state.topics = action.payload;
    },
    fetchTopicSuccess: (state, action) => {
      state.loading = false;
      state.topic = action.payload;
    },
    fetchTopicFailer: (state, action) => {
      state.loading = false;
      state.topics = action.payload;
    },
    clearTopic: (state) => {
      state.loading = false;
      state.topic = null;
    },
  },
});

export const {
  fetchStart,
  fetchFailure,
  fetchTopicsSuccess,
  fetchTopicsFailer,
  fetchTopicSuccess,
  fetchTopicFailer,
  restoreSuccess,
} = topicSlice.actions;

export default topicSlice.reducer;
