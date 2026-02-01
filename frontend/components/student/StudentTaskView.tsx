"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, PlayCircle, Search, 
  Calendar, RotateCcw, Loader2, ExternalLink, FileText, AlertCircle
} from 'lucide-react';

// --- INTERFACES FOR TYPE SAFETY ---
interface Task {
  _id: string;
  title: string;
  module: string;
  difficulty: string;
  type: 'video' | 'pdf' | 'link';
  status: 'Draft' | 'Active' | 'Completed';
  endDate: string;
  content: string;
}

interface StatsData {
  pending: number;
  active: number;
  completed: number;
}

const StudentTaskView = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statsData, setStatsData] = useState<StatsData>({ pending: 0, active: 0, completed: 0 });

  // Use Environment Variable for Production API
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE}/tasks/student/tasks`, { withCredentials: true }),
        axios.get(`${API_BASE}/tasks/stats`, { withCredentials: true })
      ]);
      setTasks(tasksRes.data || []);
      setStatsData(statsRes.data || { pending: 0, active: 0, completed: 0 });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdate = async (taskId: string, newValue: string) => {
    try {
      // Optimistic UI update
      setTasks((prev) => prev.map((t) => t._id === taskId ? { ...t, status: newValue as any } : t));
      
      await axios.patch(`${API_BASE}/tasks/${taskId}/update`, {
        status: newValue
      }, { withCredentials: true });
      
      const statsRes = await axios.get(`${API_BASE}/tasks/stats`, { withCredentials: true });
      setStatsData(statsRes.data);
    } catch (error) {
      alert("Failed to update status");
      fetchData(); // Rollback on error
    }
  };

  const openTaskContent = (content: string) => {
    if (!content) return alert("No resources available for this task.");
    // If content is a URL, open it. If it's a filename, point to backend uploads.
    const finalUrl = content.startsWith('http') 
      ? content 
      : `${API_BASE.replace('/api', '')}/uploads/${content}`;
    window.open(finalUrl, '_blank');
  };

  const filteredTasks = tasks.filter((t) => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.module.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dynamicStats = [
    { label: 'Need Help', count: statsData.pending, icon: <AlertCircle className="text-orange-500" />, bg: 'bg-orange-50' },
    { label: 'In Progress', count: statsData.active || 0, icon: <PlayCircle className="text-indigo-500" />, bg: 'bg-indigo-50' },
    { label: 'Completed', count: statsData.completed, icon: <CheckCircle2 className="text-emerald-500" />, bg: 'bg-emerald-50' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20">
      <header className="bg-white/60 backdrop-blur-md h-6 sticky top-0 z-50" />

      <main className="max-w-[1200px] mx-auto p-8 pt-4 space-y-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Task Roadmap</h1>
            <p className="text-slate-500 font-medium text-sm">Update your status and click icons to open materials.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search materials..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm w-full focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
              />
            </div>

            <button 
              onClick={fetchData} 
              disabled={loading}
              className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              title="Refresh Data"
            >
              <RotateCcw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dynamicStats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
              <div className={`p-4 rounded-2xl ${stat.bg}`}>{stat.icon}</div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black text-slate-900">{loading ? ".." : stat.count}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* TASKS TABLE */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
                    <th className="px-8 py-6">Resource Name</th>
                    <th className="px-8 py-6">Due Date</th>
                    <th className="px-8 py-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence>
                    {filteredTasks.map((task) => (
                      <motion.tr 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        key={task._id} 
                        className="group hover:bg-slate-50/80 transition-all"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => openTaskContent(task.content)}
                              className="bg-slate-100 p-3 rounded-2xl text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm"
                            >
                              {task.type === 'video' ? <PlayCircle size={20} /> : 
                               task.type === 'pdf' ? <FileText size={20} /> : 
                               <ExternalLink size={20} />}
                            </button>
                            <div>
                              <div className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => openTaskContent(task.content)}>
                                {task.title}
                              </div>
                              <div className="text-slate-400 text-[10px] uppercase font-bold tracking-tight mt-0.5">
                                 {task.module} • <span className={`${task.difficulty === 'Hard' ? 'text-red-400' : 'text-slate-400'}`}>{task.difficulty}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <Calendar size={14} className="text-slate-300" />
                            {new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </td>

                        <td className="px-8 py-6 text-right">
                          <select 
                            value={task.status}
                            onChange={(e) => handleUpdate(task._id, e.target.value)}
                            className={`text-[10px] font-black uppercase tracking-widest border-2 focus:ring-4 cursor-pointer p-2 px-4 rounded-xl transition-all ${
                              task.status === 'Completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600 focus:ring-emerald-500/10' : 
                              task.status === 'Active' ? 'bg-indigo-50 border-indigo-100 text-indigo-600 focus:ring-indigo-500/10' : 
                              'bg-orange-50 border-orange-100 text-orange-600 focus:ring-orange-500/10'
                            }`}
                          >
                            <option value="Draft">Need Help</option>
                            <option value="Active">In Progress</option>
                            <option value="Completed">Done</option>
                          </select>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentTaskView;