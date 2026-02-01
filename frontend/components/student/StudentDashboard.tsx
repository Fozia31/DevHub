"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  CheckCircle, Clock, AlertCircle, 
  PlayCircle, Loader2, FileText 
} from 'lucide-react';

// --- INTERFACES FOR TYPE SAFETY ---
interface Task {
  _id: string;
  title: string;
  module: string;
  endDate: string;
  status: 'Completed' | 'Active' | 'Pending';
}

interface Resource {
  _id: string;
  title: string;
  url: string;
  type: 'video' | 'article';
  category: string;
  updatedAt: string;
}

interface UserData {
  name: string;
  attendance?: number;
}

const StudentDashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ completed: 0, active: 0, stuck: 0 });

  // Use Environment Variable for the API Base
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetching all data in parallel for speed
        const [profileRes, tasksRes, statsRes, resourceRes] = await Promise.all([
          axios.get(`${API_BASE}/auth/profile`, { withCredentials: true }),
          axios.get(`${API_BASE}/tasks/student/tasks?limit=5`, { withCredentials: true }),
          axios.get(`${API_BASE}/tasks/stats`, { withCredentials: true }),
          axios.get(`${API_BASE}/resources`, { withCredentials: true }) 
        ]);
        
        setUser(profileRes.data);
        setTasks(tasksRes.data || []);
        
        // Sort and slice resources safely
        if (resourceRes.data && Array.isArray(resourceRes.data)) {
            const sortedResources = resourceRes.data.sort((a: Resource, b: Resource) => 
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            ).slice(0, 3);
            setResources(sortedResources);
        }
        
        setStats({
          completed: statsRes.data.completed || 0,
          active: statsRes.data.active || 0,
          stuck: statsRes.data.pending || 0 
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [API_BASE]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-[#F8FAFC]">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-indigo-600 mx-auto" size={40} />
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10 animate-in fade-in duration-700">
      {/* --- WELCOME SECTION --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Hi, {user?.name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            {stats.active > 0 
              ? `You're currently working on ${stats.active} modules.` 
              : "Great job! You've cleared your current task list."}
          </p>
        </div>
        <div className="hidden md:block text-right bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Attendance</p>
            <p className="text-2xl font-black text-indigo-600">{user?.attendance || 0}%</p>
        </div>
      </div>

      {/* --- STAT CARDS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Completed" count={stats.completed} icon={<CheckCircle size={24}/>} color="emerald" />
        <StatCard label="In Progress" count={stats.active} icon={<Clock size={24}/>} color="indigo" />
        <StatCard label="Need Help" count={stats.stuck} icon={<AlertCircle size={24}/>} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- ONGOING TASKS --- */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <h3 className="font-black text-xl text-slate-900 tracking-tight">Recent Activity</h3>
            <button className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:text-indigo-700 transition-colors">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <th className="px-8 py-4">Task Name</th>
                  <th className="px-8 py-4">Deadline</th>
                  <th className="px-8 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tasks.length > 0 ? tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{task.title}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{task.module}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-500">
                      {new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                        task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                        task.status === 'Active' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                   <tr><td colSpan={3} className="p-10 text-center text-slate-400 text-sm">No tasks assigned yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- RESOURCES SIDEBAR --- */}
        <div className="space-y-6">
          <h3 className="font-black text-xl text-slate-900 tracking-tight px-2">New Resources</h3>
          <div className="space-y-4">
            {resources.map((res) => (
              <motion.div 
                whileHover={{ x: 5 }}
                key={res._id} 
                className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:border-indigo-100 transition-all"
                onClick={() => window.open(res.url, '_blank')}
              >
                <div className={`p-3 rounded-2xl ${res.type === 'video' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                  {res.type === 'video' ? <PlayCircle size={20}/> : <FileText size={20}/>}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{res.title}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{res.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-black text-lg leading-tight">Weekly Mentor<br/>Office Hours</h4>
              <p className="text-indigo-100 text-xs mt-2 opacity-80">Join now for live Q&A</p>
              <button className="mt-6 bg-white text-indigo-600 px-6 py-3 rounded-2xl text-xs font-black w-full shadow-lg hover:bg-indigo-50 transition-colors">
                Enter Room
              </button>
            </div>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- REUSABLE COMPONENTS ---

interface StatCardProps {
    label: string;
    count: number;
    icon: React.ReactNode;
    color: 'emerald' | 'indigo' | 'orange';
}

const StatCard = ({ label, count, icon, color }: StatCardProps) => {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-500",
    indigo: "bg-indigo-50 text-indigo-500",
    orange: "bg-orange-50 text-orange-500"
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <h2 className="text-4xl font-black text-slate-900 mt-2">{count}</h2>
        </div>
        <div className={`p-4 rounded-2xl ${colors[color]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default StudentDashboard;