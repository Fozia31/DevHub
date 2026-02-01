// backend/src/controllers/admin.controller.ts
import { Request, Response } from 'express';
import User from '../models/User';
import Task from '../models/Task';
import Resource from '../models/Resource';


const formatTimeAgo = (date: any) => {
  if (!date) return 'Just now';
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return past.toLocaleDateString();
};

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const [userCount, pendingTasksCount, resourceCount, recentTasks] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Task.countDocuments({ status: 'Draft' }),
      Resource.countDocuments(),
      Task.find()
        .sort({ updatedAt: -1 })
        .limit(5)
        .populate('student', 'name') 
        .lean()
    ]);

    
    const recentActivity = (recentTasks || []).map((task: any) => {
      const statusMap: Record<string, string> = {
        'Draft': 'Submitted',
        'Active': 'Reviewing',
        'Completed': 'Completed'
      };

      return {
        studentName: task.student?.name || 'Unknown Student', 
        taskName: task.title || 'Untitled Task',
        status: statusMap[task.status] || 'Active',
        lastUpdated: formatTimeAgo(task.updatedAt),
      };
    });

    res.status(200).json({
      userCount,
      pendingTasksCount,
      resourceCount,
      recentActivity
    });
  } catch (error: any) {
    console.error("Admin Stats Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};