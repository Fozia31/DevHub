"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, CheckSquare, 
  Library, BarChart3, Settings, LogOut, 
  User
} from 'lucide-react';

const Sidebar = ({ role = "admin" }) => {
  const pathname = usePathname();

  const adminLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    // { name: 'Student Directory', href: '/admin/students', icon: <Users size={20} /> },
    { name: 'Task Manager', href: '/admin/tasks', icon: <CheckSquare size={20} /> },
    { name: 'Resource Library', href: '/admin/resources', icon: <Library size={20} /> },
    // { name: 'Analytics', href: '/admin/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Profile', href: '/admin/profile', icon: <User size={18} /> },

  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-100 flex flex-col z-[100]">
      {/* Brand Logo */}
      <div className="p-8 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl text-white">
          <LayoutDashboard size={20} />
        </div>
        <div>
          <h1 className="font-black text-slate-900 leading-tight">CodeCamp</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            {role === "admin" ? "Admin Portal" : "Student Portal"}
          </p>
        </div>
      </div>

      {/* Nav Links */}
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

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-50 space-y-2">
        <button className="flex items-center gap-4 px-4 py-3 w-full rounded-xl font-bold text-sm text-slate-400 hover:bg-slate-50 transition-all">
          <Settings size={20} /> Settings
        </button>
        <button className="flex items-center gap-4 px-4 py-3 w-full rounded-xl font-bold text-sm text-red-400 hover:bg-red-50 transition-all">
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;