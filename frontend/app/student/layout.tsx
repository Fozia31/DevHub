// frontend/app/student/layout.tsx
"use client";
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch errors
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      {/* pt-20 matches your Navbar h-20 to prevent overlap */}
      <main className="pt-20">
        <section className="animate-in fade-in duration-500">
          {children}
        </section>
      </main>
    </div>
  );
}