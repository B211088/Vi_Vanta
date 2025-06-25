import multer from "multer";
import fs from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "uploads");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created upload directory: ${uploadDir}`);
}

// Utility function để decode tên file tiếng Việt
const decodeVietnameseFilename = (filename) => {
  try {
    // Thử các cách decode khác nhau
    const methods = [
      () => Buffer.from(filename, "latin1").toString("utf8"),
      () => decodeURIComponent(filename),
      () => decodeURIComponent(escape(filename)),
      () => filename, // Giữ nguyên nếu không decode được
    ];

    for (const method of methods) {
      try {
        const decoded = method();
        // Kiểm tra xem có decode thành công không (không còn ký tự lỗi)
        if (
          !decoded.includes("Ã") &&
          !decoded.includes("â€") &&
          decoded !== filename
        ) {
          console.log(
            `Successfully decoded filename: ${filename} -> ${decoded}`
          );
          return decoded;
        }
      } catch (e) {
        continue;
      }
    }

    console.log(`Could not decode filename, using original: ${filename}`);
    return filename;
  } catch (error) {
    console.warn("Error decoding filename:", error);
    return filename;
  }
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Decode tên file tiếng Việt
    const decodedName = decodeVietnameseFilename(file.originalname);

    // Generate unique filename with timestamp and decoded name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(decodedName);
    const baseName = path.basename(decodedName, extension);

    // Tạo tên file an toàn (loại bỏ ký tự đặc biệt nếu cần)
    const safeName = baseName.replace(
      /[^\w\s-áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđĐ]/gi,
      ""
    );

    const finalFilename = `${safeName}-${uniqueSuffix}${extension}`;
    console.log(`Generated filename: ${finalFilename}`);

    cb(null, finalFilename);
  },
});

// File filter to validate file types và decode tên file
const fileFilter = (req, file, cb) => {
  // Decode tên file trước khi validate
  const decodedName = decodeVietnameseFilename(file.originalname);
  file.originalname = decodedName; // Cập nhật lại tên file đã decode

  const allowedTypes = [".pdf", ".txt", ".md", ".json"];
  const fileExtension = path.extname(decodedName).toLowerCase();

  console.log(`Processing file: ${decodedName} (extension: ${fileExtension})`);

  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type ${fileExtension} not supported. Allowed types: ${allowedTypes.join(
          ", "
        )}`
      ),
      false
    );
  }
};

// Configure multer with limits and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit (sửa comment cho đúng)
    files: 1, // Only one file at a time
  },
});

// Error handling middleware for multer
export const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        error: "File too large",
        message: "File size must be less than 500MB", // Sửa message cho đúng
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Too many files",
        message: "Only one file can be uploaded at a time",
      });
    }
  }

  if (error.message.includes("File type")) {
    return res.status(400).json({
      error: "Invalid file type",
      message: error.message,
    });
  }

  next(error);
};

// Middleware để decode tên file sau khi upload (backup solution)
export const decodeFilename = (req, res, next) => {
  if (req.file && req.file.originalname) {
    const decodedName = decodeVietnameseFilename(req.file.originalname);
    req.file.originalname = decodedName;
    console.log(`File uploaded with decoded name: ${decodedName}`);
  }
  next();
};

export default upload;
