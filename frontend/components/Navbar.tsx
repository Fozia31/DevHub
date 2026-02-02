// frontend/components/Navbar.tsx
"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, CheckSquare, User, LogOut } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const pathname = usePathname();

  // Build the API base URL robustly (accept env with or without trailing `/api`)
  const rawApi = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const API_BASE = rawApi.replace(/\/$/, '');

  const navItems = [
    { name: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Tasks', href: '/student/tasks', icon: <CheckSquare size={18} /> },
    { name: 'Resources', href: '/student/resources', icon: <BookOpen size={18} /> },
    { name: 'Profile', href: '/student/profile', icon: <User size={18} /> },
  ];

  const handleLogout = async () => {
    try {
      // DYNAMIC URL: Uses Render in prod, localhost in dev
      const logoutUrl = `${API_BASE}/api/auth/logout`;
      console.debug('Logout URL:', logoutUrl);
      await axios.post(logoutUrl, {}, { withCredentials: true });
      
      // Clear localStorage if you store user data there
      localStorage.removeItem('user'); 
      
      window.location.href = '/login'; 
    } catch (err) {
      console.error("Logout failed", err);
      window.location.href = '/login'; // Force redirect anyway
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-[100] shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white font-bold text-xs">{"</>"}</div>
        <span className="font-bold text-xl tracking-tight text-slate-900">DevHub</span>
      </div>

      <div className="flex items-center gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block" />
        
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={16} />
          <span className="hidden lg:inline">Sign Out</span>
        </button>

        <div className="w-10 h-10 rounded-full border-2 border-slate-100 overflow-hidden bg-slate-50">
           <img src={`https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`} alt="User" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;