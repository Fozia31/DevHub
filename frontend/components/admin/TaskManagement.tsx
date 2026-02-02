"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, X, Loader2, FileText, Video, Link as LinkIcon, 
  Calendar, Trash2, ExternalLink, Edit 
} from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Task {
  _id: string;
  title: string;
  module: string;
  status: string;
  startDate: string;
  endDate: string;
  type: 'link' | 'video' | 'pdf';
  content: string;
}

const TaskManagement = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All Tasks');
  const [contentType, setContentType] = useState('link'); 

  // PRODUCTION API CONFIG
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const BACKEND_ROOT = API_BASE.replace('/api', '');

  const [formData, setFormData] = useState({
    title: '',
    module: '',
    status: 'Active',
    startDate: '',
    endDate: '',
    link: '',
    file: null as File | null,
  });

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/admin/tasks`, { withCredentials: true });
      setTasks(response.data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchTasks(); 
  }, []);

  const handleOpenContent = (task: Task) => {
    let url = task.type === 'link' 
      ? task.content 
      : `${BACKEND_ROOT}/uploads/${task.content}`;
    
    if (task.type === 'link' && !url.startsWith('http')) {
        url = 'https://' + url;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEditClick = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setEditingId(task._id);
    setContentType(task.type);
    setFormData({
      title: task.title,
      module: task.module,
      status: task.status,
      startDate: task.startDate ? task.startDate.split('T')[0] : '',
      endDate: task.endDate ? task.endDate.split('T')[0] : '',
      link: task.type === 'link' ? task.content : '',
      file: null,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: '', module: '', status: 'Active', startDate: '', endDate: '', link: '', file: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('module', formData.module);
      data.append('status', formData.status);
      data.append('startDate', formData.startDate);
      data.append('endDate', formData.endDate);
      data.append('type', contentType);
      
      if (contentType === 'link') {
        data.append('content', formData.link);
      } else if (formData.file) {
        data.append('file', formData.file);
      }

      const config = { 
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      };

      if (editingId) {
        await axios.put(`${API_BASE}/admin/tasks/${editingId}`, data, config);
      } else {
        await axios.post(`${API_BASE}/admin/tasks/add`, data, config);
      }

      handleCloseModal();
      fetchTasks();
    } catch (error: any) {
      alert(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/tasks/${id}`, { withCredentials: true });
      fetchTasks();
    } catch (error) {
      alert("Failed to delete task.");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'All Tasks') return true;
    return task.status === activeTab;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-xl font-bold text-gray-800">Task Management</h1>
          <div className="w-10 h-10 bg-indigo-100 rounded-full border-2 border-white flex items-center justify-center overflow-hidden">
             <img src={`https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff`} alt="Admin" />
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Curriculum Tasks</h2>
              <p className="text-slate-500 font-medium text-sm">Design and manage learning modules.</p>
            </div>
            <motion.button 
              whileHover={{ y: -2 }}
              onClick={() => setShowModal(true)} 
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200"
            >
              <Plus size={18} /> Add Task
            </motion.button>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                {['All Tasks', 'Active', 'Draft'].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)} 
                    className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[300px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Updating Task List...</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-8 py-4">Task & Module</th>
                      <th className="px-8 py-4">Timeline</th>
                      <th className="px-8 py-4">Type</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTasks.length > 0 ? filteredTasks.map((task) => (
                      <tr 
                        key={task._id} 
                        onClick={() => handleOpenContent(task)}
                        className="group hover:bg-indigo-50/50 cursor-pointer transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 flex items-center gap-2">
                            {task.title} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-slate-400 text-xs font-medium">{task.module}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <Calendar size={14} className="text-indigo-400" />
                            {new Date(task.startDate).toLocaleDateString()} — {new Date(task.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md flex items-center gap-1.5 w-fit ${
                               task.type === 'video' ? 'bg-blue-100 text-blue-700' : 
                               task.type === 'pdf' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                               {task.type === 'video' ? <Video size={10}/> : task.type === 'pdf' ? <FileText size={10}/> : <LinkIcon size={10}/>}
                               {task.type}
                            </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            <button onClick={(e) => handleEditClick(e, task)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                              <Edit size={16}/>
                            </button>
                            <button onClick={(e) => handleDelete(e, task._id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                        <tr>
                            <td colSpan={4} className="py-20 text-center text-slate-400 font-bold text-sm">No tasks found in this category.</td>
                        </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-black text-slate-900">{editingId ? 'Edit Task' : 'Add New Task'}</h3>
                <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
                  <input type="text" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold focus:ring-2 focus:ring-indigo-500/20" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Project Phase 1" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                    <input type="date" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                    <input type="date" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Content Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['link', 'video', 'pdf'].map((type) => (
                      <button key={type} type="button" onClick={() => setContentType(type)} className={`capitalize p-3 rounded-xl border text-xs font-bold transition-all ${contentType === type ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-100 hover:border-indigo-200'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{contentType === 'link' ? 'URL' : `File Upload`}</label>
                  {contentType === 'link' ? (
                    <input type="url" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold focus:ring-2 focus:ring-indigo-500/20" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} placeholder="https://..." />
                  ) : (
                    <div className="relative">
                      <input type="file" required={!editingId} className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setFormData({...formData, file: e.target.files ? e.target.files[0] : null})} />
                      <div className="w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-2 group-hover:border-indigo-300 transition-colors">
                        <Plus className="text-slate-300" />
                        <span className="text-xs font-bold text-slate-400">{formData.file ? formData.file.name : editingId ? 'Leave empty to keep existing' : `Select ${contentType.toUpperCase()}`}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Module</label>
                    <input type="text" placeholder="e.g. Frontend" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.module} onChange={(e) => setFormData({...formData, module: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                      <option value="Active">Active</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg active:scale-95 transition-all shadow-xl shadow-indigo-200 mt-4 hover:bg-indigo-700">
                  {editingId ? 'Update Task' : 'Publish Task'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskManagement;