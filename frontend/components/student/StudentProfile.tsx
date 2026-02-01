"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Github, ExternalLink, Edit3, Loader2, X, Linkedin, Send, Terminal, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- INTERFACES FOR TYPE SAFETY ---
interface CodingHandles {
  github?: string;
  leetcode?: string;
  linkedin?: string;
  telegram?: string;
  codeforces?: string;
}

interface UserProfile {
  name: string;
  email: string;
  title?: string;
  codingHandles?: CodingHandles;
}

const StudentProfile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    title: '',
    github: '',
    leetcode: '',
    linkedin: '',
    telegram: '',
    codeforces: ''
  });

  // UPDATED: Uses environment variable for production
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/auth';

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/profile`, { withCredentials: true });
      const userData = res.data;
      setUser(userData);
      
      const h = userData.codingHandles;
      setFormData({
        name: userData.name || '',
        title: userData.title || 'Full-Stack Student',
        github: h?.github || '',
        leetcode: h?.leetcode || '',
        linkedin: h?.linkedin || '',
        telegram: h?.telegram || '',
        codeforces: h?.codeforces || ''
      });
    } catch (err) { 
      console.error("Fetch error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.patch(`${API_BASE}/profile`, formData, { withCredentials: true });
      setUser(res.data);
      setIsEditModalOpen(false);
    } catch (err) { 
      alert("Update failed"); 
    } finally { 
      setSaving(false); 
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-28 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 bg-indigo-100 rounded-3xl overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="avatar" />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black text-slate-900">{user?.name}</h1>
              <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mt-1">
                {user?.title || 'Full-Stack Student'}
              </p>
              <p className="text-slate-400 text-sm font-medium">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditModalOpen(true)} 
            className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
          >
            <Edit3 size={18} /> Edit Profile
          </button>
        </div>

        {/* Handles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <HandleCard type="github" username={user?.codingHandles?.github} icon={<Github size={20}/>} />
          <HandleCard type="leetcode" username={user?.codingHandles?.leetcode} icon={<Trophy size={20}/>} />
          <HandleCard type="linkedin" username={user?.codingHandles?.linkedin} icon={<Linkedin size={20}/>} />
          <HandleCard type="telegram" username={user?.codingHandles?.telegram} icon={<Send size={20}/>} />
          <HandleCard type="codeforces" username={user?.codingHandles?.codeforces} icon={<Terminal size={20}/>} />
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">Update Profile</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors"><X /></button>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* FIXED: Explicitly typed 'v' to string */}
                  <Input label="Full Name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} />
                  <Input label="Professional Title" value={formData.title} onChange={(v: string) => setFormData({...formData, title: v})} placeholder="e.g. Frontend Developer" />
                </div>
                
                <div className="h-px bg-slate-100 my-4" />
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Social & Coding Handles</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* FIXED: Explicitly typed 'v' to string for all fields */}
                  <Input label="GitHub Username" value={formData.github} onChange={(v: string) => setFormData({...formData, github: v})} />
                  <Input label="LeetCode Username" value={formData.leetcode} onChange={(v: string) => setFormData({...formData, leetcode: v})} />
                  <Input label="LinkedIn Username/URL" value={formData.linkedin} onChange={(v: string) => setFormData({...formData, linkedin: v})} />
                  <Input label="Telegram Username" value={formData.telegram} onChange={(v: string) => setFormData({...formData, telegram: v})} />
                  <Input label="Codeforces Username" value={formData.codeforces} onChange={(v: string) => setFormData({...formData, codeforces: v})} />
                </div>

                <button type="submit" disabled={saving} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black mt-4 flex justify-center items-center gap-2 hover:bg-indigo-700 transition-all">
                  {saving ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- HELPER COMPONENTS ---

// FIXED: Defined props interface to avoid 'any' type errors
interface InputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const Input = ({ label, value, onChange, placeholder }: InputProps) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type="text" value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-50 border border-transparent rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
    />
  </div>
);

const HandleCard = ({ type, username, icon }: { type: string, username: string | undefined, icon: React.ReactNode }) => {
  const getUrl = () => {
    if (!username) return null;
    switch(type) {
      case 'github': return `https://github.com/${username}`;
      case 'leetcode': return `https://leetcode.com/${username}`;
      case 'linkedin': return username.includes('linkedin.com') ? username : `https://linkedin.com/in/${username}`;
      case 'telegram': return `https://t.me/${username.replace('@', '')}`;
      case 'codeforces': return `https://codeforces.com/profile/${username}`;
      default: return null;
    }
  };

  const url = getUrl();

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-100 transition-all">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-indigo-600 transition-colors">{icon}</div>
        <div className="overflow-hidden">
          <p className="text-sm font-black text-slate-800 capitalize">{type}</p>
          <p className="text-xs text-slate-400 font-medium truncate max-w-[140px]">{username || 'Not linked'}</p>
        </div>
      </div>
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
          <ExternalLink size={16} />
        </a>
      )}
    </div>
  );
};

export default StudentProfile;