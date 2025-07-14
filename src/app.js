import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import compression from "compression";
import hpp from "hpp";
import morgan from "morgan";
import csurf from "csurf";

import authRouter from "./routes/auth.route.js";
import addressRouter from "./routes/address.route.js";
import userRoutes from "./routes/user.route.js";

import pregnancyRouter from "./routes/pregnancy.route.js";
import healthRouter from "./routes/health.route.js";
import menstrualCycleRouter from "./routes/menstrualCycle.route.js";
import medicationRouter from "./routes/medication.route.js";
import medicationCategoryRouter from "./routes/medicationCategory.route.js";
import childrenRouter from "./routes/children.route.js";
import vaccineRouter from "./routes/vaccine.route.js";
import clinicRouter from "./routes/clinic.route.js";
import exerciseRouter from "./routes/exercise.route.js";
import medicationReminderRouter from "./routes/medicationReminder.route.js";
import ragRouter from "./routes/ragOpenAI.routes.js";
import aiChatRoutes from "./routes/openAIChatBot.route.js";
import collectionRoutes from "./routes/collection.route.js";
import aiModalRouter from "./routes/aiModel.route.js";
import topicRouter from "./routes/topic.route.js";
import articleRouter from "./routes/article.route.js";
import chatbotRouter from "./routes/chatbot.route.js";
import doctorRouter from "./routes/doctor.route.js";
import fs from "fs";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Quá nhiều yêu cầu từ IP này, hãy thử lại sau 15 phút.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:8000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
app.use(bodyParser.json());
app.use(helmet());
app.use(cookieParser());
app.use(limiter);
app.use(compression({ level: 6, threshold: 1024 }));
app.use(hpp());
app.use(morgan("dev"));

if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    req.csrfToken = () => "development-token";
    next();
  });
} else {
  app.use(
    csurf({
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      },
    })
  );
}

app.use("/api/v1/user", authRouter);
app.use("/api/v1/address", addressRouter);
app.use("/api/v1/pregnancy", pregnancyRouter);
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/menstrual-cycle", menstrualCycleRouter);
app.use("/api/v1/medication", medicationRouter);
app.use("/api/v1/medication-categories", medicationCategoryRouter);
app.use("/api/v1/children", childrenRouter);
app.use("/api/v1/vaccines", vaccineRouter);
app.use("/api/v1/clinics", clinicRouter);
app.use("/api/v1/exercises", exerciseRouter);
app.use("/api/v1/medication-reminders", medicationReminderRouter);
app.use("/api/v1/rag/openai", ragRouter);
app.use("/api/v1/openai-chat-bot", aiChatRoutes);
app.use("/api/v1/collections", collectionRoutes);
app.use("/api/v1/ai-modal", aiModalRouter);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/topics", topicRouter);
app.use("/api/v1/articles", articleRouter);
app.use("/api/v1/chatbot", chatbotRouter);
app.use("/api/v1/doctors", doctorRouter);

app.get("/api/v1/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

export default app;
