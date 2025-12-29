import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, Package, User } from 'lucide-react';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👇 DYNAMIC API URL
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      
      // Fetch requests where "seller" is ME (the current logged in pharmacy)
      const res = await axios.get(`${API_URL}/api/transactions/pending`, config);
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };

      await axios.put(`${API_URL}/api/transactions/${id}`, { status }, config);
      
      alert(`Request ${status === 'approved' ? 'Approved' : 'Rejected'} Successfully!`);
      // Remove the processed request from the list locally so it disappears instantly
      setRequests(requests.filter(req => req._id !== id));
      
    } catch (err) {
      console.error(err);
      alert('Action failed. Please try again.');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading requests...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pending Approvals</h2>
        <span className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-semibold">
          {requests.length} Pending
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
          <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium text-gray-900">All Caught Up!</h3>
          <p className="text-gray-500 mt-1">You have no pending stock requests.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((req) => (
            <div key={req._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition duration-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                
                {/* Left Side: Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-800">{req.medicine?.name || 'Unknown Medicine'}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                      Qty: {req.quantity}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                    <div className="flex items-center gap-1">
                      <User size={16} />
                      Requested by: <span className="font-medium text-gray-700">{req.buyer?.username || 'Unknown User'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      Date: {new Date(req.requestDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => handleAction(req._id, 'rejected')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  
                  <button 
                    onClick={() => handleAction(req._id, 'approved')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-bold shadow-sm"
                  >
                    <CheckCircle size={18} /> Approve
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}