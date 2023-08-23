import dotenv from "dotenv";
import { Option } from "./server";
import * as db from "./db/index";

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

export interface User {
  name: string;
  sort: boolean;
  filter: boolean;
}

export interface UserWithId extends User {
  id: number;
}

/**
 * Find all database tasks
 * @returns all database tasks from the database
 */
export const getAllDbTasks = async (
  user_id: number
): Promise<DbTaskWithId[] | undefined> => {
  let dbResult;
  const options = await getOptionsFromUser(user_id);
  if (!options) {
    return undefined;
  }
  const text = "SELECT * from tasks" + " WHERE user_id=$1" + options.text;
  const values = [user_id, ...options.params];

  try {
    dbResult = await db.query(text, values);
  } catch (err) {
    console.error((err as Error).stack);
  }

  return dbResult?.rows;
};

const getOptionsFromUser = async (
  user_id: number
): Promise<{ text: string; params: boolean[] } | undefined> => {
  let textOptions = "";
  const textParams: boolean[] = [];
  const text = "SELECT sort, filter from users WHERE id=$1";
  const values = [user_id];
  let res;

  try {
    res = await db.query(text, values);
  } catch (err) {
    console.error((err as Error).stack);
  }

  if (!res) {
    return undefined;
  }
  const { sort, filter } = res.rows[0];
  if (filter) {
    textOptions += " AND status=$2";
    textParams.push(false);
  }
  if (sort) {
    textOptions += " ORDER BY due_date";
  } else {
    textOptions += " ORDER BY id DESC";
  }
  return { text: textOptions, params: textParams };
};

/**
 * Adds in a single task to the database
 *
 * @param data - the task data to insert in
 * @returns the task added (with a newly created id)
 */
export const addDbTask = async (
  data: DbTask
): Promise<DbTaskWithId | undefined> => {
  const { user_id, value, due_date, status } = data;

  const text =
    "INSERT INTO tasks (user_id, value, due_date, status) VALUES($1, $2, $3, $4) RETURNING id, user_id, value, due_date, status";
  const values = [user_id, value, due_date, status];
  let res;

  try {
    res = await db.query(text, values);
  } catch (err) {
    console.error((err as Error).stack);
  }

  return res?.rows[0];
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
): Promise<DbTaskWithId | "not found" | undefined> => {
  const text =
    "SELECT id, user_id, value, due_date, status FROM tasks WHERE id=$1";
  const values = [id];
  let res;

  try {
    res = await db.query(text, values);
  } catch (err) {
    console.error((err as Error).stack);
  }
  if (!res) {
    return undefined;
  } else if (res.rowCount) {
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
): Promise<DbTaskWithId | "not found" | undefined> => {
  const matchingTask = await getDbTaskById(id);
  if (matchingTask === "not found") {
    return matchingTask;
  }
  const text =
    "DELETE FROM tasks WHERE id=$1 RETURNING id, user_id, value, due_date, status";
  const values = [id];
  let res;

  try {
    res = await db.query(text, values);
  } catch (err) {
    console.error((err as Error).stack);
  }

  return res?.rows[0];
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
): Promise<DbTaskWithId | "not found" | undefined> => {
  const matchingTask = await getDbTaskById(id);
  if (matchingTask === "not found") {
    return matchingTask;
  }

  const setTextAndParams = convertObjIntoStr(newData);
  const text = `UPDATE tasks ${setTextAndParams.setText} RETURNING id, user_id, value, due_date, status`;
  const values = [...setTextAndParams.params, id];
  let res;

  try {
    res = await db.query(text, values);
  } catch (err) {
    console.error((err as Error).stack);
  }

  return res?.rows[0];
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

export const updateUserById = async (
  id: number,
  newData: Partial<User>
): Promise<UserWithId | "not found" | undefined> => {
  const matchingUser = await getDbUserById(id);
  if (matchingUser === "not found") {
    return matchingUser;
  }

  const setTextAndParams = convertObjIntoStr(newData);
  const text = `UPDATE users ${setTextAndParams.setText} RETURNING id, name, sort, filter`;
  const values = [...setTextAndParams.params, id];
  let res;

  try {
    res = await db.query(text, values);
  } catch (err) {
    console.error((err as Error).stack);
  }
  return res?.rows[0];
};

/**
 * Locates a database user by a given id
 *
 * @param id - the id of the database user to locate
 * @returns the located database user (if found),
 *  otherwise the string `"not found"`
 */
export const getDbUserById = async (
  id: number
): Promise<UserWithId | "not found" | undefined> => {
  const text = "SELECT * FROM users WHERE id=$1";
  const values = [id];
  let res;

  try {
    res = await db.query(text, values);
  } catch (err) {
    console.error((err as Error).stack);
  }

  if (!res) {
    return undefined;
  } else if (res.rowCount) {
    return res.rows[0];
  } else {
    return "not found";
  }
};

export const getUserOption = async (
  option: Option,
  id: number
): Promise<boolean> => {
  const text = "SELECT * FROM users WHERE id=$1";
  const values = [id];
  let res;

  try {
    res = await db.query(text, values);
  } catch (err) {
    console.error((err as Error).stack);
  }

  return res?.rows[0][option];
};

/**
 * Find all database users
 * @returns all database users from the database
 */
export const getAllDbUsers = async (): Promise<UserWithId[] | undefined> => {
  let res;
  const text = "SELECT * from users";

  try {
    res = await db.query(text, []);
  } catch (err) {
    console.error((err as Error).stack);
  }
  return res?.rows;
};
