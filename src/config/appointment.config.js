import dotenv from "dotenv";
dotenv.config();

const EXPIRE_MINUTES = process.env.EXPIRE_MINUTES;

export { EXPIRE_MINUTES };
