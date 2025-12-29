import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Activity, Mail, Lock, User, Briefcase } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'pharmacy' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔴 IMPORTANT: REPLACE THIS WITH YOUR RENDER BACKEND URL
  // Example: 'https://medicycle-backend.onrender.com'
  const API_URL = 'https://YOUR-RENDER-APP-NAME.onrender.com'; 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 1️⃣ STANDARD REGISTER
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("Sending data to:", `${API_URL}/api/auth/register`); // Debug Log
      await axios.post(`${API_URL}/api/auth/register`, formData);
      alert('Registration Successful! Please Login.');
      navigate('/'); 
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.response?.data?.msg || 'Error registering. Check console.');
    } finally {
      setLoading(false);
    }
  };

  // 2️⃣ GOOGLE REGISTER
  const handleGoogleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Send to Backend
      await axios.post(`${API_URL}/api/auth/google`, {
        username: user.displayName,
        email: user.email,
      });

      // Save and Redirect
      // (We assume backend returns token/user data on success)
      navigate('/'); 
    } catch (err) {
      console.error("Google Register Error:", err);
      setError("Google Sign-Up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      
      {/* Header */}
      <div className="text-center mb-6">
         <div className="flex justify-center mb-2">
            <div className="bg-teal-500/20 p-2 rounded-full">
               <Activity className="text-teal-600" size={24} />
            </div>
         </div>
         <h2 className="text-2xl font-bold text-slate-900">
            Create Account
         </h2>
         <p className="text-sm text-gray-500 mt-1">Join the MediCycle Network</p>
      </div>

      <div className="w-full max-w-sm bg-white p-6 shadow-xl shadow-slate-200 border border-gray-100 rounded-2xl">
          
          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 rounded text-xs text-center font-bold">
              {error}
            </div>
          )}

          {/* GOOGLE BUTTON */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full bg-white text-gray-700 font-bold py-2 px-4 rounded-lg border border-gray-300 flex items-center justify-center gap-2 hover:bg-gray-50 transition mb-4 shadow-sm text-sm"
          >
             <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
             </svg>
            Sign up with Google
          </button>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase font-bold tracking-wider">
              Or with email
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            
            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name / Org Name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="e.g. City Pharmacy"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-sm"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Account Type</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition appearance-none cursor-pointer text-sm"
                >
                  <option value="pharmacy">Pharmacy (Seller)</option>
                  <option value="individual">Individual / Clinic (Buyer)</option>
                  <option value="organization">NGO</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all flex justify-center items-center gap-2 shadow-md text-sm mt-2"
            >
              {loading ? "Creating..." : <><UserPlus size={16} /> Register</>}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Already have an account?{" "}
              <Link to="/" className="font-bold text-teal-600 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
      </div>
    </div>
  );
}