import express from 'express';
import cors from 'cors';
import taskRouter from './routes/tasks';
import eventRouter from './routes/events';
import noteRouter from './routes/notes';
import projectRouter from './routes/projects';
import userRouter from './routes/users';
import { syncEvents } from './controllers/events';

const app = express();
const port = 3005;

app.use(cors());
app.use(express.json());

app.use('/api/users/', userRouter);
app.use('/api/tasks', taskRouter);
app.use('/api/events', eventRouter);
app.use('/api/notes', noteRouter);
app.use('/api/projects', projectRouter);
app.use('/api/sync/events', syncEvents);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});