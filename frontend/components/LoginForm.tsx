'use client';
import React from 'react';
import { Mail, Lock, Eye, ArrowRight, Github } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link for navigation

const LoginForm = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/login',
                { email, password },
                { withCredentials: true }
            );
            console.log("Login Success:", response.data);
            if (response.status === 200) {
                const role = response.data.user.role;
                router.push(role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            {/* Logo / Header */}
            <div className="absolute top-8 left-8 flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                    <code className="text-white font-bold tracking-tighter">{"</>"}</code>
                </div>
                <span className="font-bold text-xl text-gray-900">DevHub</span>
            </div>

            <div className="w-full max-auto max-w-[400px] bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <div className="flex flex-col items-center mb-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                        <Lock size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 text-center">Welcome back to DevHub</h1>
                    <p className="text-gray-500 mt-2 text-center text-sm">
                        Enter your credentials to access the developer dashboard.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleLogin}>
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
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700">Password</label>
                            <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot Password?</a>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                            <Eye className="absolute right-3 top-3.5 text-gray-400 cursor-pointer" size={18} />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100"
                    >
                        Login to DevHub <ArrowRight size={20} />
                    </button>
                </form>

                {/* Register Link Section */}
                <div className="pt-6 border-t border-gray-100 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>

            {/* <p className="mt-8 text-sm text-gray-500">
                Having trouble logging in? <span className="text-indigo-600 font-bold cursor-pointer">Contact Administrator</span>
            </p> */}
        </div>
    );
};

export default LoginForm;