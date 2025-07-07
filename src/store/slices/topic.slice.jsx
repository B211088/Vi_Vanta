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
    createTopicStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createTopicSuccess: (state, action) => {
      state.loading = false;
      state.topics.push(action.payload);
    },
    createTopicChildrenSuccess: (state, action) => {
      state.loading = false;
      state.topic = {
        ...state.topic,
        children: [...state.topic.children, action.payload],
      };
    },
    createTopicFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateTopicStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateTopicSuccess: (state, action) => {
      state.loading = false;
      state.topics = state.topics.map((top) =>
        top._id === action.payload._id ? action.payload : top
      );
      state.topic = action.payload;
    },
    updateTopicFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteTopicStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteTopicSuccess: (state, action) => {
      state.loading = false;

      // Cập nhật topics array
      state.topics = state.topics.map((top) =>
        top._id === action.payload._id
          ? { ...top, status: action.payload.status }
          : top
      );

      // Cập nhật topic detail nếu có
      if (state.topic && state.topic._id === action.payload._id) {
        state.topic = { ...state.topic, status: action.payload.status };
      }
    },
    deleteSoftTopicSuccess: (state, action) => {
      state.loading = false;

      state.topics = state.topics.map((top) =>
        top._id === action.payload._id
          ? { ...top, status: action.payload.status }
          : top
      );

      // Cập nhật topic detail
      if (state.topic && state.topic._id === action.payload._id) {
        state.topic = { ...state.topic, status: action.payload.status };
      }
    },

    restoreSuccess: (state, action) => {
      state.loading = false;

      state.topics = state.topics.map((top) =>
        top._id === action.payload._id
          ? { ...top, status: action.payload.status }
          : top
      );

      // Cập nhật topic detail
      if (state.topic && state.topic._id === action.payload._id) {
        state.topic = { ...state.topic, status: action.payload.status };
      }
    },
    deleteTopicFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
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
  createTopicStart,
  createTopicSuccess,
  createTopicFailure,
  updateTopicStart,
  updateTopicSuccess,
  updateTopicFailure,
  deleteTopicStart,
  deleteTopicSuccess,
  deleteTopicFailure,
  deleteSoftTopicSuccess,
  createTopicChildrenSuccess,
  restoreSuccess,
} = topicSlice.actions;

export default topicSlice.reducer;
