import { Request, Response } from 'express';
import Resource from '../models/Resource';

interface AuthRequest extends Request {
  user?: { id: string; role: string; };
}

// 1. Fetch all resources for management view
export const getAllResources = async (req: Request, res: Response) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error: any) {
    res.status(500).json({ error: "Could not fetch resources" });
  }
};

// 2. Add a new resource
export const addResource = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type, url, category } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: No user session found" });
    }

    const resource = new Resource({
      title,
      description,
      type,
      url,
      category,
      createdBy: req.user.id,
      status: 'Not Started' // Default status for new resources
    });

    const savedResource = await resource.save();
    res.status(201).json(savedResource);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to add resource" });
  }
};

// 3. Delete a resource
export const deleteResource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Resource.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: "Resource not found" });
    }
    
    res.json({ message: "Resource deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Delete operation failed" });
  }
};