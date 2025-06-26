import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  collections: [],
  collection: null,
  loading: false,
  documents: [],
  document: null,
  error: null,
};

const collectionSlice = createSlice({
  name: "collection",
  initialState,
  reducers: {
    fetchCollectionsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCollectionsSuccess: (state, action) => {
      state.loading = false;
      state.collections = action.payload;
    },
    fetchCollectionsFailure: (state, action) => {
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
    createCollectionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createCollectionSuccess: (state, action) => {
      state.loading = false;
      state.collections.push(action.payload);
    },
    createCollectionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateCollectionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateCollectionSuccess: (state, action) => {
      state.loading = false;
      state.collections = state.collections.map((col) =>
        col._id === action.payload._id ? action.payload : col
      );
      if (state.collection && state.collection._id === action.payload._id) {
        state.collection = action.payload;
      }
    },
    updateCollectionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteCollectionStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteCollectionSuccess: (state, action) => {
      state.loading = false;
      state.collections = state.collections.filter(
        (col) => col._id !== action.payload
      );
      if (state.collection && state.collection._id === action.payload) {
        state.collection = null;
      }
    },
    deleteCollectionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCollectionError: (state) => {
      state.error = null;
    },
    fetchDocumentsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDocumentsSuccess: (state, action) => {
      state.loading = false;
      state.documents = action.payload;
    },
    fetchDocumentsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchDocumentStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDocumentSuccess: (state, action) => {
      state.loading = false;
      state.document = action.payload;
    },
    fetchDocumentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addDocumentStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    addDocumentSuccess: (state, action) => {
      state.loading = false;
      state.documents = [...state.documents, action.payload];
    },
    addDocumentFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCollection: (state, action) => {
      state.loading = false;
      state.collection = null;
    },
  },
});

export const {
  fetchCollectionsStart,
  fetchCollectionsSuccess,
  fetchCollectionsFailure,
  fetchCollectionStart,
  fetchCollectionSuccess,
  fetchCollectionFailure,
  createCollectionStart,
  createCollectionSuccess,
  createCollectionFailure,
  updateCollectionStart,
  updateCollectionSuccess,
  updateCollectionFailure,
  deleteCollectionStart,
  deleteCollectionSuccess,
  deleteCollectionFailure,
  clearCollectionError,
  fetchDocumentsStart,
  fetchDocumentsSuccess,
  fetchDocumentsFailure,
  fetchDocumentStart,
  fetchDocumentSuccess,
  fetchDocumentFailure,
  addDocumentStart,
  addDocumentSuccess,
  addDocumentFailure,
  clearCollection,
} = collectionSlice.actions;

export default collectionSlice.reducer;
