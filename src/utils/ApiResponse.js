// utils/ApiResponse.js
/**
 * Standardized API Response Class
 */
export class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }
}

// utils/ApiError.js
/**
 * Custom API Error Class
 */
export class ApiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;
    this.timestamp = new Date().toISOString();

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// utils/asyncHandler.js
/**
 * Wrapper để handle async functions trong Express
 */
export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

// utils/catchAsync.js (alternative name)
export const catchAsync = asyncHandler;

// Predefined error types
export const ErrorTypes = {
  VALIDATION_ERROR: "ValidationError",
  AUTHENTICATION_ERROR: "AuthenticationError",
  AUTHORIZATION_ERROR: "AuthorizationError",
  NOT_FOUND_ERROR: "NotFoundError",
  DUPLICATE_ERROR: "DuplicateError",
  RATE_LIMIT_ERROR: "RateLimitError",
  SERVER_ERROR: "ServerError",
};

// Common error messages
export const ErrorMessages = {
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không chính xác",
  UNAUTHORIZED: "Bạn không có quyền truy cập",
  FORBIDDEN: "Bạn không có quyền thực hiện hành động này",
  NOT_FOUND: "Không tìm thấy tài nguyên",
  VALIDATION_FAILED: "Dữ liệu không hợp lệ",
  DUPLICATE_RESOURCE: "Tài nguyên đã tồn tại",
  RATE_LIMIT_EXCEEDED: "Quá nhiều yêu cầu, vui lòng thử lại sau",
  SERVER_ERROR: "Lỗi máy chủ nội bộ",
  INVALID_TOKEN: "Token không hợp lệ",
  EXPIRED_TOKEN: "Token đã hết hạn",
  MISSING_TOKEN: "Thiếu token xác thực",
  INVALID_OBJECT_ID: "ID không hợp lệ",
  FILE_TOO_LARGE: "File quá lớn",
  INVALID_FILE_TYPE: "Loại file không được hỗ trợ",
};

// HTTP Status Codes
export const HttpStatusCodes = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

// Success response helpers
export const successResponse = (
  res,
  data,
  message = "Success",
  statusCode = 200
) => {
  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, data, message));
};

export const createdResponse = (
  res,
  data,
  message = "Created successfully"
) => {
  return res.status(201).json(new ApiResponse(201, data, message));
};

export const noContentResponse = (res, message = "No content") => {
  return res.status(204).json(new ApiResponse(204, null, message));
};

// Error response helpers
export const badRequestError = (message, errors = []) => {
  return new ApiError(400, message, errors);
};

export const unauthorizedError = (message = ErrorMessages.UNAUTHORIZED) => {
  return new ApiError(401, message);
};

export const forbiddenError = (message = ErrorMessages.FORBIDDEN) => {
  return new ApiError(403, message);
};

export const notFoundError = (message = ErrorMessages.NOT_FOUND) => {
  return new ApiError(404, message);
};

export const conflictError = (message = ErrorMessages.DUPLICATE_RESOURCE) => {
  return new ApiError(409, message);
};

export const validationError = (
  message = ErrorMessages.VALIDATION_FAILED,
  errors = []
) => {
  return new ApiError(422, message, errors);
};

export const rateLimitError = (message = ErrorMessages.RATE_LIMIT_EXCEEDED) => {
  return new ApiError(429, message);
};

export const serverError = (message = ErrorMessages.SERVER_ERROR) => {
  return new ApiError(500, message);
};

// Default exports
export default {
  ApiResponse,
  asyncHandler,
  catchAsync,
  ErrorTypes,
  ErrorMessages,
  HttpStatusCodes,
  successResponse,
  createdResponse,
  noContentResponse,
  badRequestError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
  conflictError,
  validationError,
  rateLimitError,
  serverError,
};
