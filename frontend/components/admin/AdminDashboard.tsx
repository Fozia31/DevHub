"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  ClipboardList, 
  BookOpen, 
  MoreHorizontal, 
  Filter, 
  Search,
  Loader2,
  AlertCircle 
} from 'lucide-react';

const AdminDashboard = () => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({ students: 0, pending: 0, resources: 0 });
  const [adminInfo, setAdminInfo] = useState({ name: 'Admin', avatar: '' }); // Added state for Admin Profile
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Fetch Profile Data & Stats in parallel
        const [statsRes, profileRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats', { withCredentials: true }),
          axios.get('http://localhost:5000/api/auth/profile', { withCredentials: true }) // Adjust this endpoint to your profile route
        ]);
        
        // Map Stats
        setStats({
          students: statsRes.data?.userCount || 0,
          pending: statsRes.data?.pendingTasksCount || 0,
          resources: statsRes.data?.resourceCount || 0
        });
        
        setActivities(statsRes.data?.recentActivity || []);

        // 2. Set Admin Info from backend
        const name = profileRes.data?.name || 'Admin User';
        setAdminInfo({
          name: name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`
        });

      } catch (err: any) {
        console.error("Admin fetch error:", err);
        setError("Could not connect to the server. Please ensure the backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-slate-500 font-bold animate-pulse">Fetching Dashboard Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <AlertCircle size={20} />
          <span className="font-bold text-sm">{error}</span>
        </div>
      )}


      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Dashboard Overview</h2>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search students, tasks..." 
              className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-full md:w-64 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
            />
          </div>
          
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">

              <p className="text-xs font-black text-slate-900">{adminInfo.name}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Admin</p>
            </div>
            <img 
              src={adminInfo.avatar} 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm" 
              alt="Admin" 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Students', value: stats.students, icon: <Users size={24} />, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Tasks Pending', value: stats.pending, sub: 'Requires Review', icon: <ClipboardList size={24} />, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Resources Assigned', value: stats.resources, sub: 'Active Modules', icon: <BookOpen size={24} />, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-50 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{item.value.toLocaleString()}</h3>
              <p className={`text-[10px] font-bold mt-2 ${item.color} flex items-center gap-1`}>
                <span className="opacity-70">{item.sub}</span>
              </p>
            </div>
            <div className={`${item.bg} ${item.color} p-4 rounded-2xl`}>
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-900 text-lg">Recent Student Activity</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Real-time task submission updates across all Developers.</p>
          </div>
          <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
            <Filter size={16} /> Filter View
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/30">
                <th className="px-8 py-4">Student Name</th>
                <th className="px-8 py-4">Task Name</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Last Updated</th>
                <th className="px-8 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activities.length > 0 ? activities.map((item: any, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 flex items-center gap-3">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.studentName)}&background=random`} 
                      className="w-8 h-8 rounded-full border border-slate-100" 
                      alt="Avatar"
                    />
                    <span className={`text-sm font-bold transition-colors ${
                      item.studentName === 'Unknown Student' ? 'text-slate-400 italic' : 'text-slate-700 group-hover:text-indigo-600'
                    }`}>
                      {item.studentName}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-500">{item.taskName}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      item.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                      item.status === 'Reviewing' ? 'bg-orange-50 text-orange-600' : 
                      item.status === 'Submitted' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-400 font-medium">{item.lastUpdated}</td>
                  <td className="px-8 py-5 text-center">
                    <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                      <MoreHorizontal size={20} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList className="text-slate-200" size={48} />
                      <p className="text-slate-400 font-bold">No recent activity found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;