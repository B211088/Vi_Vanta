dotenv.config();
import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route.js";
import addressRouter from "./routes/address.route.js";
import informationSocietyRouter from "./routes/informationSociety.route.js";
import emergencyContactRouter from "./routes/emergencyContact.route.js";
import pregnancyRouter from "./routes/pregnancy.route.js";
import rateLimit from "express-rate-limit";
import compression from "compression";

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Quá nhiều yêu cầu từ IP này, hãy thử lại sau 15 phút.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use([
  express.json(),
  express.urlencoded({ extended: true }),
  cors({
    credentials: true,
  }),
  bodyParser.json(),
  helmet(),
  cookieParser(),
  limiter,
  compression(),
]);

app.use("/api/v1/user", authRouter);
app.use("/api/v1/address", addressRouter);
app.use("/api/v1/information_society", informationSocietyRouter);
app.use("/api/v1/emergency_contact", emergencyContactRouter);
app.use("/api/v1/pregnancy", pregnancyRouter);

export default app;
