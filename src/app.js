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

const app = express();

app.use([
  express.json(),
  express.urlencoded({ extended: true }),
  cors({
    credentials: true,
  }),
  bodyParser.json(),
  helmet(),
  cookieParser(),
]);

app.use("/api/v1/user", authRouter);
app.use("/api/v1/address", addressRouter);
app.use("/api/v1/information_society", informationSocietyRouter);
app.use("/api/v1/emergency_contact", emergencyContactRouter);

export default app;
