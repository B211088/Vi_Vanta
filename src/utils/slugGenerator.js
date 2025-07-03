// utils/slugGenerator.js
export function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// utils/responseHandler.js
export function handleResponse(
  res,
  statusCode,
  message,
  data = null,
  errors = null
) {
  const response = {
    success: statusCode < 400,
    message,
    ...(data && { data }),
    ...(errors && { errors }),
  };

  return res.status(statusCode).json(response);
}
