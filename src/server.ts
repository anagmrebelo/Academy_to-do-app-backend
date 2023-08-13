import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  getAllDbTasks,
  getDbTaskById,
  addDbTask,
  deleteDbTaskById,
  updateDbTaskById,
  updateUserById,
  DbTask,
  User,
} from "./db";

const app = express();

/** Parses JSON data in a request automatically */
app.use(express.json());
/** To allow 'Cross-Origin Resource Sharing': https://en.wikipedia.org/wiki/Cross-origin_resource_sharing */
app.use(cors());

// read in contents of any environment variables in the .env file
dotenv.config();

// use the environment variable PORT, or 4000 as a fallback
const PORT_NUMBER = process.env.PORT ?? 4000;

// GET /tasks
app.get("/tasks", async (req, res) => {
  const allTasks = await getAllDbTasks();
  res.status(200).json(allTasks);
});

// POST /tasks
app.post<{}, {}, DbTask>("/tasks", async (req, res) => {
  const postData: DbTask = req.body;
  const createdTask = await addDbTask(postData);
  res.status(201).json(createdTask);
});

// GET /tasks/:id
app.get<{ id: string }>("/tasks/:id", async (req, res) => {
  const matchingTask = await getDbTaskById(parseInt(req.params.id));
  if (matchingTask === "not found") {
    res.status(404).json(matchingTask);
  } else {
    res.status(200).json(matchingTask);
  }
});

// DELETE /tasks/:id
app.delete<{ id: string }>("/tasks/:id", async (req, res) => {
  const matchingTask = await getDbTaskById(parseInt(req.params.id));
  if (matchingTask === "not found") {
    res.status(404).json(matchingTask);
  } else {
    deleteDbTaskById(parseInt(req.params.id));
    res.status(200).json(matchingTask);
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
    if (matchingTask === "not found") {
      res.status(404).json(matchingTask);
    } else {
      res.status(200).json(matchingTask);
    }
  }
);

// PATCH /users/:id
app.patch<{ id: string }, {}, Partial<User>>("/users/:id", async (req, res) => {
  const matchingUser = await updateUserById(parseInt(req.params.id), req.body);
  if (matchingUser === "not found") {
    res.status(404).json(matchingUser);
  } else {
    res.status(200).json(matchingUser);
  }
});

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});

// // API info page
// app.get("/", (req, res) => {
//   // console.log("Got here!");
//   doDemo();
//   res.status(200).json({ status: true });
// });

// app.patch<{}, {}, { type: OptionUnion }>("/options", (req, res) => {
//   const optionType = req.body.type;
//   options[optionType] = !options[optionType];
//   res.status(200).json({ optionType: options[optionType] });
// });

// interface Option {
//   sort: boolean;
//   filter: boolean;
// }

// type OptionUnion = "filter" | "sort";

// const options: Option = {
//   sort: false,
//   filter: false,
// };
