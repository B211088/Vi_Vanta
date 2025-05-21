dotenv.config();
import dotenv from "dotenv";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = "30d";
const PUBLIC_ID_AVATAR_DEFAULT = process.env.PUBLIC_ID_AVATAR_DEFAULT;
const URL_AVATAR_DEFAULT = process.env.URL_AVATAR_DEFAULT;

export {
  JWT_SECRET,
  JWT_EXPIRATION,
  PUBLIC_ID_AVATAR_DEFAULT,
  URL_AVATAR_DEFAULT,
};
