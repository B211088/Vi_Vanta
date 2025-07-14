import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sections: [], // Danh sách các section (cuộc hội thoại)
  section: null, // Section đang xem hoặc đang chat
  messages: [],
  message: null,
  dialogues: [],
  models: [],
  loading: false,
  error: null,
  collection: null,
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
      // Clear section cũ để tránh hiển thị data cũ
      state.section = null;
    },

    fetchSectionSuccess: (state, action) => {
      state.loading = false;
      state.section = action.payload;
    },
    fetchSectionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchMessageSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload;
    },
    fetchMessageFailure: (state, action) => {
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
      if (state.section && state.section._id === action.payload) {
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
    fetchDialoguesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDialoguesSuccess: (state, action) => {
      state.loading = false;
      state.dialogues = action.payload;
    },
    fetchDialoguesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchModelsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchModelsSuccess: (state, action) => {
      state.loading = false;
      state.models = action.payload;
    },
    fetchModelsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchCollectionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCollectionSuccess: (state, action) => {
      state.loading = false;
      state.collection = action.payload;
    },
    fetchCollectionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearChatbotError: (state) => {
      state.error = null;
    },
    clearSection: (state) => {
      state.section = null;
    },
    clearCurrentSection: (state) => {
      state.section = null;
      state.loading = false;
      state.error = null;
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
  fetchDialoguesStart,
  fetchDialoguesSuccess,
  fetchDialoguesFailure,
  addSection,
  updateSection,
  deleteSection,
  clearChatbotError,
  fetchModelsSuccess,
  fetchModelsStart,
  fetchModelsFailure,
  fetchCollectionStart,
  fetchCollectionSuccess,
  fetchCollectionFailure,
  clearSection,
  clearCurrentSection,
} = chatbotSlice.actions;

export default chatbotSlice.reducer;
