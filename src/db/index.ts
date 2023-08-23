import { Pool, QueryResult } from "pg";
import dotenv from "dotenv";

dotenv.config(); //read any .env file(s)

if (!process.env.DATABASE_URL) {
  throw "No DATABASE_URL env var provided.  Did you create an .env file?";
}

const config = {
  connectionString: process.env.DATABASE_URL,
};

const pool = new Pool(config);

export async function query(
  text: string,
  params: (string | number | boolean)[]
) {
  const res = await pool.query(text, params);
  return res;
}
