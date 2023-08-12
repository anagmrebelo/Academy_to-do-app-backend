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
  return res.rows.reverse();
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
    "INSERT INTO tasks (user_id, value, due_date, status) VALUES($1, $2, $3, $4) RETURNING user_id, value, due_date, status";
  const values = [user_id, value, due_date, status];
  const res = await client.query(text, values);
  await client.end();

  return res.rows[0];
};

// /**
//  * Deletes a database task with the given id
//  *
//  * @param id - the id of the database task to delete
//  * @returns the deleted database task (if originally located),
//  *  otherwise the string `"not found"`
//  */
// export const deleteDbTaskById = (id: number): DbTaskWithId | "not found" => {
//   const idxToDeleteAt = findIndexOfDbTaskById(id);
//   if (typeof idxToDeleteAt === "number") {
//     const taskToDelete = getDbTaskById(id);
//     db.splice(idxToDeleteAt, 1); // .splice can delete from an array
//     return taskToDelete;
//   } else {
//     return "not found";
//   }
// };

// /**
//  * Finds the index of a database task with a given id
//  *
//  * @param id - the id of the database task to locate the index of
//  * @returns the index of the matching database task,
//  *  otherwise the string `"not found"`
//  */
// const findIndexOfDbTaskById = (id: number): number | "not found" => {
//   const matchingIdx = db.findIndex((entry) => entry.id === id);
//   // .findIndex returns -1 if not located
//   if (matchingIdx !== -1) {
//     return matchingIdx;
//   } else {
//     return "not found";
//   }
// };

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

// /**
//  * Locates a database task by a given id
//  *
//  * @param id - the id of the database task to locate
//  * @returns the located database task (if found),
//  *  otherwise the string `"not found"`
//  */
// export const getDbTaskById = (id: number): DbTaskWithId | "not found" => {
//   const maybeEntry = db.find((entry) => entry.id === id);
//   if (maybeEntry) {
//     return maybeEntry;
//   } else {
//     return "not found";
//   }
// };

// /**
//  * Applies a partial update to a database task for a given id
//  *  based on the passed data
//  *
//  * @param id - the id of the database task to update
//  * @param newData - the new data to overwrite
//  * @returns the updated database task (if one is located),
//  *  otherwise the string `"not found"`
//  */
// export const updateDbTaskById = (
//   id: number,
//   newData: Partial<DbTask>
// ): DbTaskWithId | "not found" => {
//   const idxOfEntry = findIndexOfDbTaskById(id);
//   // type guard against "not found"
//   if (typeof idxOfEntry === "number") {
//     return Object.assign(db[idxOfEntry], newData);
//   } else {
//     return "not found";
//   }
// };
