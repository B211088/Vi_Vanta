import mongoose from "mongoose";
const { Schema } = mongoose;

const diseaseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    scientificName: {
      type: String,
      required: true,
      trim: true,
    },
    icd10Code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: [
      {
        type: Schema.Types.ObjectId,
        ref: "DiseaseCategory",
        required: true,
      },
    ],
    medications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Medication",
      },
    ],
    symptoms: [
      {
        type: Schema.Types.ObjectId,
        ref: "Symptom",
      },
    ],
    causes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Cause",
      },
    ],
    treatments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Treatment",
      },
    ],
    preventions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Prevention",
      },
    ],
    riskFactors: [
      {
        type: String,
        trim: true,
      },
    ],
    complications: [
      {
        type: String,
        trim: true,
      },
    ],
    prognosis: {
      type: String,
      trim: true,
      default: "",
    },
    diagnosis: {
      type: String,
      trim: true,
      default: "",
    },
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical", "unknown"],
      default: "medium",
    },
    relatedDiseases: [
      {
        type: Schema.Types.ObjectId,
        ref: "Disease",
      },
    ],
    detailedArticle: {
      type: String,
      trim: true,
      default: "chưa có bài viết chi tiết",
    },
    references: [
      {
        title: String,
        authors: [String],
        source: String,
        url: String,
        publicationDate: Date,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    thumbnail: {
      url: {
        type: String,
        required: true,
        trim: true,
      },
      public_id: {
        type: String,
        required: true,
        trim: true,
      },
    },
    images: [
      {
        url: {
          type: String,
          required: true,
          trim: true,
        },
        public_id: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Disease = mongoose.model("Disease", diseaseSchema);

export default Disease;
