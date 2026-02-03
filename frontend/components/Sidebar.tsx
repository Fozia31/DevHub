"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, CheckSquare, 
  Library, LogOut, Menu, X 
} from 'lucide-react';
import axios from 'axios';

const Sidebar = ({ role = "admin" }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const API_BASE = rawApi.replace(/\/$/, '');

  const handleLogout = async () => {
    try {
      const logoutUrl = `${API_BASE}/api/auth/logout`;
      await axios.post(logoutUrl, {}, { withCredentials: true });
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    } catch (err) {
      window.location.href = '/login';
    }
  };

  const adminLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Task Manager', href: '/admin/tasks', icon: <CheckSquare size={20} /> },
    { name: 'Resource Library', href: '/admin/resources', icon: <Library size={20} /> },
  ];

  return (
    <>
      {/* --- Mobile Trigger Button --- */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-[110] p-2 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-600"
      >
        <Menu size={24} />
      </button>

      {/* --- Overlay (Mobile Only) --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[120] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* --- Sidebar Container --- */}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex flex-col z-[130] transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:z-[100]
      `}>

        {/* Header Section */}
        <div className="p-8 flex items-center justify-between lg:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="font-black text-slate-900 leading-tight">DevHub</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                {role === "admin" ? "Admin Portal" : "Student Portal"}
              </p>
            </div>
          </div>
          
          {/* Close button - Mobile only */}
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsOpen(false)} // Close sidebar on link click (mobile)
                className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-50 space-y-2">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-xl font-bold text-sm text-red-400 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;