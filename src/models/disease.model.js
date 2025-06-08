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
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    scientificName: {
      type: String,
      trim: true,
    },
    icd10Code: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
    },
    definition: {
      type: String,
      trim: true,
    },
    category: [
      {
        type: Schema.Types.ObjectId,
        ref: "DiseaseCategory",
      },
    ],
    specialty: [
      {
        type: Schema.Types.ObjectId,
        ref: "Specialty",
      },
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    complications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Complication",
      },
    ],
    riskFactors: [
      {
        type: Schema.Types.ObjectId,
        ref: "RiskFactor",
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
    prognosis: [
      {
        name: { type: String, trim: true },
        description: { type: String, trim: true },
        references: [
          {
            type: Schema.Types.ObjectId,
            ref: "Reference",
          },
        ],
      },
    ],
    diagnosis: [
      {
        name: { type: String, trim: true },
        description: { type: String, trim: true },
        references: [
          {
            type: Schema.Types.ObjectId,
            ref: "Reference",
          },
        ],
      },
    ],
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
    },
    references: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reference",
      },
    ],
    guidelines: [
      {
        type: Schema.Types.ObjectId,
        ref: "Guideline",
      },
    ],
    epidemiology: { type: Schema.Types.ObjectId, ref: "Epidemiology" },
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
        description: {
          type: String,
          trim: true,
        },
      },
    ],
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
    status: {
      type: String,
      enum: ["draft", "pending", "published", "archived"],
      default: "draft",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    reviewedAt: { type: Date },
    version: {
      type: Number,
      default: 1,
    },
    history: [
      {
        version: Number,
        data: Schema.Types.Mixed,
        updatedAt: Date,
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

diseaseSchema.index({
  name: "text",
  scientificName: "text",
  description: "text",
});
diseaseSchema.index({ category: 1 });
diseaseSchema.index({ medications: 1 });
diseaseSchema.index({ symptoms: 1 });
diseaseSchema.index({ causes: 1 });
diseaseSchema.index({ treatments: 1 });
diseaseSchema.index({ preventions: 1 });
diseaseSchema.index({ riskFactors: 1 });
diseaseSchema.index({ complications: 1 });
diseaseSchema.index({ relatedDiseases: 1 });
diseaseSchema.index({ references: 1 });
diseaseSchema.index({ isActive: 1 });
diseaseSchema.index({ version: 1 });
diseaseSchema.index({ thumbnail: 1 });
const Disease = mongoose.model("Disease", diseaseSchema);

export default Disease;
