import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  getDbTasksFromUser,
  getDbTaskById,
  addDbTask,
  deleteDbTaskById,
  updateDbTaskById,
  DbTask,
} from "./db/tasks";
import { updateUserById, getUserOption, getAllDbUsers, User } from "./db/users";

const app = express();

/** Parses JSON data in a request automatically */
app.use(express.json());
/** To allow 'Cross-Origin Resource Sharing': https://en.wikipedia.org/wiki/Cross-origin_resource_sharing */
app.use(cors());

// read in contents of any environment variables in the .env file
dotenv.config();

// use the environment variable PORT, or 4000 as a fallback
const PORT_NUMBER = process.env.PORT ?? 4000;

// GET /tasks/:user
app.get<{ userId: string }>("/tasks/:userId", async (req, res) => {
  const allTasks = await getDbTasksFromUser(parseInt(req.params.userId));
  allTasks ? res.status(200).json(allTasks) : res.status(404).json("Error");
});

// POST /tasks
app.post<{}, {}, DbTask>("/tasks", async (req, res) => {
  const postData: DbTask = req.body;
  const createdTask = await addDbTask(postData);
  createdTask
    ? res.status(201).json(createdTask)
    : res.status(404).json("Error");
});

// DELETE /tasks/:id
app.delete<{ id: string }>("/tasks/:id", async (req, res) => {
  const matchingTask = await getDbTaskById(parseInt(req.params.id));
  if (!matchingTask) {
    res.status(404).json("Error");
  } else {
    const deletedTask = await deleteDbTaskById(parseInt(req.params.id));
    deletedTask
      ? res.status(200).json(matchingTask)
      : res.status(404).json("Error");
  }
});

// PATCH /tasks/:id
app.patch<{ id: string }, {}, Partial<DbTask>>(
  "/tasks/:id",
  async (req, res) => {
    const matchingTask = await updateDbTaskById(
      parseInt(req.params.id),
      req.body
    );
    matchingTask
      ? res.status(200).json(matchingTask)
      : res.status(404).json("Error");
  }
);

// GET /users
app.get("/users", async (req, res) => {
  const allUsers = await getAllDbUsers();
  allUsers ? res.status(200).json(allUsers) : res.status(404).json("Error");
});

export type Option = "filter" | "sort";

// PATCH /users/:id
app.patch<{ id: string }, {}, { option: Option }>(
  "/users/:id",
  async (req, res) => {
    const { option } = req.body;
    const optionValue = await getUserOption(option, parseInt(req.params.id));
    if (optionValue === undefined) {
      return undefined;
    }

    const optionObj: Partial<User> = {};
    optionObj[option] = !optionValue;
    const matchingUser = await updateUserById(
      parseInt(req.params.id),
      optionObj
    );

    matchingUser
      ? res.status(200).json(matchingUser)
      : res.status(404).json("Error");
  }
);

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});

// // API info page
// app.get("/", (req, res) => {
//   // console.log("Got here!");
//   doDemo();
//   res.status(200).json({ status: true });
// });
