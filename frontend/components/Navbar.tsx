"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, CheckSquare, User, LogOut, Menu, X } from 'lucide-react';
import axios from 'axios';

const Navbar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      const logoutUrl = `${API_BASE}/api/auth/logout`;
      await axios.post(logoutUrl, {}, { withCredentials: true });
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      window.location.href = '/login'; 
    } catch (err) {
      window.location.href = '/login';
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 md:h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between z-[100] shadow-sm">
      {/* Logo Section */}
      <div className="flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white font-bold text-xs">{"</>"}</div>
        <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900">DevHub</span>
      </div>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-1 lg:gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        <div className="h-8 w-[1px] bg-slate-200 mx-1 hidden md:block" />
        
        {/* Sign Out - Hidden on small mobile labels */}
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg font-bold text-xs text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-slate-100 overflow-hidden bg-slate-50">
           <img src={`https://ui-avatars.com/api/?name=User&background=6366f1&color=fff`} alt="User" />
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Side Drawer/Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl md:hidden animate-in slide-in-from-top duration-200">
          <div className="flex flex-col p-4 gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl font-bold text-sm transition-all ${
                    isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;