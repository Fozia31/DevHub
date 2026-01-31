"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, Play, FileText, 
  Link as LinkIcon, X, Clock, ExternalLink, Trash2, Loader2 
} from 'lucide-react';

const ResourceManagement = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('All Resources');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '', description: '', type: 'video', url: '', category: 'General'
  });

  const fetchResources = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/resources', { withCredentials: true });
      setResources(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  // HELPER: YouTube Thumbnail Extractor
  const getResourceCover = (res: any) => {
    if (res.type === 'video') {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = res.url.match(regExp);
      const videoId = (match && match[7].length === 11) ? match[7] : null;
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600";
    }
    if (res.type === 'pdf') return "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600";
    return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/resources/add', formData, { withCredentials: true });
      setShowModal(false);
      setFormData({ title: '', description: '', type: 'video', url: '', category: 'General' });
      fetchResources();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add resource.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this resource?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/resources/${id}`, { withCredentials: true });
      fetchResources();
    } catch (error) {
      alert("Error deleting resource");
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesTab = activeTab === 'All Resources' || res.type.toLowerCase() === activeTab.toLowerCase().replace('s', '');
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <h1 className="text-xl font-black text-slate-800 tracking-tight">Admin <span className="text-indigo-600">Library</span></h1>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" placeholder="Search assets..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
          />
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Content Assets</h2>
            <p className="text-slate-500 font-medium">Manage the curriculum resources for your students.</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-200 transition-all"
          >
            <Plus size={20} /> Add New Content
          </motion.button>
        </div>

        <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
          {['All Resources', 'Videos', 'PDFs', 'Links'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>{tab}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredResources.map((res: any) => (
              <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={res._id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col">
                <div className="h-48 relative overflow-hidden bg-slate-100">
                  <img 
                    src={getResourceCover(res)} 
                    alt={res.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600" }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-black px-3 py-1.5 rounded-lg uppercase bg-white text-indigo-600 shadow-sm">{res.type}</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1"><Clock size={12}/> {new Date(res.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg line-clamp-1 group-hover:text-indigo-600 transition-colors">{res.title}</h3>
                  <p className="text-slate-500 text-xs line-clamp-2 mt-2 italic">"{res.description}"</p>
                  
                  <div className="flex gap-2 mt-6">
                    <button onClick={() => window.open(res.url, '_blank')} className="flex-1 bg-slate-50 hover:bg-indigo-600 hover:text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">View Asset <ExternalLink size={14}/></button>
                    <button onClick={() => handleDelete(res._id)} className="p-3 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <motion.div onClick={() => setShowModal(true)} className="border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-all min-h-[350px]">
            <div className="w-14 h-14 bg-white shadow-md rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all"><Plus size={28} /></div>
            <span className="mt-4 text-xs font-black text-slate-400 uppercase tracking-widest">New Resource</span>
          </motion.div>
        </div>
      </div>

      {/* MODAL remains largely the same but with rounded-[2.5rem] and p-10 for premium feel */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl relative z-10">
               <div className="flex justify-between items-center mb-8">
                 <h2 className="text-3xl font-black text-slate-900">Publish Content</h2>
                 <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
               </div>
               <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Resource Title</label>
                   <input type="text" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Introduction to React Hooks" />
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Description</label>
                   <textarea required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-indigo-500 outline-none h-24 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Briefly describe this resource..." />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Type</label>
                     <select className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                       <option value="video">Video</option>
                       <option value="pdf">PDF</option>
                       <option value="link">Link</option>
                     </select>
                   </div>
                   <div className="space-y-1">
                     <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Category</label>
                     <input type="text" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="Frontend" />
                   </div>
                 </div>
                 <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-2">URL (Video or File Link)</label>
                   <input type="url" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} placeholder="https://youtube.com/..." />
                 </div>
                 <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">Deploy Resource</button>
               </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResourceManagement;