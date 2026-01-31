"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, X, Loader2, FileText, Video, Link as LinkIcon, Calendar, Trash2, ExternalLink 
} from 'lucide-react';

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('All Tasks');
  const [contentType, setContentType] = useState('link'); 

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
      const response = await axios.get('http://localhost:5000/api/admin/tasks', { withCredentials: true });
      setTasks(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  // --- HELPER TO OPEN CONTENT ---
  const handleOpenContent = (task: any) => {
    // If it's a link, open directly. 
    // If it's a file, point to the backend uploads folder
    const url = task.type === 'link' 
      ? task.content 
      : `http://localhost:5000/uploads/tasks/${task.content}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAddTask = async (e: React.FormEvent) => {
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

      await axios.post('http://localhost:5000/api/admin/tasks/add', data, { 
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowModal(false);
      setFormData({ title: '', module: '', status: 'Active', startDate: '', endDate: '', link: '', file: null });
      fetchTasks();
    } catch (error) {
      alert("Error adding task.");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent the row click (opening link) when clicking delete
    if (!window.confirm("Delete this task?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/tasks/${id}`, { withCredentials: true });
      fetchTasks();
    } catch (error) {
      alert("Failed to delete task.");
    }
  };

  const filteredTasks = tasks.filter((task: any) => {
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
              <p className="text-slate-500 font-medium text-sm">Click any task to view its content.</p>
            </div>
            <motion.button 
              whileHover={{ y: -2 }}
              onClick={() => setShowModal(true)} 
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg"
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
                    className={`px-5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[300px]">
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>
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
                    {filteredTasks.map((task: any) => (
                      <tr 
                        key={task._id} 
                        onClick={() => handleOpenContent(task)}
                        className="group hover:bg-indigo-50/50 cursor-pointer transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 flex items-center gap-2">
                            {task.title} <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-slate-400 text-xs">{task.module}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <Calendar size={14} className="text-indigo-400" />
                            {new Date(task.startDate).toLocaleDateString()} — {new Date(task.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded flex items-center gap-1 w-fit ${
                             task.type === 'video' ? 'bg-blue-100 text-blue-700' : 
                             task.type === 'pdf' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                           }`}>
                             {task.type === 'video' ? <Video size={10}/> : task.type === 'pdf' ? <FileText size={10}/> : <LinkIcon size={10}/>}
                             {task.type}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-3 items-center">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${task.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                {task.status}
                            </span>
                            <button 
                              onClick={(e) => handleDelete(e, task._id)} 
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16}/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MODAL (Same as previous version) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-black text-slate-900">Add New Task</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} className="text-slate-400" /></button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
                  <input type="text" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Project Phase 1" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                    <input type="date" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                    <input type="date" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Content Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['link', 'video', 'pdf'].map((type) => (
                      <button key={type} type="button" onClick={() => setContentType(type)} className={`capitalize p-3 rounded-xl border text-xs font-bold transition-all ${contentType === type ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{contentType === 'link' ? 'URL' : `File Upload`}</label>
                  {contentType === 'link' ? (
                    <input type="url" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-bold" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} placeholder="https://..." />
                  ) : (
                    <div className="relative">
                      <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setFormData({...formData, file: e.target.files ? e.target.files[0] : null})} />
                      <div className="w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center gap-2">
                        <Plus className="text-slate-300" />
                        <span className="text-xs font-bold text-slate-400">{formData.file ? formData.file.name : `Select ${contentType.toUpperCase()}`}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Module" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" value={formData.module} onChange={(e) => setFormData({...formData, module: e.target.value})} />
                  <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg active:scale-95 transition-all">Publish Task</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskManagement;