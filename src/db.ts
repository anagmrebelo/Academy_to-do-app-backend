import { Client } from "pg";
import dotenv from "dotenv";

dotenv.config(); //read any .env file(s)

if (!process.env.DATABASE_URL) {
  throw "No DATABASE_URL env var provided.  Did you create an .env file?";
}

const config = {
  connectionString: process.env.DATABASE_URL,
};

export interface DbTask {
  user_id: number;
  value: string;
  due_date: string;
  status: boolean;
}

export interface DbTaskWithId extends DbTask {
  id: number;
}

/**
 * Find all database tasks
 * @returns all database tasks from the database
 */
export const getAllDbTasks = async (): Promise<DbTaskWithId[]> => {
  const client = new Client(config);
  await client.connect();
  const res = await client.query("SELECT * from tasks");
  await client.end();
  return res.rows.sort((a: DbTaskWithId, b: DbTaskWithId) => b.id - a.id);
};

/**
 * Adds in a single task to the database
 *
 * @param data - the task data to insert in
 * @returns the task added (with a newly created id)
 */
export const addDbTask = async (data: DbTask) => {
  const client = new Client(config);
  const { user_id, value, due_date, status } = data;

  await client.connect();
  const text =
    "INSERT INTO tasks (user_id, value, due_date, status) VALUES($1, $2, $3, $4) RETURNING id, user_id, value, due_date, status";
  const values = [user_id, value, due_date, status];
  const res = await client.query(text, values);
  await client.end();

  return res.rows[0];
};

/**
 * Locates a database task by a given id
 *
 * @param id - the id of the database task to locate
 * @returns the located database task (if found),
 *  otherwise the string `"not found"`
 */
export const getDbTaskById = async (
  id: number
): Promise<DbTaskWithId | "not found"> => {
  const client = new Client(config);

  await client.connect();
  const text =
    "SELECT id, user_id, value, due_date, status FROM tasks WHERE id=$1";
  const values = [id];
  const res = await client.query(text, values);
  await client.end();

  if (res.rowCount) {
    return res.rows[0];
  } else {
    return "not found";
  }
};

/**
 * Deletes a database task with the given id
 *
 * @param id - the id of the database task to delete
 * @returns the deleted database task (if originally located),
 *  otherwise the string `"not found"`
 */
export const deleteDbTaskById = async (
  id: number
): Promise<DbTaskWithId | "not found"> => {
  const matchingTask = await getDbTaskById(id);
  if (matchingTask === "not found") {
    return matchingTask;
  }
  const client = new Client(config);
  await client.connect();
  const text =
    "DELETE FROM tasks WHERE id=$1 RETURNING id, user_id, value, due_date, status";
  const values = [id];
  const res = await client.query(text, values);
  await client.end();

  return res.rows[0];
};

/**
 * Applies a partial update to a database task for a given id
 *  based on the passed data
 *
 * @param id - the id of the database task to update
 * @param newData - the new data to overwrite
 * @returns the updated database task (if one is located),
 *  otherwise the string `"not found"`
 */
export const updateDbTaskById = async (
  id: number,
  newData: Partial<DbTask>
): Promise<DbTaskWithId | "not found"> => {
  const matchingTask = await getDbTaskById(id);
  if (matchingTask === "not found") {
    return matchingTask;
  }
  const client = new Client(config);
  await client.connect();
  const setTextAndParams = convertObjIntoStr(newData);
  const text = `UPDATE tasks ${setTextAndParams.setText} RETURNING id, user_id, value, due_date, status`;
  const values = [...setTextAndParams.params, id];
  const res = await client.query(text, values);
  await client.end();

  return res.rows[0];
};

const convertObjIntoStr = (
  newData: any
): { setText: string; params: (string | boolean | number)[] } => {
  let retStr = "SET ";
  const params = [];
  let paramCounter = 1;
  for (const key in newData) {
    if (paramCounter != 1) {
      retStr += ",";
    }
    retStr += `${key}=$${paramCounter}`;
    params.push(newData[key]);
    paramCounter++;
  }
  retStr += `WHERE id=$${paramCounter}`;
  return { setText: retStr, params: params };
};

// /**
//  * Find all database tasks that are incomplete
//  * @returns all database tasks from the database
//  */
// export const getIncompleteDbTasks = (): DbTaskWithId[] => {
//   const db_reverse_filtered = [...db]
//     .filter((oneTask) => !oneTask.status)
//     .reverse();
//   return db_reverse_filtered;
// };
