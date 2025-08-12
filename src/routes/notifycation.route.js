import { Router } from "express";
import articleController from "../controllers/article.controller.js";
import verifyToken from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { getNotifycationsByUser } from "../controllers/notifycation.controller.js";

const router = Router();

router.get("/", verifyToken, getNotifycationsByUser);

export default router;
