// frontend/components/Sidebar.tsx
"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, CheckSquare, 
  Library, LogOut
} from 'lucide-react';
import axios from 'axios';

const Sidebar = ({ role = "admin" }) => {
  const pathname = usePathname();

  // Build the API base URL robustly (accept env with or without trailing `/api`)
  const rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const API_BASE = rawApi.replace(/\/$/, '');

  const handleLogout = async () => {
    try {
      // 2. Use the dynamic API_BASE instead of localhost
      const logoutUrl = `${API_BASE}/api/auth/logout`;
      console.debug('Logout URL:', logoutUrl);
      await axios.post(logoutUrl, {}, { withCredentials: true });
      window.location.href = '/login';
    } catch (err) {
      console.error("Logout failed", err);
      // Fallback: force redirect even if the server call fails
      window.location.href = '/login';
    }
  };

  const adminLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Task Manager', href: '/admin/tasks', icon: <CheckSquare size={20} /> },
    { name: 'Resource Library', href: '/admin/resources', icon: <Library size={20} /> },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex flex-col z-[100]">

      <div className="p-8 flex items-center gap-3">
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

      <nav className="flex-1 px-4 space-y-2">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.name} 
              href={link.href}
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

      <div className="p-4 border-t border-slate-50 space-y-2">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-4 py-3 w-full rounded-xl font-bold text-sm text-red-400 hover:bg-red-50 transition-all"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;