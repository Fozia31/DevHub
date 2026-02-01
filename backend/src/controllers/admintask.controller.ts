import { Request, Response } from 'express';
import Task from '../models/Task';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const taskData = { ...req.body };
    
    if (req.file) {
      taskData.content = req.file.filename;
    } else if (req.body.link) {
      taskData.content = req.body.link;
    }

    if (!taskData.student || taskData.student === "" || taskData.student === "undefined") {
      delete taskData.student;
    }

    const newTask = new Task(taskData);
    await newTask.save();
    
    res.status(201).json(newTask);
  } catch (error: any) {
    console.error("Create Task Error:", error);
    res.status(400).json({ message: "Error creating task", error: error.message });
  }
};

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


export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    const file = req.file as any;

    if (file) {
      updateData.content = file.filename;
    } else if (req.body.type === 'link') {
      updateData.content = req.body.link;
    } else {

      delete updateData.content;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(updatedTask);
  } catch (error: any) {
    console.error("Update Error:", error);
    res.status(400).json({ message: "Error updating task", error: error.message });
  }
};

