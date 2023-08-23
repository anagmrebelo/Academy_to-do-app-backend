import { calculateTextAndParamsSet } from "../utils/prepareQuery";
import * as db from "./index";
import { Option } from "../server";

export interface User {
  name: string;
  sort: boolean;
  filter: boolean;
}

export interface UserWithId extends User {
  id: number;
}

/**
 * Find all database users
 * @returns all database users from the database
 */
export const getAllDbUsers = async (): Promise<UserWithId[] | undefined> => {
  const text = "SELECT * from users";

  const res = await db.query(text, []);
  return res?.rows;
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

  const res = await db.query(text, values);
  if (!res || !res.rowCount) {
    return undefined;
  } else {
    return res.rows[0];
  }
};

export const updateUserById = async (
  id: number,
  newData: Partial<User>
): Promise<UserWithId | "not found" | undefined> => {
  const matchingUser = await getDbUserById(id);
  if (!matchingUser) {
    return matchingUser;
  }

  const textAndParams = calculateTextAndParamsSet(newData, id);
  if (!textAndParams) {
    return undefined;
  }

  const text = `UPDATE users ${textAndParams.text} RETURNING id, name, sort, filter`;
  const values = [...textAndParams.params];

  const res = await db.query(text, values);
  return res?.rows[0];
};

export const getUserOption = async (
  option: Option,
  id: number
): Promise<boolean | undefined> => {
  const text = "SELECT * FROM users WHERE id=$1";
  const values = [id];

  const res = await db.query(text, values);

  return res?.rows[0][option];
};

/**
 * Find sort and filter options from a specific user
 *  @param id - the id of the database user to find options
 * @returns an object with sort and filter as booleans
 */
export const getOptionsFromUser = async (
  user_id: number
): Promise<{ sort: boolean; filter: boolean } | undefined> => {
  const text = "SELECT sort, filter from users WHERE id=$1";
  const values = [user_id];

  const res = await db.query(text, values);
  if (!res || !res.rowCount) {
    return undefined;
  }

  const { sort, filter } = res.rows[0];
  return { sort: sort, filter: filter };
};
