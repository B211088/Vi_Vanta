dotenv.config();
import dotenv from "dotenv";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_EMBEDDING_MODEL = "text-embedding-3-small";
const MAX_TOKEN = 4000;
const TEMPERATURE = 1;

export { OPENAI_API_KEY, OPENAI_EMBEDDING_MODEL, MAX_TOKEN, TEMPERATURE };
