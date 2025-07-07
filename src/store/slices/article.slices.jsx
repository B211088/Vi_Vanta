import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  articles: [],
  article: null,
  loading: false,
  error: null,
};

const articleSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {
    fetchArticlesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchArticlesSuccess: (state, action) => {
      state.loading = false;
      state.articles = action.payload;
    },
    fetchArticlesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchArticleStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchArticleSuccess: (state, action) => {
      state.loading = false;
      state.article = action.payload;
    },
    fetchArticleFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    createArticleStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createArticleSuccess: (state, action) => {
      state.loading = false;
      state.articles.push(action.payload);
    },
    createArticleFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateArticleStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateArticleSuccess: (state, action) => {
      state.loading = false;
      state.articles = state.articles.map((art) =>
        art._id === action.payload._id ? action.payload : art
      );
      if (state.article && state.article._id === action.payload._id) {
        state.article = action.payload;
      }
    },
    updateArticleFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteArticleStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteArticleSuccess: (state, action) => {
      state.loading = false;
      state.articles = state.articles.filter(
        (art) => art._id !== action.payload._id
      );
      if (state.article && state.article._id === action.payload._id) {
        state.article = null;
      }
    },
    deleteArticleFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearArticle: (state) => {
      state.article = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  fetchArticlesStart,
  fetchArticlesSuccess,
  fetchArticlesFailure,
  fetchArticleStart,
  fetchArticleSuccess,
  fetchArticleFailure,
  createArticleStart,
  createArticleSuccess,
  createArticleFailure,
  updateArticleStart,
  updateArticleSuccess,
  updateArticleFailure,
  deleteArticleStart,
  deleteArticleSuccess,
  deleteArticleFailure,
  clearArticle,
} = articleSlice.actions;

export default articleSlice.reducer;
