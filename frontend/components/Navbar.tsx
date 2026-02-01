"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Use useRouter for cleaner redirects
import { LayoutDashboard, BookOpen, CheckSquare, User, LogOut } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Tasks', href: '/student/tasks', icon: <CheckSquare size={18} /> },
    { name: 'Resources', href: '/student/resource', icon: <BookOpen size={18} /> },
    { name: 'Profile', href: '/student/profile', icon: <User size={18} /> },
  ];

  const handleLogout = async () => {
    try {
      // 1. Call backend to clear the cookie (if using httpOnly cookies)
      await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
      
      // 2. Clear frontend state and redirect
      // Using window.location.href is a "hard" reset which is good for auth
      window.location.href = '/login'; 
    } catch (err) {
      console.error("Logout failed", err);
      // Fallback: force redirect even if backend call fails
      window.location.href = '/login';
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-[100] shadow-sm">
      {/* ... Logo Area ... */}
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white font-bold text-xs">{"</>"}</div>
        <span className="font-bold text-xl tracking-tight text-slate-900">DevHub</span>
      </div>

      {/* ... Nav Links ... */}
      <div className="flex items-center gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Profile & Logout Section */}
      <div className="flex items-center gap-4">
        <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block" />
        
        {/* FIX: Attached onClick here */}
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={16} />
          <span className="hidden lg:inline">Sign Out</span>
        </button>

        <div className="w-10 h-10 rounded-full border-2 border-slate-100 overflow-hidden bg-slate-50">
           <img src={`https://ui-avatars.com/api/?name=wert yui&background=6366f1&color=fff`} alt="User" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;