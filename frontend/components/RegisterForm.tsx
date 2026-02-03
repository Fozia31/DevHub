'use client';
import React, { useState } from 'react';
import { Mail, Lock, Eye, ArrowRight, Loader2, User, UserCircle } from 'lucide-react';
import Link from 'next/link';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                setError(data.message || 'Registration failed');
                setIsLoading(false);
            }
        } catch (err) {
            setError('Network error. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
            {/* Header Logo - Adjusted for mobile positioning */}
            <div className="mb-8 md:absolute md:top-6 md:left-6 flex items-center gap-2 self-start md:self-auto">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-md">
                    <code className="text-white font-bold text-sm">{"</>"}</code>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                    DevHub
                </span>
            </div>

            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 transition-all">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserCircle className="text-white" size={28} />
                        </div>
                        <h1 className="text-xl md:text-2xl font-bold text-white">Create Account</h1>
                        <p className="text-blue-100 mt-1 text-xs md:text-sm">
                            Join our community of developers today
                        </p>
                    </div>

                    <div className="p-6 md:p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r animate-in fade-in duration-300">
                                <p className="text-sm text-red-700 font-medium">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r animate-in fade-in duration-300">
                                <p className="text-sm text-green-700 font-medium">
                                    Success! Redirecting to login...
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Email Address */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="developer@devhub.com"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                                    </button>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Join as</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-700 font-medium"
                                >
                                    <option value="student">Student</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3.5 md:py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 transform hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight className="h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-center text-sm text-gray-600">
                                Already have an account?{' '}
                                <Link 
                                    href="/login" 
                                    className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-6 text-center px-4">
                    <p className="text-xs text-gray-500 leading-relaxed">
                        By signing up, you agree to our{' '}
                        <a href="#" className="text-gray-700 underline decoration-gray-300 hover:text-gray-900">Terms</a> and <a href="#" className="text-gray-700 underline decoration-gray-300 hover:text-gray-900">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;