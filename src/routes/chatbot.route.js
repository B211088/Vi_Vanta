import express from "express";

import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { chatWithChatBot } from "../controllers/chatbot.controller.js";

const router = express.Router();
router.post("/chat", verifyToken, chatWithChatBot);

export default router;
