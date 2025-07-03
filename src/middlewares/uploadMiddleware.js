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
    const methods = [
      () => Buffer.from(filename, "latin1").toString("utf8"),
      () => decodeURIComponent(filename),
      () => decodeURIComponent(escape(filename)),
      () => filename,
    ];

    for (const method of methods) {
      try {
        const decoded = method();
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

// Generate safe filename
const generateSafeFilename = (originalName) => {
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
  const decodedName = decodeVietnameseFilename(file.originalname);
  file.originalname = decodedName;

  const allowedImageTypes = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  const fileExtension = path.extname(decodedName).toLowerCase();

  console.log(`Processing image: ${decodedName} (extension: ${fileExtension})`);

  if (allowedImageTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Image type ${fileExtension} not supported. Allowed types: ${allowedImageTypes.join(
          ", "
        )}`
      ),
      false
    );
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
  const decodedName = decodeVietnameseFilename(file.originalname);
  file.originalname = decodedName;

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
  const fileExtension = path.extname(decodedName).toLowerCase();

  console.log(
    `Processing document: ${decodedName} (extension: ${fileExtension})`
  );

  if (allowedDocumentTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Document type ${fileExtension} not supported. Allowed types: ${allowedDocumentTypes.join(
          ", "
        )}`
      ),
      false
    );
  }
};

// Middleware cho upload ảnh
export const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB cho từng ảnh
    fieldSize: 25 * 1024 * 1024, // 25MB cho field
    // XÓA files: 1 ở đây để array hoạt động
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
  const decodedName = decodeVietnameseFilename(file.originalname);
  file.originalname = decodedName;

  const uploadType = req.query.type || req.body.type || "document";
  const fileExtension = path.extname(decodedName).toLowerCase();

  let allowedTypes = [];
  let maxSize = 500 * 1024 * 1024; // Default 500MB

  if (uploadType === "image") {
    allowedTypes = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
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
  }

  console.log(
    `Processing ${uploadType}: ${decodedName} (extension: ${fileExtension})`
  );

  if (allowedTypes.includes(fileExtension)) {
    // Set dynamic file size limit
    req.fileSizeLimit = maxSize;
    cb(null, true);
  } else {
    cb(
      new Error(
        `${uploadType} type ${fileExtension} not supported. Allowed types: ${allowedTypes.join(
          ", "
        )}`
      ),
      false
    );
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

  next(error);
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
