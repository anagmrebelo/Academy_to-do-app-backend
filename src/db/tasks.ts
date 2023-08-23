import {
  calculateTextAndParamsOptions,
  calculateTextAndParamsSet,
} from "../utils/prepareQuery";
import * as db from "./index";
import { getOptionsFromUser } from "./users";

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
 * Find database tasks from a given user id
 * @param id - the id of the database user
 * @returns all database tasks from the database
 */
export const getDbTasksFromUser = async (
  user_id: number
): Promise<DbTaskWithId[] | undefined> => {
  const options = await getOptionsFromUser(user_id);
  if (!options) {
    return undefined;
  }

  const textAndParams = calculateTextAndParamsOptions(options);
  if (!textAndParams) {
    return undefined;
  }
  const text = "SELECT * from tasks" + " WHERE user_id=$1" + textAndParams.text;
  const values = [user_id, ...textAndParams.params];

  const dbResult = await db.query(text, values);
  return dbResult?.rows;
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

  const res = await db.query(text, values);
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
): Promise<DbTaskWithId | undefined> => {
  const text =
    "SELECT id, user_id, value, due_date, status FROM tasks WHERE id=$1";
  const values = [id];

  const res = await db.query(text, values);
  if (!res || !res.rowCount) {
    return undefined;
  } else if (res.rowCount) {
    return res.rows[0];
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
): Promise<DbTaskWithId | undefined> => {
  const matchingTask = await getDbTaskById(id);
  if (!matchingTask) {
    return matchingTask;
  }

  const text =
    "DELETE FROM tasks WHERE id=$1 RETURNING id, user_id, value, due_date, status";
  const values = [id];

  const res = await db.query(text, values);
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
): Promise<DbTaskWithId | undefined> => {
  const matchingTask = await getDbTaskById(id);
  if (!matchingTask) {
    return undefined;
  }

  const textAndParams = calculateTextAndParamsSet(newData, id);
  if (!textAndParams) {
    return undefined;
  }
  const text = `UPDATE tasks ${textAndParams.text} RETURNING id, user_id, value, due_date, status`;
  const values = [...textAndParams.params];

  const res = await db.query(text, values);
  return res?.rows[0];
};
