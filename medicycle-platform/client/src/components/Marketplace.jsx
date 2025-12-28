import React, { useState } from 'react';
import { Package } from 'lucide-react';

export default function Marketplace() {
  const [items, setItems] = useState([
    { _id: '1', name: 'Amoxicillin', quantity: 50, expiryDate: '2025-01-20', owner: { username: 'City Pharmacy' } }
  ]);
  
  const handleRequest = (id) => {
    alert("Request Sent Successfully!");
    setItems(items.filter(i => i._id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Redistribution Marketplace</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-white rounded-xl shadow p-5 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
                <Package className="text-blue-500" size={20} />
                <h2 className="text-xl font-bold">{item.name}</h2>
            </div>
            <p className="text-red-500 font-bold text-sm mb-2">Expires: {item.expiryDate}</p>
            <p className="text-gray-500 text-sm mb-4">Source: {item.owner.username}</p>
            <button onClick={() => handleRequest(item._id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition">
              Request Stock
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}