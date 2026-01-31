import { Request, Response } from 'express';
import Task from '../models/Task';

// 1. Get all tasks for the Admin table
export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

// 2. Create a new task (Handles both links and file uploads)
export const createTask = async (req: Request, res: Response) => {
  try {
    const taskData = { ...req.body };
    const file = req.file as any; 
    
    // If a file exists, Multer saved it to disk; use the filename as content
    if (file) {
      taskData.content = file.filename;
    } 
    // If no file, it uses 'content' sent from the frontend (the URL)

    const newTask = new Task(taskData);
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error: any) {
    res.status(400).json({ message: "Error creating task", error: error.message });
  }
};

// 3. Delete a task
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
};

// 4. Get stats for the dashboard cards
export const getTaskStats = async (req: Request, res: Response) => {
  try {
    const pendingCount = await Task.countDocuments({ status: 'Draft' });
    const activeCount = await Task.countDocuments({ status: 'Active' });
    const completedCount = await Task.countDocuments({ status: 'Completed' });

    res.status(200).json({
      pending: pendingCount,
      active: activeCount,
      completed: completedCount
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};