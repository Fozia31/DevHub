// frontend/app/admin/layout.tsx
"use client"; 
import Sidebar from '@/components/Sidebar';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; 

  return (
    <div className="flex min-h-screen bg-[#FDFDFF]">
      <Sidebar role="admin" />
      
      {/* CHANGE: Removed 'ml-64' and replaced with 'lg:ml-64'.
          Added 'w-full' and 'overflow-x-hidden' to ensure no horizontal scrolling.
      */}
      <main className="flex-1 lg:ml-64 min-h-screen w-full overflow-x-hidden transition-all duration-300">
        {children}
      </main>
    </div>
  );
}