// frontend/app/admin/layout.tsx
"use client"; // Required for client-side cookie check
import Sidebar from '@/components/Sidebar';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; // Install using: npm install js-cookie
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // In a real app, you'd decode the JWT to check the role.
    // For now, we check if the cookie exists.
    const token = Cookies.get('token');
    
    if (!token) {
      router.replace('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FDFDFF]">
      <Sidebar role="admin" />
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}