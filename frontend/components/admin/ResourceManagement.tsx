"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, ExternalLink, Trash2, Edit, FileText, Video, Link as LinkIcon, Globe } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Resource {
  _id: string;
  title: string;
  description?: string;
  type: 'video' | 'pdf' | 'link';
  url: string;
  category?: string;
}

const ResourceManagement = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All Resources');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    title: '', description: '', type: 'video', url: '', category: 'General'
  });

  // PRODUCTION API CONFIG
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const BACKEND_ROOT = API_BASE.replace('/api', '');

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/resources`, { withCredentials: true });
      setResources(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch error:", error);
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const handleOpenLink = (url: string) => {
    if (!url) return; 
    
    let finalUrl = url.trim();
    
    // If it's a relative path from the server (e.g. /uploads/...)
    if (finalUrl.startsWith('/uploads')) {
      finalUrl = BACKEND_ROOT + finalUrl;
    } 
    else {
      // Ensure absolute URL for external links
      if (!finalUrl.includes('://')) {
        finalUrl = "https://" + finalUrl;
      }
    }
    
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = { withCredentials: true };
      if (editingId) {
        await axios.put(`${API_BASE}/api/admin/resources/${editingId}`, formData, config);
      } else {
        await axios.post(`${API_BASE}/api/admin/resources/add`, formData, config);
      }
      closeModal();
      fetchResources();
    } catch (error: any) {
      alert(error.response?.data?.error || "Operation failed. Check console.");
    }
  };

  const handleEditClick = (res: Resource) => {
    setEditingId(res._id);
    setFormData({
      title: res.title,
      description: res.description || '',
      type: res.type,
      url: res.url,
      category: res.category || 'General'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ title: '', description: '', type: 'video', url: '', category: 'General' });
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Delete this resource?")) return;
    try {
      await axios.delete(`${API_BASE}/api/resources/${id}`, { withCredentials: true });
      fetchResources();
    } catch (error) {
      console.error("Error deleting resource");
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video': return <Video size={16} className="text-red-500" />;
      case 'pdf': return <FileText size={16} className="text-orange-500" />;
      default: return <LinkIcon size={16} className="text-blue-500" />;
    }
  };

  const getResourceCover = (res: Resource) => {
    if (res.type === 'video' && res.url.includes('youtube.com') || res.url.includes('youtu.be')) {
      const videoId = res.url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=))([\w\-]{10,12})\b/)?.[1];
      return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=600";
    }
    if (res.type === 'pdf') return "https://images.unsplash.com/photo-1568667256549-094345857637?w=600";
    return "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600";
  };

  const filteredResources = resources.filter((res) => {
    const matchesTab = activeTab === 'All Resources' || 
                       res.type.toLowerCase() === activeTab.toLowerCase().replace('s', '');
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <h1 className="text-xl font-black text-slate-800 tracking-tight">Admin <span className="text-indigo-600">Library</span></h1>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" placeholder="Search resources..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm w-80 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
          />
        </div>
      </header>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60">
          <div>
            <h2 className="text-3xl font-black text-slate-900">Resource Assets</h2>
            <p className="text-slate-500 font-medium">Manage Links, PDFs, and Videos</p>
          </div>
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all">
            <Plus size={20} /> Add New Content
          </button>
        </div>

        <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
          {['All Resources', 'Videos', 'PDFs', 'Links'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{tab}</button>
          ))}
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Library...</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
                {filteredResources.map((res) => (
                <motion.div layout key={res._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col">
                    <div className="h-44 relative overflow-hidden bg-slate-100">
                    <img src={getResourceCover(res)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
                        {getIcon(res.type)}
                        <span className="text-[10px] font-bold uppercase text-slate-700">{res.type}</span>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(res)} className="p-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white shadow-lg"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(res._id)} className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-500 hover:text-white shadow-lg"><Trash2 size={16} /></button>
                    </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 text-lg line-clamp-1">{res.title}</h3>
                    <p className="text-slate-500 text-xs mt-2 mb-4 line-clamp-2 italic">"{res.description}"</p>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{res.category || 'General'}</span>
                        <button 
                        onClick={() => handleOpenLink(res.url)} 
                        className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all flex items-center gap-2"
                        >
                        View <ExternalLink size={12}/>
                        </button>
                    </div>
                    </div>
                </motion.div>
                ))}
            </AnimatePresence>
            </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl relative z-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-slate-900">{editingId ? 'Edit' : 'New'} Resource</h2>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" required placeholder="Title" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                <textarea required placeholder="Description" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-24 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                
                <div className="grid grid-cols-2 gap-4">
                  <select className="p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value as any})}>
                    <option value="video">Video</option>
                    <option value="pdf">PDF</option>
                    <option value="link">Link</option>
                  </select>
                  <input type="text" placeholder="Category" className="p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} />
                </div>

                <div className="relative group">
                  <input 
                    type="text" 
                    required 
                    placeholder="URL (e.g. youtube.com/watch?v=...)" 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm pr-24" 
                    value={formData.url} 
                    onChange={(e) => setFormData({...formData, url: e.target.value})} 
                  />
                  <button 
                    type="button"
                    onClick={() => handleOpenLink(formData.url)}
                    className="absolute right-2 top-2 bottom-2 bg-indigo-100 text-indigo-600 px-3 rounded-xl text-[10px] font-bold hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Globe size={12}/> Test Link
                  </button>
                </div>

                <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-200 mt-4">
                  {editingId ? 'Update Resource' : 'Save Resource'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResourceManagement;