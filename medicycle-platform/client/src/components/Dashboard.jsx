import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, Activity, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const stats = { critical: 2, warning: 5, safe: 120 };
  
  const inventory = [
    { _id: 1, name: 'Amoxicillin 500mg', batch: 'B-101', expiry: '2025-01-20', risk: 'CRITICAL' },
    { _id: 2, name: 'Paracetamol', batch: 'P-200', expiry: '2025-04-10', risk: 'SAFE' },
    { _id: 3, name: 'Metformin', batch: 'M-505', expiry: '2025-03-15', risk: 'WARNING' },
    { _id: 4, name: 'Insulin', batch: 'I-99', expiry: '2025-01-10', risk: 'CRITICAL' },
  ];

  const getRiskStyle = (risk) => {
    if (risk === 'CRITICAL') return 'bg-red-50 text-red-700 border border-red-200';
    if (risk === 'WARNING') return 'bg-orange-50 text-orange-700 border border-orange-200';
    return 'bg-green-50 text-green-700 border border-green-200';
  };

  return (
    <div className="max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="mb-8 text-white">
        <h1 className="text-3xl font-bold">Good Morning, Pharmacy A</h1>
        <p className="text-teal-100 mt-1 opacity-90">Here is your inventory health overview for today.</p>
      </div>

      {/* Stats Grid - Floating Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative z-10">
        
        {/* Critical Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-8 border-danger hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Critical Action</p>
                    <h3 className="text-4xl font-bold text-gray-800 mt-2">{stats.critical}</h3>
                </div>
                <div className="bg-red-100 p-3 rounded-full text-danger">
                    <AlertTriangle size={24} />
                </div>
            </div>
            <p className="text-sm text-red-600 mt-4 font-medium">Expires in &lt; 30 days</p>
        </div>

        {/* Warning Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-8 border-warning hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Warning Zone</p>
                    <h3 className="text-4xl font-bold text-gray-800 mt-2">{stats.warning}</h3>
                </div>
                <div className="bg-orange-100 p-3 rounded-full text-warning">
                    <Activity size={24} />
                </div>
            </div>
            <p className="text-sm text-orange-600 mt-4 font-medium">Expires in 30-60 days</p>
        </div>

        {/* Safe Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border-l-8 border-success hover:transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Safe Stock</p>
                    <h3 className="text-4xl font-bold text-gray-800 mt-2">{stats.safe}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-full text-success">
                    <ShieldCheck size={24} />
                </div>
            </div>
            <p className="text-sm text-green-600 mt-4 font-medium">No immediate action</p>
        </div>
      </div>

      {/* Main Table - Floating Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-primary"/>
                Batch Intelligence
            </h2>
            <button className="text-sm text-primary font-semibold hover:underline">Download Report</button>
        </div>
        
        <table className="w-full text-left">
            <thead className="bg-gray-50">
                <tr>
                    <th className="p-5 text-gray-500 font-semibold text-sm">Medicine Name</th>
                    <th className="p-5 text-gray-500 font-semibold text-sm">Batch #</th>
                    <th className="p-5 text-gray-500 font-semibold text-sm">Expiry Date</th>
                    <th className="p-5 text-gray-500 font-semibold text-sm">Status</th>
                    <th className="p-5 text-gray-500 font-semibold text-sm text-right">Action</th>
                </tr>
            </thead>
            <tbody>
                {inventory.map((item, index) => (
                    <tr key={item._id} className={`border-b border-gray-50 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                        <td className="p-5 font-medium text-gray-800">{item.name}</td>
                        <td className="p-5 text-gray-500 font-mono text-sm">{item.batch}</td>
                        <td className="p-5 text-gray-600">{new Date(item.expiry).toLocaleDateString()}</td>
                        <td className="p-5">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRiskStyle(item.risk)}`}>
                                {item.risk}
                            </span>
                        </td>
                        <td className="p-5 text-right">
                           {item.risk === 'CRITICAL' && (
                               <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold">Redistribute</button>
                           )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}