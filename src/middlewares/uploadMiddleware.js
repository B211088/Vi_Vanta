import multer from "multer";
import fs from "fs";
import path from "path";

// Tạo thư mục upload cho từng loại file
const uploadsDir = path.join(process.cwd(), "uploads");
const imagesDir = path.join(uploadsDir, "images");
const documentsDir = path.join(uploadsDir, "documents");

// Ensure upload directories exist
[uploadsDir, imagesDir, documentsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Utility function để decode tên file tiếng Việt
const decodeVietnameseFilename = (filename) => {
  try {
    if (!filename) return filename;

    // Nếu filename không có extension và là "thumbnail", bỏ qua
    if (filename === "thumbnail" || filename.startsWith("thumbnail")) {
      console.log(`Skipping thumbnail file: ${filename}`);
      return null; // Trả về null để filter bỏ qua
    }

    const methods = [
      () => filename, // Thử original trước
      () => Buffer.from(filename, "latin1").toString("utf8"),
      () => decodeURIComponent(filename),
      () => decodeURIComponent(escape(filename)),
    ];

    for (const method of methods) {
      try {
        const decoded = method();
        if (decoded && decoded.length > 0) {
          // Kiểm tra xem có extension không
          const ext = path.extname(decoded);
          if (ext) {
            // Kiểm tra xem decode có làm hỏng không
            if (
              !decoded.includes("�") &&
              !decoded.includes("Ã") &&
              !decoded.includes("â€")
            ) {
              console.log(
                `Successfully decoded filename: ${filename} -> ${decoded}`
              );
              return decoded;
            }
          }
        }
      } catch (e) {
        continue;
      }
    }

    console.log(`Could not decode filename properly: ${filename}`);
    // Nếu không decode được, tạo tên file mặc định
    const timestamp = Date.now();
    return `file_${timestamp}.bin`;
  } catch (error) {
    console.warn("Error decoding filename:", error);
    return `file_${Date.now()}.bin`;
  }
};

// Generate safe filename
const generateSafeFilename = (originalName) => {
  if (!originalName) return `file-${Date.now()}.bin`;

  const decodedName = decodeVietnameseFilename(originalName);
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const extension = path.extname(decodedName);
  const baseName = path.basename(decodedName, extension);

  const safeName = baseName.replace(
    /[^\w\s-áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđĐ]/gi,
    ""
  );

  return `${safeName}-${uniqueSuffix}${extension}`;
};

// CÁCH 1: Tạo 2 middleware riêng biệt

// Config cho upload ảnh
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const finalFilename = generateSafeFilename(file.originalname);
    console.log(`Generated image filename: ${finalFilename}`);
    cb(null, finalFilename);
  },
});

const imageFilter = (req, file, cb) => {
  console.log(`Raw file info:`, {
    originalname: file.originalname,
    mimetype: file.mimetype,
    fieldname: file.fieldname,
  });

  // Decode tên file trước khi xử lý
  const decodedName = decodeVietnameseFilename(file.originalname);

  // Nếu file bị filter bỏ (như thumbnail), skip
  if (decodedName === null) {
    console.log(`Skipping file: ${file.originalname}`);
    return cb(null, false); // Bỏ qua file này, không lưu
  }

  const fileExtension = path.extname(decodedName).toLowerCase();

  console.log(`Processing image: ${decodedName} (extension: ${fileExtension})`);

  // Kiểm tra extension và mimetype
  const allowedImageTypes = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ];

  // Kiểm tra extension
  if (!fileExtension) {
    console.error(`No extension found for file: ${decodedName}`);
    return cb(null, false); // Bỏ qua thay vì báo lỗi
  }

  // Kiểm tra cả extension và mimetype
  const isValidExtension = allowedImageTypes.includes(fileExtension);
  const isValidMimeType = allowedMimeTypes.includes(file.mimetype);

  if (isValidExtension && isValidMimeType) {
    // Update originalname sau khi decode
    file.originalname = decodedName;
    cb(null, true);
  } else {
    console.log(
      `Invalid file type, skipping: ${decodedName} (${file.mimetype})`
    );
    cb(null, false); // Bỏ qua thay vì báo lỗi
  }
};

// Config cho upload tài liệu
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const finalFilename = generateSafeFilename(file.originalname);
    console.log(`Generated document filename: ${finalFilename}`);
    cb(null, finalFilename);
  },
});

const documentFilter = (req, file, cb) => {
  console.log(`Raw file info:`, {
    originalname: file.originalname,
    mimetype: file.mimetype,
    fieldname: file.fieldname,
  });

  const decodedName = decodeVietnameseFilename(file.originalname);

  // Nếu file bị filter bỏ (như thumbnail), skip
  if (decodedName === null) {
    console.log(`Skipping file: ${file.originalname}`);
    return cb(null, false);
  }

  const fileExtension = path.extname(decodedName).toLowerCase();

  console.log(
    `Processing document: ${decodedName} (extension: ${fileExtension})`
  );

  const allowedDocumentTypes = [
    ".pdf",
    ".txt",
    ".md",
    ".json",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
  ];

  if (!fileExtension) {
    console.log(`No extension found for file: ${decodedName}, skipping`);
    return cb(null, false);
  }

  if (allowedDocumentTypes.includes(fileExtension)) {
    file.originalname = decodedName;
    cb(null, true);
  } else {
    console.log(
      `Invalid document type, skipping: ${decodedName} (${fileExtension})`
    );
    cb(null, false);
  }
};

// Middleware cho upload ảnh
export const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB cho từng ảnh
    fieldSize: 25 * 1024 * 1024, // 25MB cho field
  },
});

// Middleware cho upload tài liệu
export const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB cho tài liệu
    files: 1,
    fieldSize: 25 * 1024 * 1024, // 25MB cho field
  },
});

// CÁCH 2: Middleware linh hoạt dựa trên type parameter

const flexibleStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadType = req.query.type || req.body.type || "document";
    const destinationDir = uploadType === "image" ? imagesDir : documentsDir;
    cb(null, destinationDir);
  },
  filename: (req, file, cb) => {
    const finalFilename = generateSafeFilename(file.originalname);
    console.log(`Generated filename: ${finalFilename}`);
    cb(null, finalFilename);
  },
});

const flexibleFilter = (req, file, cb) => {
  console.log(`Raw file info:`, {
    originalname: file.originalname,
    mimetype: file.mimetype,
    fieldname: file.fieldname,
  });

  const decodedName = decodeVietnameseFilename(file.originalname);

  // Nếu file bị filter bỏ (như thumbnail), skip
  if (decodedName === null) {
    console.log(`Skipping file: ${file.originalname}`);
    return cb(null, false);
  }

  const uploadType = req.query.type || req.body.type || "document";
  const fileExtension = path.extname(decodedName).toLowerCase();

  console.log(
    `Processing ${uploadType}: ${decodedName} (extension: ${fileExtension})`
  );

  let allowedTypes = [];
  let allowedMimeTypes = [];
  let maxSize = 500 * 1024 * 1024; // Default 500MB

  if (uploadType === "image") {
    allowedTypes = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    maxSize = 10 * 1024 * 1024; // 10MB for images
  } else {
    allowedTypes = [
      ".pdf",
      ".txt",
      ".md",
      ".json",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
    ];
    allowedMimeTypes = [
      "application/pdf",
      "text/plain",
      "text/markdown",
      "application/json",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
  }

  if (!fileExtension) {
    console.log(`No extension found for file: ${decodedName}, skipping`);
    return cb(null, false);
  }

  // Kiểm tra extension
  const isValidExtension = allowedTypes.includes(fileExtension);

  if (isValidExtension) {
    // Set dynamic file size limit
    req.fileSizeLimit = maxSize;
    file.originalname = decodedName;
    cb(null, true);
  } else {
    console.log(
      `Invalid ${uploadType} type, skipping: ${decodedName} (${fileExtension})`
    );
    cb(null, false);
  }
};

// Middleware linh hoạt
export const uploadFlexible = multer({
  storage: flexibleStorage,
  fileFilter: flexibleFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // Max limit, sẽ được check trong filter
    files: 1,
    fieldSize: 25 * 1024 * 1024, // 25MB cho field
  },
});

// Error handling middleware
export const handleMulterError = (error, req, res, next) => {
  console.error("Multer error:", error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      const uploadType = req.query.type || req.body.type || "document";
      const maxSize = uploadType === "image" ? "10MB" : "500MB";
      return res.status(400).json({
        error: "File too large",
        message: `File size must be less than ${maxSize}`,
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        error: "Too many files",
        message: "Only one file can be uploaded at a time",
      });
    }
    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        error: "Unexpected field",
        message: "Unexpected field name in upload",
      });
    }
  }

  if (
    error.message.includes("type") &&
    error.message.includes("not supported")
  ) {
    return res.status(400).json({
      error: "Invalid file type",
      message: error.message,
    });
  }

  if (error.message.includes("extension")) {
    return res.status(400).json({
      error: "Invalid file",
      message: error.message,
    });
  }

  // Generic error
  return res.status(500).json({
    error: "Upload failed",
    message: error.message || "Unknown error occurred during upload",
  });
};

// Middleware để decode tên file sau khi upload
export const decodeFilename = (req, res, next) => {
  if (req.file && req.file.originalname) {
    const decodedName = decodeVietnameseFilename(req.file.originalname);
    req.file.originalname = decodedName;
    console.log(`File uploaded with decoded name: ${decodedName}`);
  }
  next();
};

// Export default (giữ tương thích với code cũ - sẽ upload như document)
export default uploadDocument;
