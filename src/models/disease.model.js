import mongoose from "mongoose";
const { Schema } = mongoose;

const diseaseSchema = new Schema(
  {
    // Tên bệnh (duy nhất)
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Slug cho URL (duy nhất)
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    // Tag/phân loại liên quan (ref tới Tag)
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    // Từ khóa tìm kiếm
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    // Tên khoa học của bệnh
    scientificName: {
      type: String,
      trim: true,
    },
    // Mã ICD-10 (duy nhất)
    icd10Code: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
    },
    // Định nghĩa bệnh
    definition: {
      type: String,
      trim: true,
    },
    // Danh mục phân loại bệnh (ref tới DiseaseCategory)
    category: [
      {
        type: Schema.Types.ObjectId,
        ref: "DiseaseCategory",
      },
    ],
    // Biến chứng liên quan (ref tới Complication)
    complications: [
      {
        type: String,
      },
    ],
    //dịch tễ học
    epidemiology: {
      prevalence: {
        type: String,
        trim: true,
      },
      incidence: {
        type: String,
        trim: true,
      },
      mortality: {
        type: String,
        trim: true,
      },
      ageDistribution: {
        type: String,
        trim: true,
      },
      region: {
        type: String,
        trim: true,
      },
      riskGroups: {
        type: String,
        trim: true,
      },
      trends: {
        type: String,
        trim: true,
      },
      seasonality: {
        type: String,
        trim: true,
      },
    },
    // Yếu tố nguy cơ (ref tới RiskFactor)
    riskFactors: [
      {
        type: Schema.Types.ObjectId,
        ref: "RiskFactor",
      },
    ],
    // Triệu chứng (ref tới Symptom)
    symptoms: [
      {
        type: String,
      },
    ],
    // Nguyên nhân (ref tới Cause)
    causes: [
      {
        type: String,
      },
    ],
    // Phác đồ điều trị (ref tới Treatment)
    treatments: [
      {
        type: String,
      },
    ],
    // Biện pháp phòng ngừa (ref tới Prevention)
    preventions: [
      {
        type: String,
      },
    ],
    // Tiên lượng bệnh (mảng các mục)
    prognosis: [
      {
        type: String, // Tiên lượng
      },
    ],
    // Chẩn đoán bệnh (mảng các mục)
    diagnosis: [
      {
        type: String, // Phương pháp chẩn đoán
      },
    ],
    // Mức độ nguy cơ
    riskLevel: {
      type: String,
      enum: ["low", "medium", "high", "critical", "unknown"],
      default: "medium",
    },
    // Bệnh liên quan (ref tới Disease)
    relatedDiseases: [
      {
        type: Schema.Types.ObjectId,
        ref: "Disease",
      },
    ],
    // Bài viết chi tiết (ref tới Article)
    detailedArticle: [
      {
        articles: { type: Schema.Types.ObjectId, ref: "Article" },
      },
    ],
    // Tài liệu tham khảo (ref tới Reference)
    references: [
      {
        type: Schema.Types.ObjectId,
        ref: "Reference",
      },
    ],
    // Hướng dẫn liên quan (ref tới Guideline)
    guidelines: [
      {
        type: String,
      },
    ],
    // Hình ảnh minh họa
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
    // Ảnh đại diện (thumbnail)
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
    // Trạng thái bài viết
    status: {
      type: String,
      enum: ["draft", "pending", "published", "archived"],
      default: "draft",
    },
    // Người tạo (ref tới User)
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    // Người cập nhật gần nhất (ref tới User)
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    // Người kiểm duyệt (ref tới User)
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    // Thời gian duyệt
    approvedAt: { type: Date },
    // Thời gian kiểm duyệt
    reviewedAt: { type: Date },
    // Phiên bản
    version: {
      type: Number,
      default: 1,
    },
    // Lịch sử thay đổi
    history: [
      {
        version: Number,
        data: Schema.Types.Mixed,
        updatedAt: Date,
        updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    // Đánh dấu bệnh còn hoạt động
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Tự động thêm createdAt, updatedAt
  }
);

// Các chỉ mục để tối ưu tìm kiếm
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
