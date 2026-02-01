import { Request, Response } from 'express';
import Resource from '../models/Resource';

interface AuthRequest extends Request {
  user?: { id: string; role: string; };
}

export const getAllResources = async (req: Request, res: Response) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error: any) {
    res.status(500).json({ error: "Could not fetch resources" });
  }
};

export const addResource = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type, url, category } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Please log in again" });
    }

    const resource = new Resource({
      title,
      description,
      type,
      url,
      category: category || "General",
      createdBy: userId,
      status: 'Not Started'
    });

    const savedResource = await resource.save();
    res.status(201).json(savedResource);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to add resource" });
  }
};

export const updateResource = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, type, url, category } = req.body;

    const updatedResource = await Resource.findByIdAndUpdate(
      id,
      { title, description, type, url, category },
      { new: true, runValidators: true } 
    );

    if (!updatedResource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.json(updatedResource);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to update resource" });
  }
};

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