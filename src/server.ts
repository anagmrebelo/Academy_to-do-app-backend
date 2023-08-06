import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  addDummyDbTasks,
  addDbTask,
  getAllDbTasks,
  getDbTaskById,
  DbTask,
  updateDbTaskById,
  getIncompleteDbTasks,
  deleteDbTaskById,
} from "./db";
import filePath from "./filePath";

// loading in some dummy tasks into the database
// (comment out if desired, or change the number)
addDummyDbTasks(5);

interface Option {
  sort: boolean;
  filter: boolean;
}

type OptionUnion = "filter" | "sort";

const options: Option = {
  sort: false,
  filter: false,
};

const app = express();

/** Parses JSON data in a request automatically */
app.use(express.json());
/** To allow 'Cross-Origin Resource Sharing': https://en.wikipedia.org/wiki/Cross-origin_resource_sharing */
app.use(cors());

// read in contents of any environment variables in the .env file
dotenv.config();

// use the environment variable PORT, or 4000 as a fallback
const PORT_NUMBER = process.env.PORT ?? 4000;

// API info page
app.get("/", (req, res) => {
  const pathToFile = filePath("../public/index.html");
  res.sendFile(pathToFile);
});

// GET /tasks
app.get("/tasks", (req, res) => {
  let allSignaturesAfterOptions: DbTask[] = [];
  if (options.filter) {
    allSignaturesAfterOptions = getIncompleteDbTasks();
  } else {
    allSignaturesAfterOptions = getAllDbTasks();
  }
  res.status(200).json(allSignaturesAfterOptions);
});

// POST /tasks
app.post<{}, {}, DbTask>("/tasks", (req, res) => {
  // to be rigorous, ought to handle non-conforming request bodies
  // ... but omitting this as a simplification
  const postData = req.body;
  const createdSignature = addDbTask(postData);
  res.status(201).json(createdSignature);
});

// GET /tasks/:id
app.get<{ id: string }>("/tasks/:id", (req, res) => {
  const matchingSignature = getDbTaskById(parseInt(req.params.id));
  if (matchingSignature === "not found") {
    res.status(404).json(matchingSignature);
  } else {
    res.status(200).json(matchingSignature);
  }
});

// DELETE /tasks/:id
app.delete<{ id: string }>("/tasks/:id", (req, res) => {
  const matchingSignature = getDbTaskById(parseInt(req.params.id));
  if (matchingSignature === "not found") {
    res.status(404).json(matchingSignature);
  } else {
    deleteDbTaskById(parseInt(req.params.id));
    res.status(200).json(matchingSignature);
  }
});

app.patch<{}, {}, { type: OptionUnion }>("/options", (req, res) => {
  const optionType = req.body.type;
  options[optionType] = !options[optionType];
  res.status(200).json({ optionType: options[optionType] });
});

// PATCH /tasks/:id
app.patch<{ id: string }, {}, Partial<DbTask>>("/tasks/:id", (req, res) => {
  const matchingSignature = updateDbTaskById(parseInt(req.params.id), req.body);
  if (matchingSignature === "not found") {
    res.status(404).json(matchingSignature);
  } else {
    res.status(200).json(matchingSignature);
  }
});

app.listen(PORT_NUMBER, () => {
  console.log(`Server is listening on port ${PORT_NUMBER}!`);
});
