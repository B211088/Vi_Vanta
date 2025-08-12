import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Articles list
  articles: [],

  totalArticles: 0,
  currentPage: 1,
  totalPages: 1,

  // Single article
  article: null,

  // Search results
  searchResults: [],
  searchTotalResults: 0,

  articlesAttribute: [],

  // Articles by author
  articlesByAuthor: [],
  authorArticlesTotal: 0,

  // Articles by topic
  articlesByTopic: [],
  paginationSearch: null,
  topicArticlesTotal: 0,

  // Related articles
  relatedArticles: [],

  // Statistics
  articleStats: null,

  // Loading states
  loading: false,
  searchLoading: false,
  articlesAttributeLoading: false,
  statsLoading: false,
  authorArticlesLoading: false,
  topicArticlesLoading: false,
  relatedLoading: false,

  // Error states
  error: null,
  searchError: null,
  articlesAttributeError: null,
  statsError: null,
  authorArticlesError: null,
  topicArticlesError: null,
  relatedError: null,
};

const articleSlice = createSlice({
  name: "articles",
  initialState,
  reducers: {
    // Get Articles
    fetchArticlesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchArticlesSuccess: (state, action) => {
      state.loading = false;
      state.articles = Array.isArray(action.payload.articles)
        ? action.payload.articles
        : [];
      state.totalArticles = action.payload.pagination.total || 0;
      state.currentPage = action.payload.pagination.page || 1;
      state.totalPages = action.payload.pagination.pages || 1;
    },
    fetchArticlesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Search Articles
    searchArticlesStart: (state) => {
      state.searchLoading = true;
      state.searchError = null;
    },
    searchArticlesSuccess: (state, action) => {
      state.searchLoading = false;
      state.searchResults = Array.isArray(action.payload.articles)
        ? action.payload.articles
        : [];
      state.searchTotalResults = action.payload.totalResults || 0;
      state.paginationSearch = action.payload.pagination;
    },
    searchArticlesFailure: (state, action) => {
      state.searchLoading = false;
      state.searchError = action.payload;
    },

    fetchArticlesByAttributeStart: (state) => {
      state.articlesAttributeLoading = true;
      state.articlesAttributeError = null;
    },
    fetchArticlesByAttributeSuccess: (state, action) => {
      state.articlesAttributeLoading = false;
      state.articlesAttribute = Array.isArray(action.payload)
        ? action.payload
        : [];
    },
    fetchArticlesByAttributeFailure: (state, action) => {
      state.articlesAttributeLoading = false;
      state.articlesAttributeError = action.payload;
    },

    // Article Stats
    fetchArticleStatsStart: (state) => {
      state.statsLoading = true;
      state.statsError = null;
    },
    fetchArticleStatsSuccess: (state, action) => {
      state.statsLoading = false;
      state.articleStats = action.payload;
    },
    fetchArticleStatsFailure: (state, action) => {
      state.statsLoading = false;
      state.statsError = action.payload;
    },

    // Single Article
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

    // Articles by Author
    fetchArticlesByAuthorStart: (state) => {
      state.authorArticlesLoading = true;
      state.authorArticlesError = null;
    },
    fetchArticlesByAuthorSuccess: (state, action) => {
      state.authorArticlesLoading = false;
      state.articlesByAuthor = Array.isArray(action.payload.articles)
        ? action.payload.articles
        : [];
      state.authorArticlesTotal = action.payload.totalArticles || 0;
    },
    fetchArticlesByAuthorFailure: (state, action) => {
      state.authorArticlesLoading = false;
      state.authorArticlesError = action.payload;
    },

    // Articles by Topic
    fetchArticlesByTopicStart: (state) => {
      state.topicArticlesLoading = true;
      state.topicArticlesError = null;
    },
    fetchArticlesByTopicSuccess: (state, action) => {
      state.topicArticlesLoading = false;
      state.articlesByTopic = Array.isArray(action.payload)
        ? action.payload
        : [];
    },
    fetchArticlesByTopicFailure: (state, action) => {
      state.topicArticlesLoading = false;
      state.topicArticlesError = action.payload;
    },

    // Related Articles
    fetchRelatedArticlesStart: (state) => {
      state.relatedLoading = true;
      state.relatedError = null;
    },
    fetchRelatedArticlesSuccess: (state, action) => {
      state.relatedLoading = false;
      state.relatedArticles = Array.isArray(action.payload)
        ? action.payload
        : [];
    },
    fetchRelatedArticlesFailure: (state, action) => {
      state.relatedLoading = false;
      state.relatedError = action.payload;
    },

    // Clear states
    clearArticle: (state) => {
      state.article = null;
      state.loading = false;
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchTotalResults = 0;
      state.searchError = null;
    },
    clearErrors: (state) => {
      state.error = null;
      state.searchError = null;
      state.articlesAttributeError = null;
      state.statsError = null;
      state.authorArticlesError = null;
      state.topicArticlesError = null;
      state.relatedError = null;
    },
  },
});

export const {
  // Get Articles
  fetchArticlesStart,
  fetchArticlesSuccess,
  fetchArticlesFailure,

  // Search Articles
  searchArticlesStart,
  searchArticlesSuccess,
  searchArticlesFailure,

  // Featured Articles
  fetchArticlesByAttributeStart,
  fetchArticlesByAttributeSuccess,
  fetchArticlesByAttributeFailure,
  // Article Stats
  fetchArticleStatsStart,
  fetchArticleStatsSuccess,
  fetchArticleStatsFailure,

  // Single Article
  fetchArticleStart,
  fetchArticleSuccess,
  fetchArticleFailure,

  // Articles by Author
  fetchArticlesByAuthorStart,
  fetchArticlesByAuthorSuccess,
  fetchArticlesByAuthorFailure,

  // Articles by Topic
  fetchArticlesByTopicStart,
  fetchArticlesByTopicSuccess,
  fetchArticlesByTopicFailure,

  // Related Articles
  fetchRelatedArticlesStart,
  fetchRelatedArticlesSuccess,
  fetchRelatedArticlesFailure,

  // Clear states
  clearArticle,
  clearSearchResults,
  clearErrors,
} = articleSlice.actions;

export default articleSlice.reducer;
