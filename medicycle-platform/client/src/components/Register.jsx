import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Activity } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'pharmacy' // Default role
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Connects to your Node.js Backend
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert('Registration Successful! Please Login.');
      navigate('/'); // Redirect to Login
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Error registering');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-teal-50 p-3 rounded-full">
            <Activity className="text-primary" size={32} />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-primary mb-2">Create Account</h2>
        <p className="text-center text-gray-500 mb-8">Join the MediCycle Network</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
            <input type="text" name="username" placeholder="e.g. City Pharmacy" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" name="email" placeholder="pharmacy@example.com" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" placeholder="••••••••" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select name="role" onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white">
              <option value="pharmacy">Pharmacy (Seller)</option>
              <option value="individual">Individual / Clinic (Buyer)</option>
            </select>
          </div>

          <button type="submit" className="w-full bg-primary hover:bg-teal-800 text-white font-bold py-3 rounded-lg transition-all duration-200 flex justify-center items-center gap-2">
            <UserPlus size={20} /> Register
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/" className="text-primary font-semibold hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
}