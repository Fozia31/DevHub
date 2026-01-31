// frontend/app/student/layout.tsx
"use client";
import Navbar from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.replace('/login');
    } else {
      setIsAuth(true);
    }
  }, [router]);

  if (!isAuth) return null; // Prevents UI flicker while redirecting

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}