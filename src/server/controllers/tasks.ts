import { Request, Response } from 'express';
import { getData, setData } from '../services/redis';
import { Task } from '../types';

export const getTasks = async (_req: Request, res: Response) => {
  try {
    const tasks = await getData('tasks') || [];
    return res.json({ data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

export const getTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tasks = await getData('tasks') || [];
    const task = tasks.find((t: Task) => t.id === id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    return res.json({ data: task });
  } catch (error) {
    console.error('Error fetching task:', error);
    return res.status(500).json({ error: 'Failed to fetch task' });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const task: Task = req.body;
    
    if (!task.title?.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const newTask: Task = {
      ...task,
      id: task.id || crypto.randomUUID(),
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: task.status || 'todo',
      priority: task.priority || 'medium'
    };

    const tasks = await getData('tasks') || [];
    tasks.push(newTask);
    await setData('tasks', tasks);
    
    return res.status(201).json({ data: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedTask: Task = req.body;
    
    if (!updatedTask.title?.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const tasks = await getData('tasks') || [];
    const index = tasks.findIndex((t: Task) => t.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const originalTask = tasks[index];
    const taskToUpdate = {
      ...updatedTask,
      id,
      createdAt: originalTask.createdAt,
      updatedAt: new Date().toISOString()
    };
    
    tasks[index] = taskToUpdate;
    await setData('tasks', tasks);
    
    return res.json({ data: taskToUpdate });
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tasks = await getData('tasks') || [];
    const filteredTasks = tasks.filter((t: Task) => t.id !== id);
    
    if (tasks.length === filteredTasks.length) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    await setData('tasks', filteredTasks);
    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
};