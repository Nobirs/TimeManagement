import express from "express";
import cors from "cors";
import authRouter from "./routes/auth";
import taskRouter from "./routes/tasks";
import eventRouter from "./routes/events";
import noteRouter from "./routes/notes";
import projectRouter from "./routes/projects";
import userRouter from "./routes/users";
import timeTrackingRouter from "./routes/timetracking";
import goalRouter from "./routes/goals";
import habitRouter from "./routes/habits";

import { syncEvents } from "./controllers/events";
import { syncNotes } from "./controllers/notes";

import { logger } from "./utils/logger";

const app = express();
const port = 3005;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/events", eventRouter);
app.use("/api/notes", noteRouter);
app.use("/api/projects", projectRouter);
app.use("/api/timetracking", timeTrackingRouter);
app.use("/api/goals", goalRouter);
app.use("/api/habits", habitRouter);

app.use("/api/sync/events", syncEvents);
app.use("/api/sync/notes", syncNotes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
