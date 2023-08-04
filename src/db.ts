export interface DbTask {
  value: string;
  dueDate: string;
  status: boolean;
}

export interface DbTaskWithId extends DbTask {
  id: number;
}

const db: DbTaskWithId[] = [];

/** Variable to keep incrementing id of database tasks */
let idCounter = 0;

/**
 * Adds in some dummy database tasks to the database
 *
 * @param n - the number of tasks to generate
 * @returns the created tasks
 */
export const addDummyDbTasks = (n: number): DbTaskWithId[] => {
  const createdSignatures: DbTaskWithId[] = [];
  for (let count = 0; count < n; count++) {
    const createdSignature = addDbTask({
      value: "Call Mom",
      dueDate: "2023-07-07",
      status: false,
    });
    createdSignatures.push(createdSignature);
  }
  return createdSignatures;
};

/**
 * Adds in a single task to the database
 *
 * @param data - the task data to insert in
 * @returns the task added (with a newly created id)
 */
export const addDbTask = (data: DbTask): DbTaskWithId => {
  const newEntry: DbTaskWithId = {
    id: ++idCounter,
    ...data,
  };
  db.push(newEntry);
  return newEntry;
};

/**
 * Deletes a database task with the given id
 *
 * @param id - the id of the database task to delete
 * @returns the deleted database task (if originally located),
 *  otherwise the string `"not found"`
 */
export const deleteDbTaskById = (id: number): DbTaskWithId | "not found" => {
  const idxToDeleteAt = findIndexOfDbTaskById(id);
  if (typeof idxToDeleteAt === "number") {
    const taskToDelete = getDbTaskById(id);
    db.splice(idxToDeleteAt, 1); // .splice can delete from an array
    return taskToDelete;
  } else {
    return "not found";
  }
};

/**
 * Finds the index of a database task with a given id
 *
 * @param id - the id of the database task to locate the index of
 * @returns the index of the matching database task,
 *  otherwise the string `"not found"`
 */
const findIndexOfDbTaskById = (id: number): number | "not found" => {
  const matchingIdx = db.findIndex((entry) => entry.id === id);
  // .findIndex returns -1 if not located
  if (matchingIdx !== -1) {
    return matchingIdx;
  } else {
    return "not found";
  }
};

/**
 * Find all database tasks
 * @returns all database tasks from the database
 */
export const getAllDbTasks = (): DbTaskWithId[] => {
  const db_reverse = [...db].reverse();
  return db_reverse;
};

/**
 * Locates a database task by a given id
 *
 * @param id - the id of the database task to locate
 * @returns the located database task (if found),
 *  otherwise the string `"not found"`
 */
export const getDbTaskById = (id: number): DbTaskWithId | "not found" => {
  const maybeEntry = db.find((entry) => entry.id === id);
  if (maybeEntry) {
    return maybeEntry;
  } else {
    return "not found";
  }
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
export const updateDbTaskById = (
  id: number,
  newData: Partial<DbTask>
): DbTaskWithId | "not found" => {
  const idxOfEntry = findIndexOfDbTaskById(id);
  // type guard against "not found"
  if (typeof idxOfEntry === "number") {
    return Object.assign(db[idxOfEntry], newData);
  } else {
    return "not found";
  }
};
