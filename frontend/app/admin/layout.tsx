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
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}