import { Request, Response } from 'express';
import Resource from '../models/Resource';

// 1. Fetch all resources
export const getResources = async (req: Request, res: Response) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch resources" });
  }
};

// 2. Add new resource (Admin only)
export const addResource = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const newResource = await Resource.create({ ...req.body, createdBy: userId });
    res.status(201).json(newResource);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to add resource", error: error.message });
  }
};

// 3. Update status (Student interaction)
export const updateResourceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await Resource.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: "Resource not found" });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};