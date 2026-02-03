"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Clock, HelpCircle, 
  Search, ExternalLink, Loader2 
} from 'lucide-react';

interface Resource {
  _id: string;
  title: string;
  url: string;
  type: 'video' | 'pdf' | 'link';
  status?: string;
}

const StudentResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('All Types');
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/resources`, { withCredentials: true });
      setResources(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const getResourceCover = (res: Resource) => {
    if (res.type === 'video') {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = res.url.match(regExp);
      const videoId = (match && match[7].length === 11) ? match[7] : null;
      
      return videoId 
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` 
        : "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600";
    }
    if (res.type === 'pdf') return "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600";
    return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600";
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const previousResources = [...resources];
    setResources((prev) => 
      prev.map((r) => r._id === id ? { ...r, status: newStatus } : r)
    );

    try {
      await axios.patch(`${API_BASE}/resources/status`, 
        { status: newStatus },
        { withCredentials: true }
      );
    } catch (error) {
      setResources(previousResources);
      alert("Status update failed.");
    }
  };

  const filteredResources = resources.filter((res) => {
    const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All Types' || 
                       (activeTab === 'Videos' && res.type === 'video') || 
                       (activeTab === 'PDFs' && res.type === 'pdf') || 
                       (activeTab === 'Links' && res.type === 'link');
    return matchesSearch && matchesTab;
  });

  const totalItems = resources.length;
  const completedItems = resources.filter((r) => r.status === 'Done').length;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FDFDFF]">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFF] p-6 lg:p-12">
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900">Learning Resources</h1>
          <p className="text-slate-500 text-lg">Access your curriculum and track your progress.</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 w-full md:w-80">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-black uppercase text-slate-400">Total Progress</span>
            <span className="text-indigo-600 font-bold">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${completionPercentage}%` }} className="bg-indigo-500 h-full" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between gap-6">
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
          {['All Types', 'Videos', 'PDFs', 'Links'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-400'}`}>{tab}</button>
          ))}
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search resources..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode='popLayout'>
          {filteredResources.map((res) => (
            <motion.div layout key={res._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col group">
              <div className="relative h-52 overflow-hidden bg-slate-200">
                <img 
                  src={getResourceCover(res)} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  alt={res.title}
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600" }} 
                />
                <div className="absolute top-4 left-4">
                  <span className="text-[10px] font-black px-3 py-1.5 rounded-lg uppercase bg-white/90 text-indigo-600">{res.type}</span>
                </div>
                <button onClick={() => window.open(res.url, '_blank')} className="absolute bottom-4 right-4 p-3 bg-indigo-600 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform">
                  <ExternalLink size={18} />
                </button>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-800 mb-6 line-clamp-2">{res.title}</h3>
                <div className="mt-auto space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <p className="text-[10px] font-black uppercase text-slate-400">Status</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${res.status === 'Done' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{res.status || 'Not Started'}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <StatusBtn icon={<CheckCircle2 size={16}/>} label="Done" active={res.status === 'Done'} onClick={() => handleStatusUpdate(res._id, 'Done')} color="bg-emerald-500" />
                    <StatusBtn icon={<Clock size={16}/>} label="Working" active={res.status === 'In-Progress'} onClick={() => handleStatusUpdate(res._id, 'In-Progress')} color="bg-amber-500" />
                    <StatusBtn icon={<HelpCircle size={16}/>} label="Help" active={res.status === 'Need-Help'} onClick={() => handleStatusUpdate(res._id, 'Need-Help')} color="bg-red-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface StatusBtnProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  color: string;
}

const StatusBtn = ({ icon, label, active, onClick, color }: StatusBtnProps) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${active ? `${color} border-transparent text-white shadow-lg` : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
    {icon}
    <span className="text-[9px] font-bold mt-1 uppercase">{label}</span>
  </button>
);

export default StudentResources;