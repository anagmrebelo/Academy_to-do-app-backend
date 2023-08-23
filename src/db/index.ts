import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config(); //read any .env file(s)

if (!process.env.DATABASE_URL) {
  throw "No DATABASE_URL env var provided.  Did you create an .env file?";
}

const config = {
  connectionString: process.env.DATABASE_URL,
};

const client = new Client(config);

const connectToDb = async () => {
  await client.connect();
};

connectToDb();

export async function query(
  text: string,
  params: (string | number | boolean)[]
) {
  let res;

  try {
    res = await client.query(text, params);
  } catch (err) {
    console.error((err as Error).stack);
  }
  return res;
}
