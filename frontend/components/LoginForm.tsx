'use client';
import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isClient, setIsClient] = useState(false); // Add this
    const router = useRouter();

    // Debug on mount - ONLY on client side
    useEffect(() => {
        setIsClient(true); // Mark that we're on client
        console.log('🔧 Login Form Mounted (Client Side)');
        console.log('API Base:', API_BASE);
        
        // Only access browser APIs on client
        if (typeof window !== 'undefined') {
            console.log('Current cookies:', document.cookie);
            console.log('Has localStorage token?', localStorage.getItem('auth_token') ? 'Yes' : 'No');
        }
    }, []);

    const handleLogin = async (e: React.MouseEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        console.log('🚀 Login attempt with:', { email });

        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            console.log('📥 Response status:', response.status);
            
            const data = await response.json();
            console.log('📥 Response data:', data);
            
            if (response.ok) {
                console.log('✅ Login successful!');
                
                // Store in localStorage as backup - only on client
                if (typeof window !== 'undefined' && data.token) {
                    localStorage.setItem('auth_token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    console.log('💾 Token saved to localStorage:', data.token.substring(0, 20) + '...');
                }
                
                // Try to set cookie manually if not set by server - only on client
                if (typeof window !== 'undefined' && data.token && !document.cookie.includes('token')) {
                    document.cookie = `token=${data.token}; path=/; max-age=86400; secure; samesite=none`;
                    console.log('🔧 Manually set cookie');
                }
                
                // Redirect based on role
                const role = data.user?.role || 'student';
                console.log('👤 User role:', role);
                
                if (typeof window !== 'undefined') {
                    if (role === 'admin') {
                        console.log('➡️ Redirecting to admin dashboard');
                        window.location.href = '/admin/dashboard';
                    } else {
                        console.log('➡️ Redirecting to student dashboard');
                        window.location.href = '/student/dashboard';
                    }
                }
            } else {
                setError(data.message || 'Login failed');
                setIsLoading(false);
            }
        } catch (err: any) {
            console.error('❌ Login error:', err);
            setError('Network error. Please try again.');
            setIsLoading(false);
        }
    };

    // Test backend connection
    const testBackend = async () => {
        try {
            console.log('🔍 Testing backend connection...');
            const response = await fetch(`${API_BASE}/health`);
            const data = await response.text();
            console.log('✅ Backend health:', data);
            alert(`Backend is healthy: ${data}`);
        } catch (err) {
            console.error('❌ Backend test failed:', err);
            alert(`Backend test failed. Check if ${API_BASE} is accessible.`);
        }
    };

    // Test direct login (bypass UI)
    const testDirectLogin = async () => {
        console.log('🧪 Testing direct login...');
        await handleLogin({ preventDefault: () => {} } as React.MouseEvent);
    };

    // Helper to safely check cookies (client only)
    const hasCookies = isClient && document.cookie.length > 0;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 text-slate-900">
            <div className="absolute top-8 left-8 flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                    <code className="text-white font-bold tracking-tighter">{"</>"}</code>
                </div>
                <span className="font-bold text-xl text-gray-900">DevHub</span>
            </div>

            <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <div className="flex flex-col items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <Lock size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 text-center">Welcome back</h1>
                    <p className="text-gray-500 mt-2 text-center text-sm">
                        Enter your credentials to access the developer dashboard.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Debug Panel - Only show useful info */}
                {isClient && (
                    <div className="mb-4 p-3 bg-blue-50 text-blue-600 text-sm rounded-lg border border-blue-100">
                        <div className="font-semibold mb-2">🔧 Debug Panel (Client Only)</div>
                        <div className="mb-1">Backend: {API_BASE}</div>
                        <div className="mb-1">Cookies: {hasCookies ? 'Present' : 'Empty'}</div>
                        <div className="flex gap-2 mt-2">
                            <button 
                                onClick={testBackend}
                                className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs"
                            >
                                Test Backend
                            </button>
                            <button 
                                onClick={testDirectLogin}
                                className="px-2 py-1 bg-green-100 hover:bg-green-200 rounded text-xs"
                            >
                                Test Login
                            </button>
                            <button 
                                onClick={() => console.log('Cookies:', document.cookie)}
                                className="px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded text-xs"
                            >
                                Check Cookies
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. shafqat@devhub.com"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700">Password</label>
                            <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot?</a>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-indigo-600 p-1"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                            >
                                <Eye size={18} />
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Signing in...
                            </>
                        ) : (
                            <>
                                Login to DevHub
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>

                <div className="pt-6 border-t border-gray-100 text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-indigo-600 font-bold hover:text-indigo-700">
                            Create Account
                        </Link>
                    </p>
                </div>

                {/* Test credentials */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
                    <div className="font-semibold mb-1">Test Credentials:</div>
                    <div>Email: test@gmail.com</div>
                    <div>Password: password123</div>
                    <div className="mt-1 text-blue-500">Role: Admin</div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;