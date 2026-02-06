'use client';
import React, { useState } from 'react';
import { Mail, Lock, Eye, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                if (typeof window !== 'undefined') {
                    if (data.token) {
                        localStorage.setItem('auth_token', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user));
                    }

                    const verifyAuth = async (retries = 3, delay = 500) => {
                        const role = data.user?.role || 'student';
                        const target = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';

                        for (let i = 0; i < retries; i++) {
                            try {
                                const verifyResp = await fetch(`${API_BASE}/api/auth/profile`, {
                                    method: 'GET',
                                    credentials: 'include'
                                });
                                if (verifyResp.ok) {
                                    window.location.href = target;
                                    return;
                                }
                            } catch (e) {}
                            await new Promise(r => setTimeout(r, delay));
                        }
                        setError('Login succeeded but auth cookie was not set. Check CORS.');
                        setIsLoading(false);
                    };
                    verifyAuth();
                }
            } else {
                setError(data.message || 'Login failed');
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Network error. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
            
            <div className="mb-8 md:absolute md:top-6 md:left-6 flex items-center gap-2 self-start md:self-auto">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-md">
                    <code className="text-white font-bold text-sm">{"</>"}</code>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                    DevHub
                </span>
            </div>

            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8 text-center">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="text-white" size={24} />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-white">Welcome Back</h1>
                        <p className="text-blue-100 mt-1 text-xs md:text-sm">
                            Sign in to access your developer dashboard
                        </p>
                    </div>

                    <div className="p-6 md:p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-4 md:space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="developer@devhub.com"
                                        className="w-full pl-10 pr-4 py-3 md:py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-semibold text-gray-700">Password</label>
                                    <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                        Forgot?
                                    </a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full pl-10 pr-12 py-3 md:py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                    >
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 md:py-4 px-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 transform active:scale-95"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                            <p className="text-sm text-gray-600">
                                New here?{' '}
                                <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                    Get started
                                </Link>
                            </p>
                        </div>

                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <div className="text-[10px] md:text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Test Credentials
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2 text-[11px] md:text-xs">
                                <div className="overflow-hidden">
                                    <div className="text-gray-600">Email:</div>
                                    <div className="font-mono text-gray-900 truncate">test@gmail.com</div>
                                </div>
                                <div className="overflow-hidden">
                                    <div className="text-gray-600">Password:</div>
                                    <div className="font-mono text-gray-900">password123</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-6 text-center px-4">
                    <p className="text-[10px] md:text-xs text-gray-500">
                        By continuing, you agree to our{' '}
                        <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;