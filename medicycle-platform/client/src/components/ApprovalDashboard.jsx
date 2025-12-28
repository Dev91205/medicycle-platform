import React, { useState } from 'react';
import { Check, X } from 'lucide-react';

export default function ApprovalDashboard() {
  const [requests, setRequests] = useState([
    { _id: '101', medicineId: { name: 'Amoxicillin' }, toUser: { username: 'Clinic B' } }
  ]);

  const respond = (id, action) => {
    alert("Request " + action + "ed!");
    setRequests(requests.filter(r => r._id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Incoming Requests</h1>
      {requests.length === 0 ? <p className="text-gray-500">No pending requests.</p> : requests.map(req => (
        <div key={req._id} className="bg-white p-6 rounded shadow border flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-lg">{req.medicineId.name}</h3>
            <p className="text-sm text-gray-500">Requested by: <span className="text-blue-600">{req.toUser.username}</span></p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => respond(req._id, 'reject')} className="flex items-center gap-1 px-4 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50">
                <X size={16} /> Reject
            </button>
            <button onClick={() => respond(req._id, 'accept')} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                <Check size={16} /> Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}