import multer from "multer";
import path from "path";
import fs from "fs";

// Đảm bảo thư mục uploads/images tồn tại
const uploadDir = "uploads/images";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // đảm bảo tạo được cả cây thư mục nếu cần
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("➡️ [Multer] Save file to:", uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext) {
      ext = mimeToExt[file.mimetype] || ".jpg"; // fallback
    }
    const fileName = uniqueSuffix + ext;
    console.log("➡️ [Multer] Generated filename:", fileName);
    cb(null, fileName);
  },
});
const mimeToExt = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};
// Bộ lọc file ảnh
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  console.log("📥 [Multer] File nhận:", file.originalname);
  console.log("📥 [Multer] Mimetype:", mime);
  console.log("📥 [Multer] Extension:", ext);

  const allowedMime = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMime.includes(mime)) {
    console.log("✅ [Multer] File hợp lệ theo mimetype");
    cb(null, true);
  } else {
    console.error("❌ [Multer] File không hợp lệ");
    cb(
      new Error(
        `Chỉ cho phép upload file ảnh! File nhận: ${file.originalname}, mime: ${mime}, ext: ${ext}`
      )
    );
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;
