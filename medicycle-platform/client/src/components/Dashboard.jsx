import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, AlertTriangle, CheckCircle, Package, Calendar, TrendingUp } from 'lucide-react';
import DemandForecast from './DemandForecast'; // 👈 IMPORT THE AI COMPONENT

export default function Dashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDummyData, setUsingDummyData] = useState(false);

  // 👇 DUMMY DATA FOR DASHBOARD (Shows if DB is empty)
  const dummyInventory = [
    { _id: 'd1', name: 'Amoxicillin 500mg', quantity: 120, expiryDate: '2024-02-10', batchNumber: 'B-101', status: 'active', risk: { level: 'CRITICAL', color: 'red' } },
    { _id: 'd2', name: 'Paracetamol 650mg', quantity: 500, expiryDate: '2025-08-15', batchNumber: 'P-202', status: 'active', risk: { level: 'SAFE', color: 'green' } },
    { _id: 'd3', name: 'Metformin 500mg', quantity: 300, expiryDate: '2024-05-20', batchNumber: 'M-305', status: 'active', risk: { level: 'WARNING', color: 'orange' } },
    { _id: 'd4', name: 'Cetirizine 10mg', quantity: 200, expiryDate: '2026-01-01', batchNumber: 'C-999', status: 'active', risk: { level: 'SAFE', color: 'green' } }
  ];

  // Helper: Calculate Risk (Same as server logic)
  const calculateRisk = (date) => {
    const today = new Date();
    const exp = new Date(date);
    const diffTime = exp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { level: 'EXPIRED', color: 'red' };
    if (diffDays <= 30) return { level: 'CRITICAL', color: 'red' };
    if (diffDays <= 90) return { level: 'WARNING', color: 'orange' };
    return { level: 'SAFE', color: 'green' };
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };

      const res = await axios.get(`${API_URL}/api/inventory`, config);
      
      if (res.data && res.data.length > 0) {
        setInventory(res.data);
        setUsingDummyData(false);
      } else {
        setInventory(dummyInventory);
        setUsingDummyData(true);
      }

    } catch (err) {
      console.error("Using Dummy Dashboard Data");
      setInventory(dummyInventory);
      setUsingDummyData(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-teal-600 animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Inventory Health</h2>
        {usingDummyData && (
          <span className="text-xs bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold flex items-center gap-1">
            <AlertTriangle size={12} /> Demo Mode
          </span>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-red-500" />
            <h3 className="text-red-800 font-bold">Critical Action</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {inventory.filter(i => calculateRisk(i.expiryDate).level === 'CRITICAL').length}
          </p>
          <p className="text-sm text-red-600 mt-1">Items expiring soon</p>
        </div>

        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-orange-500" />
            <h3 className="text-orange-800 font-bold">Warning Zone</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {inventory.filter(i => calculateRisk(i.expiryDate).level === 'WARNING').length}
          </p>
          <p className="text-sm text-orange-600 mt-1">Expiring in 3 months</p>
        </div>

        <div className="bg-teal-50 p-6 rounded-2xl border border-teal-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-teal-600" />
            <h3 className="text-teal-800 font-bold">Safe Stock</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {inventory.filter(i => calculateRisk(i.expiryDate).level === 'SAFE').length}
          </p>
          <p className="text-sm text-teal-600 mt-1">Healthy inventory</p>
        </div>
      </div>

      {/* 🤖 AI DEMAND FORECAST SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart takes up 2 columns */}
        <div className="lg:col-span-2">
           <DemandForecast />
        </div>

        {/* Optional: Small Insight Box on the right */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-center">
           <h3 className="text-xl font-bold mb-2">AI Insight 💡</h3>
           <p className="text-purple-100 mb-4 text-sm leading-relaxed">
             Based on current consumption rates, your stock of <strong>Antibiotics</strong> may run low by mid-July.
           </p>
           <button className="bg-white text-purple-700 font-bold py-2 px-4 rounded-lg text-sm hover:bg-purple-50 transition">
             Auto-Order Stock
           </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
             <Package size={18} className="text-gray-500"/> 
             Batch Intelligence
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Medicine Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Batch #</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Expiry Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventory.map((item) => {
                const risk = item.risk || calculateRisk(item.expiryDate);
                return (
                  <tr key={item._id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{item.batchNumber}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(item.expiryDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border
                        ${risk.level === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-100' : 
                          risk.level === 'WARNING' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                          'bg-green-50 text-green-600 border-green-100'}`}>
                        {risk.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {risk.level === 'CRITICAL' && (
                        <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline decoration-blue-200 underline-offset-4">
                          Redistribute
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}