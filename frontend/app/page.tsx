// frontend/app/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function RootPage() {
  // Notice the 'await' here - this is required in Next.js 15
  const cookieStore = await cookies();
  const token = cookieStore.get('token');

  // If user is already logged in, send them to dashboard
  if (token) {
    redirect('/student/dashboard');
  }

  // Otherwise, send everyone else to login
  redirect('/login');
}   