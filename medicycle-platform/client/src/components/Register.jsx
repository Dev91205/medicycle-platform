import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Clock, Package, User, AlertCircle } from 'lucide-react';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingDummyData, setUsingDummyData] = useState(false);

  // 👇 DUMMY DATA (Visible if database is empty)
  const dummyRequests = [
    {
      _id: 'dummy-1',
      medicine: { name: 'Amoxicillin 500mg' },
      quantity: 50,
      buyer: { username: 'City Care Clinic' },
      requestDate: new Date().toISOString(), // Today
      status: 'pending'
    },
    {
      _id: 'dummy-2',
      medicine: { name: 'Insulin Glargine (Lantus)' },
      quantity: 10,
      buyer: { username: 'Dr. Smith Pediatrics' },
      requestDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      status: 'pending'
    },
    {
      _id: 'dummy-3',
      medicine: { name: 'Azithromycin 250mg' },
      quantity: 100,
      buyer: { username: 'Green Cross Pharmacy' },
      requestDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      status: 'pending'
    }
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      
      const res = await axios.get(`${API_URL}/api/transactions/pending`, config);
      
      // 🛠️ LOGIC: If real data exists, use it. If empty, use DUMMY data.
      if (res.data && res.data.length > 0) {
        setRequests(res.data);
        setUsingDummyData(false);
      } else {
        setRequests(dummyRequests);
        setUsingDummyData(true);
      }

    } catch (err) {
      console.error("Using Dummy Data due to API Error");
      setRequests(dummyRequests);
      setUsingDummyData(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    // 🛠️ FAKE ACTION for Dummy Data
    if (id.startsWith('dummy')) {
      alert(`[DEMO MODE] Successfully ${status === 'approved' ? 'Approved' : 'Rejected'} request!`);
      // Remove item from UI instantly
      setRequests(requests.filter(req => req._id !== id));
      return;
    }

    // REAL ACTION for Real Data
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };

      await axios.put(`${API_URL}/api/transactions/${id}`, { status }, config);
      
      alert(`Request ${status === 'approved' ? 'Approved' : 'Rejected'}!`);
      setRequests(requests.filter(req => req._id !== id));
      
    } catch (err) {
      console.error(err);
      alert('Action failed. Please try again.');
    }
  };

  if (loading) return (
    <div className="p-8 flex justify-center text-teal-600">
      <span className="animate-pulse font-semibold">Loading Approvals...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pending Approvals</h2>
          {usingDummyData && (
            <p className="text-xs text-orange-500 font-medium mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> Viewing Demo Requests
            </p>
          )}
        </div>
        <span className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-sm font-semibold shadow-sm">
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
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-800">
                      {req.medicine?.name || 'Unknown Medicine'}
                    </h3>
                    <span className="text-xs font-bold bg-teal-50 text-teal-700 px-2 py-1 rounded border border-teal-100">
                      Qty: {req.quantity}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded">
                      <User size={14} className="text-gray-400" />
                      <span className="font-medium text-gray-700">
                        {req.buyer?.username || 'Unknown Clinic'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {new Date(req.requestDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                  <button 
                    onClick={() => handleAction(req._id, 'rejected')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-medium text-sm"
                  >
                    <XCircle size={16} /> Reject
                  </button>
                  
                  <button 
                    onClick={() => handleAction(req._id, 'approved')}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-bold shadow-sm text-sm"
                  >
                    <CheckCircle size={16} /> Approve
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