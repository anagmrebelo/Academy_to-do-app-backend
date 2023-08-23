import { DbTask } from "../db/tasks";
import { User } from "../db/users";

export const calculateTextAndParamsSet = (
  newData: Partial<DbTask> | Partial<User>,
  id: number
): { text: string; params: (string | boolean | number)[] } | undefined => {
  if (!newData) {
    return undefined;
  }
  const keys = Object.keys(newData) as (keyof typeof newData)[];
  const setColumns = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");

  const retStr = `SET ${setColumns} WHERE id=$${keys.length + 1}`;

  const values: (string | boolean | number)[] = keys.map((key) => newData[key]);
  values.push(id);

  return { text: retStr, params: values };
};

export const calculateTextAndParamsOptions = (options: {
  filter: boolean;
  sort: boolean;
}): { text: string; params: boolean[] } | undefined => {
  if (!options) {
    return undefined;
  }

  const { sort, filter } = options;
  let text = "";
  const params = [];

  if (filter) {
    text += " AND status=$2";
    params.push(false);
  }
  if (sort) {
    text += " ORDER BY due_date";
  } else {
    text += " ORDER BY id DESC";
  }
  return { text: text, params: params };
};
