'use client';
import React, { useState } from 'react';
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
    const router = useRouter();

    const handleLogin = async (e: React.MouseEvent) => {
        e.preventDefault();
        console.log('Login button clicked!');
        
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }
        
        setError('');
        setIsLoading(true);

        console.log('Sending to:', `${API_BASE}/api/auth/login`);

        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            console.log('Response status:', response.status);
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (response.ok) {
                console.log('Login successful!');
                const role = data.user?.role || 'student';
                
                // Redirect based on role
                if (role === 'admin') {
                    window.location.href = '/admin/dashboard';
                } else {
                    window.location.href = '/student/dashboard';
                }
            } else {
                setError(data.message || 'Login failed');
                setIsLoading(false);
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError('Network error. Please try again.');
            setIsLoading(false);
        }
    };

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
                        {error}
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

                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
                    <div className="font-semibold mb-1">Debug Info:</div>
                    <div>Backend URL: {API_BASE}</div>
                    <button 
                        onClick={() => console.log('Test click')}
                        className="mt-1 px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs"
                    >
                        Click to test
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;