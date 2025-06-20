import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sections: [], // Danh sách các section (cuộc hội thoại)
  section: null, // Section đang xem hoặc đang chat
  loading: false,
  error: null,
};

const chatbotSlice = createSlice({
  name: "chatbot",
  initialState,
  reducers: {
    fetchSectionsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSectionsSuccess: (state, action) => {
      state.loading = false;
      state.sections = action.payload;
    },
    fetchSectionsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchSectionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSectionSuccess: (state, action) => {
      state.loading = false;
      state.section = action.payload;
    },
    fetchSectionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addSection: (state, action) => {
      state.sections.push(action.payload);
    },
    updateSection: (state, action) => {
      state.sections = state.sections.map((sec) =>
        sec._id === action.payload._id ? action.payload : sec
      );
      if (state.section && state.section._id === action.payload._id) {
        state.section = action.payload;
      }
    },
    deleteSection: (state, action) => {
      state.sections = state.sections.filter(
        (sec) => sec._id !== action.payload
      );
      if (state.section && state.section._id === action.payload) {
        state.section = null;
      }
    },
    clearChatbotError: (state) => {
      state.error = null;
    },
    clearSection: (state) => {
      state.section = null;
    },
  },
});

export const {
  fetchSectionsStart,
  fetchSectionsSuccess,
  fetchSectionsFailure,
  fetchSectionStart,
  fetchSectionSuccess,
  fetchSectionFailure,
  addSection,
  updateSection,
  deleteSection,
  clearChatbotError,
  clearSection,
} = chatbotSlice.actions;

export default chatbotSlice.reducer;
