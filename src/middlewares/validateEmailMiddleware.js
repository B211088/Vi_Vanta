export const validateEmailMiddleware = (req, res, next) => {
  const email = req.body.email;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    return res.status(400).json({ message: "Email là bắt buộc." });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Email không hợp lệ." });
  }

  next();
};
