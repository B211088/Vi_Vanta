import mongoose from "mongoose";
const { Schema } = mongoose;

const vaccineSchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "VaccinCategory",
      required: true,
    },
    name: {
      type: String,
      required: true, // Tên vắc-xin (bắt buộc)
      unique: true, // Đảm bảo tên vắc-xin là duy nhất
      trim: true, // Loại bỏ khoảng trắng thừa
    },
    code: {
      type: String, // Mã vắc-xin (ví dụ: "VAC123")
      required: true,
      unique: true, // Đảm bảo mã vắc-xin là duy nhất
      trim: true,
    },
    thumbnail: {
      url: {
        type: String, // URL của ảnh thumbnail
        required: true,
      },
      public_id: {
        type: String, // ID của ảnh trên Cloudinary
        required: true,
      },
    },
    manufacturer: {
      type: String, // Nhà sản xuất vắc-xin
      required: true,
      trim: true,
    },
    description: {
      type: String, // Mô tả chi tiết về vắc-xin
      default: "",
    },
    benefit: {
      type: String,
    },
    contraindicated: {
      type: String,
    },
    dosesRequired: {
      type: Number, // Số liều cần thiết
      required: true,
    },
    storageTemperature: {
      type: String, // Nhiệt độ bảo quản (ví dụ: "2-8°C")
      required: true,
    },
    targetDiseases: [
      {
        type: Schema.Types.ObjectId,
        ref: "Disease", // Tham chiếu đến mô hình Disease
        required: true,
      },
    ],
    sideEffects: [
      {
        type: String, // Các tác dụng phụ có thể xảy ra
      },
    ],
    images: [
      {
        url: {
          type: String, // URL của ảnh vắc-xin
          required: true,
        },
        public_id: {
          type: String, // ID của ảnh trên Cloudinary
          required: true,
        },
      },
    ],
    isActive: {
      type: Boolean, // Trạng thái hoạt động của vắc-xin
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Vaccine = mongoose.model("Vaccine", vaccineSchema);

export default Vaccine;
