import express from "express";

import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
  chatWithChatBot,
  chatWithVoice,
  getVoiceMessages,
} from "../controllers/chatbot.controller.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/auth.config.js";

export const optionalAuth = (req, res, next) => {
  const token = req.cookies.token;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // Có userId và thông tin user
      req.isAuthenticated = true;
    } catch (err) {
      // Token không hợp lệ, xử lý như user chưa đăng nhập
      req.user = null;
      req.isAuthenticated = false;
    }
  } else {
    // Không có token, user chưa đăng nhập
    req.user = null;
    req.isAuthenticated = false;
  }

  next();
};
const router = express.Router();

// Sử dụng optionalAuth thay vì verifyToken
router.post("/chat", optionalAuth, chatWithChatBot);
router.post("/chat-voice", chatWithVoice);
router.get("/voice-messages/:userId", getVoiceMessages);

export default router;
