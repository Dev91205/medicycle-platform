import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Pill, Calendar, Hash, Package, Save } from 'lucide-react';

export default function AddMedicine() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    expiryDate: '',
    batchNumber: '',
    condition: 'Good'
  });

  // 👇 DYNAMIC API URL (Works on Vercel and Localhost)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token // Send token to verify you are a Pharmacy
        }
      };

      await axios.post(`${API_URL}/api/inventory`, formData, config);
      
      alert('Medicine Added Successfully!');
      navigate('/dashboard'); // Go back to dashboard
      
    } catch (err) {
      console.error(err);
      alert('Error adding medicine. Make sure you are logged in as a Pharmacy.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
        <div className="bg-teal-50 p-2 rounded-lg">
          <Pill className="text-primary" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Add Inventory</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Medicine Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine Name</label>
          <div className="relative">
            <input 
              type="text" 
              name="name" 
              required
              placeholder="e.g. Amoxicillin 500mg"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 pl-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity (Units)</label>
            <div className="relative flex items-center">
              <Package className="absolute left-3 text-gray-400" size={18} />
              <input 
                type="number" 
                name="quantity" 
                required
                placeholder="0"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          {/* Batch Number */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Number</label>
            <div className="relative flex items-center">
              <Hash className="absolute left-3 text-gray-400" size={18} />
              <input 
                type="text" 
                name="batchNumber" 
                required
                placeholder="B-12345"
                value={formData.batchNumber}
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 text-gray-400" size={18} />
              <input 
                type="date" 
                name="expiryDate" 
                required
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-gray-600"
              />
            </div>
          </div>

          {/* Condition Select */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Storage Condition</label>
            <select 
              name="condition" 
              value={formData.condition} 
              onChange={handleChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white"
            >
              <option value="Good">Good (Standard Room Temp)</option>
              <option value="Refrigerated">Refrigerated (2-8°C)</option>
              <option value="Sealed">Sealed / Unopened</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 flex justify-center items-center gap-2 mt-4 shadow-md hover:shadow-lg transform active:scale-95"
        >
          {loading ? 'Saving...' : <><Save size={20} /> Add to Inventory</>}
        </button>

      </form>
    </div>
  );
}