import mongoose from "mongoose";
const { Schema } = mongoose;

const epidemiologySchema = new Schema(
  {
    disease: { type: Schema.Types.ObjectId, ref: "Disease", required: true },
    prevalence: { type: String, trim: true }, // Tỷ lệ hiện mắc
    incidence: { type: String, trim: true }, // Tỷ lệ mắc mới
    mortality: { type: String, trim: true }, // Tỷ lệ tử vong
    ageDistribution: { type: String, trim: true }, // Phân bố theo tuổi
    genderDistribution: { type: String, trim: true }, // Phân bố theo giới
    region: { type: String, trim: true }, // Khu vực/địa lý
    riskGroups: { type: String, trim: true }, // Nhóm nguy cơ
    notes: { type: String, trim: true }, // Ghi chú thêm
    sources: [{ type: Schema.Types.ObjectId, ref: "Reference" }], // Nguồn tham khảo
  },
  { timestamps: true }
);

export default mongoose.model("Epidemiology", epidemiologySchema);
