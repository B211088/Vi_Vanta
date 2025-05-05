dotenv.config();
import dotenv from "dotenv";

const JWT_SECRET = process.env.JWT_SECRET || "34dfsfsdfdsfsdfsdfsdfsdfsdf";
const JWT_EXPIRATION = "30d";

export { JWT_SECRET, JWT_EXPIRATION };
