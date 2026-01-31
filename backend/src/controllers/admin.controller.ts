import { Request, Response } from 'express';
import User from '../models/User';
import Task from '../models/Task';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    // 1. Get total students count (Card 1)
    const userCount = await User.countDocuments({ role: 'student' });

    // 2. Get Pending/Draft tasks count (Card 2)
    const pendingTasksCount = await Task.countDocuments({ status: 'Draft' });

    // 3. Get Resources Assigned (Card 3)
    // We count unique titles or specific resource-type tasks
    const resourceCount = await Task.distinct('title').then(titles => titles.length);

    // 4. Get recent student activity (Table)
    const recentTasksRaw = await Task.find()
      .populate('createdBy', 'name') // Assuming createdBy links to the user
      .sort({ updatedAt: -1 }) // Sort by latest update
      .limit(5);

    // 5. Format activity for the UI
    const recentActivity = recentTasksRaw.map((task: any) => {
      // Helper for "Time Ago"
      const timeAgo = formatTimeAgo(task.updatedAt);
      
      return {
        studentName: task.createdBy?.name || 'Unknown User',
        taskName: task.title,
        // Mapping backend status to UI badges
        status: task.status === 'Draft' ? 'Submitted' : 
                task.status === 'Active' ? 'Reviewing' : 'Completed',
        lastUpdated: timeAgo,
      };
    });

    res.json({
      userCount,
      pendingTasksCount,
      resourceCount,
      recentActivity
    });
  } catch (error: any) {
    res.status(500).json({ 
      message: "Error fetching dashboard stats", 
      error: error.message 
    });
  }
};

// Helper function to format date to "2 mins ago" etc.
const formatTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return new Date(date).toLocaleDateString();
};