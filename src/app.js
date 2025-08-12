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
import "./helpers/autoCancelAppointments.js";
import authRouter from "./routes/auth.route.js";
import addressRouter from "./routes/address.route.js";
import userRoutes from "./routes/user.route.js";
import healthRouter from "./routes/health.route.js";
import childrenRouter from "./routes/children.route.js";
import clinicRouter from "./routes/clinic.route.js";
import ragRouter from "./routes/ragOpenAI.routes.js";
import aiChatRoutes from "./routes/openAIChatBot.route.js";
import collectionRoutes from "./routes/collection.route.js";
import aiModalRouter from "./routes/aiModel.route.js";
import topicRouter from "./routes/topic.route.js";
import articleRouter from "./routes/article.route.js";
import chatbotRouter from "./routes/chatbot.route.js";
import doctorRouter from "./routes/doctor.route.js";
import healthAdviceRoutes from "./routes/healthAdvice.route.js";
import bookingServiceRouter from "./routes/bookingService.route.js";
import bookingRouter from "./routes/booking.route.js";
import notifycationRouter from "./routes/notifycation.route.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
      process.env.CLIENT_URL,
      process.env.ADMIN_CLIENT_URL,
      process.env.CHROMA_SERVER_URL,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

if (!fs.existsSync("voices")) {
  fs.mkdirSync("voices");
}
app.use("/voices", express.static(path.join(__dirname, "./voices")));
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
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/children", childrenRouter);
app.use("/api/v1/clinics", clinicRouter);
app.use("/api/v1/rag/openai", ragRouter);
app.use("/api/v1/openai-chat-bot", aiChatRoutes);
app.use("/api/v1/collections", collectionRoutes);
app.use("/api/v1/ai-modal", aiModalRouter);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/topics", topicRouter);
app.use("/api/v1/articles", articleRouter);
app.use("/api/v1/chatbot", chatbotRouter);
app.use("/api/v1/doctors", doctorRouter);
app.use("/api/v1/health-advices", healthAdviceRoutes);
app.use("/api/v1/booking-services", bookingServiceRouter);
app.use("/api/v1/booking", bookingRouter);
app.use("/api/v1/notifycation", notifycationRouter);

app.get("/api/v1/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

export default app;
