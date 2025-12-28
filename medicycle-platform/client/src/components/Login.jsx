import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Lock, Activity } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  // 👇 DYNAMIC API URL (Works on both Vercel and Localhost)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      
      // 1. Save Token
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', res.data.user.role);
      localStorage.setItem('userName', res.data.user.username);

      // 2. Force Refresh to load Sidebar
      window.location.href = '/dashboard';
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Invalid Credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        
        <div className="flex justify-center mb-6">
          <div className="bg-teal-50 p-3 rounded-full">
            <Activity className="text-primary" size={40} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-primary mb-2">Welcome Back</h1>
        <p className="text-center text-gray-500 mb-8">Login to manage your inventory</p>

        {error && (
          <div className="bg-red-50 text-danger border border-red-200 p-3 rounded mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              name="email" 
              onChange={handleChange} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" 
              placeholder="Enter your email"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              name="password" 
              onChange={handleChange} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" 
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="w-full bg-primary hover:bg-teal-800 text-white font-bold py-3 rounded-lg transition-all duration-200 flex justify-center items-center gap-2">
            <Lock size={20} /> Login
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          New to MediCycle? <Link to="/register" className="text-primary font-semibold hover:underline">Create an account</Link>
        </div>
      </div>
    </div>
  );
}