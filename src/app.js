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
import informationSocietyRouter from "./routes/informationSociety.route.js";
import emergencyContactRouter from "./routes/emergencyContact.route.js";
import pregnancyRouter from "./routes/pregnancy.route.js";
import healthRouter from "./routes/health.route.js";
import menstrualCycleRouter from "./routes/menstrualCycle.route.js";
import diseasesRouter from "./routes/diseases.route.js";
import medicationRouter from "./routes/medication.route.js";
import medicationCategoryRouter from "./routes/medicationCategory.route.js";
import diseaseCategoryRouter from "./routes/diseaseCategory.route.js";
import childrenRouter from "./routes/children.route.js";
import vaccinCategoryRouter from "./routes/vaccinCategory.route.js";
import vaccineRouter from "./routes/vaccine.route.js";
import clinicRouter from "./routes/clinic.route.js";

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Quá nhiều yêu cầu từ IP này, hãy thử lại sau 15 phút.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "CSRF-Token"],
  })
);
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
app.use("/api/v1/information-society", informationSocietyRouter);
app.use("/api/v1/emergency-contact", emergencyContactRouter);
app.use("/api/v1/pregnancy", pregnancyRouter);
app.use("/api/v1/health", healthRouter);
app.use("/api/v1/menstrual-cycle", menstrualCycleRouter);
app.use("/api/v1/diseases", diseasesRouter);
app.use("/api/v1/medication", medicationRouter);
app.use("/api/v1/medication-categories", medicationCategoryRouter);
app.use("/api/v1/disease-categories", diseaseCategoryRouter);
app.use("/api/v1/children", childrenRouter);
app.use("/api/v1/vaccines", vaccineRouter);
app.use("/api/v1/vaccin-categories", vaccinCategoryRouter);
app.use("/api/v1/clinics", clinicRouter);

app.get("/api/v1/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

export default app;
