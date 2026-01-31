import { Request, Response } from 'express';
import Task from '../models/Task';

// GET /api/tasks/stats
export const getTaskStats = async (req: Request, res: Response) => {
  try {
    const pending = await Task.countDocuments({ status: 'Draft' });
    const active = await Task.countDocuments({ status: 'Active' });
    const completed = await Task.countDocuments({ status: 'Completed' });

    res.status(200).json({ pending, active, completed });
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

// GET /api/tasks/student/tasks
export const getStudentTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find().sort({ endDate: 1 });
    res.status(200).json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

// Add this to your existing controller
export const updateTaskStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};