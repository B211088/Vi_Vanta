import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categories: [],
  diseases: [],
  disease: null,
  preventions: [],
  prevention: null,
  symptoms: [],
  symptom: null,
  treatments: [],
  treatment: null,
  causes: [],
  cause: null,
  loading: false,
  error: null,
};

const diseaseSlice = createSlice({
  name: "disease",
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
    setCategories: (state, action) => {
      state.categories = action.payload;
      state.loading = false;
    },
    setDiseases: (state, action) => {
      state.diseases = action.payload;
      state.loading = false;
    },
    setDisease: (state, action) => {
      state.disease = action.payload;
      state.loading = false;
    },
    addDisease: (state, action) => {
      state.loading = false;
    },
    setNewDisease: (state, action) => {
      state.diseases = [...state.diseases, action.payload];
      state.loading = false;
    },
    updateDisease: (state, action) => {
      state.diseases = state.diseases.map((disease) =>
        disease._id === action.payload._id ? action.payload : disease
      );
      state.loading = false;
    },
    deleteDisease: (state, action) => {
      state.diseases = state.diseases.filter(
        (disease) => disease._id !== action.payload
      );
      state.loading = false;
    },
    setPreventions: (state, action) => {
      state.preventions = action.payload;
      state.loading = false;
    },
    setNewPreventions: (state, action) => {
      state.preventions = [...state.preventions, action.payload];
      state.loading = false;
    },
    setPrevention: (state, action) => {
      state.prevention = action.payload;
      state.loading = false;
    },
    updatePrevention: (state, action) => {
      state.prevention = state.prevention.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
    },
    deletedPrevention: (state, action) => {
      state.prevention = state.prevention.filter(
        (item) => item.id !== action.payload
      );
    },
    setSymptoms: (state, action) => {
      state.symptoms = action.payload;
      state.loading = false;
    },
    setSymptom: (state, action) => {
      state.symptoms = action.payload;
      state.loading = false;
    },
    addSymptom: (state, action) => {
      state.symptoms = [...state.symptoms, action.payload];
      state.loading = false;
    },
    updateSymptom: (state, action) => {
      state.symptom = state.symptom.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
    },
    deletedSymptom: (state, action) => {
      state.symptom = state.symptom.filter(
        (item) => item.id !== action.payload
      );
    },
    setTreatments: (state, action) => {
      state.treatments = action.payload;
      state.loading = false;
    },
    setTreatment: (state, action) => {
      state.treatment = action.payload;
      state.loading = false;
    },
    addTreatment: (state, action) => {
      state.treatments = [...state.treatments, action.payload];
      state.loading = false;
    },
    updateTreatment: (state, action) => {
      state.treatment = state.treatment.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
    },
    deletedTreatment: (state, action) => {
      state.treatment = state.treatment.filter(
        (item) => item.id !== action.payload
      );
    },
    setCauses: (state, action) => {
      state.causes = action.payload;
      state.loading = false;
    },
    setCause: (state, action) => {
      state.cause = action.payload;
      state.loading = false;
    },
    addCause: (state, action) => {
      state.causes = [...state.causes, action.payload];
      state.loading = false;
    },
    updateCause: (state, action) => {
      state.cause = state.cause.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
    },
    deletedCause: (state, action) => {
      state.cause = state.cause.filter((item) => item.id !== action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchStart,
  fetchFailure,
  setCategories,
  setDiseases,
  addDisease,
  setDisease,
  setNewDisease,
  updateDisease,
  deleteDisease,
  clearError,
  setPreventions,
  setNewPreventions,
  setPrevention,
  setSymptoms,
  setSymptom,
  addSymptom,
  setTreatments,
  setTreatment,
  addTreatment,
  setCauses,
  setCause,
  addCause,
  updatePrevention,
  deletedPrevention,
  updateSymptom,
  deletedSymptom,
  updateTreatment,
  deletedTreatment,
  updateCause,
  deletedCause,
} = diseaseSlice.actions;

export default diseaseSlice.reducer;
