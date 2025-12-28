import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, CheckSquare, LogOut, Activity } from 'lucide-react';

// Import Components
import Dashboard from './components/Dashboard';
import Marketplace from './components/Marketplace';
import ApprovalDashboard from './components/ApprovalDashboard';
import Login from './components/Login';
import Register from './components/Register';

// --- SIDEBAR COMPONENT ---
const Sidebar = () => {
  const location = useLocation();
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('userRole'); // Check for Admin

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.clear(); // Clear all data
    window.location.href = '/'; // Hard refresh to login
  };

  return (
    <aside className="w-64 bg-primary text-white flex flex-col shadow-2xl z-20 h-screen fixed top-0 left-0">
      {/* Header / Logo */}
      <div className="p-6 border-b border-teal-800 flex items-center gap-3">
        <div className="bg-white p-2 rounded-lg">
          <Activity className="text-primary" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">MediCycle</h1>
          <p className="text-teal-200 text-xs">Inventory Intelligence</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        <Link to="/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/dashboard') ? 'bg-white/10 text-white shadow-sm' : 'text-teal-100 hover:bg-white/5'}`}>
          <LayoutDashboard size={20} /> <span>Dashboard</span>
        </Link>
        
        <Link to="/marketplace" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/marketplace') ? 'bg-white/10 text-white shadow-sm' : 'text-teal-100 hover:bg-white/5'}`}>
          <ShoppingBag size={20} /> <span>Marketplace</span>
        </Link>
        
        <Link to="/approvals" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive('/approvals') ? 'bg-white/10 text-white shadow-sm' : 'text-teal-100 hover:bg-white/5'}`}>
          <CheckSquare size={20} /> <span>Approvals</span>
        </Link>

        {/* ADMIN ONLY SECTION */}
        {userRole === 'admin' && (
          <div className="mt-6 border-t border-teal-800 pt-4">
            <p className="px-4 text-xs font-bold text-teal-300 uppercase tracking-wider mb-2">Admin Controls</p>
            <button onClick={() => alert("Admin Analytics Feature Coming Soon!")} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-teal-100 hover:bg-red-500/20 hover:text-white transition">
               <Activity size={20} /> <span>System Analytics</span>
            </button>
          </div>
        )}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-teal-800">
        <div className="mb-4 px-2 text-sm text-teal-200">
            Logged in as: <br/>
            <strong className="text-white capitalize">{userName}</strong>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-teal-100 hover:text-white hover:bg-white/5 rounded-lg transition">
          <LogOut size={20} /> <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

// --- PROTECTED ROUTE WRAPPER ---
// If no token exists, force them back to the Login page
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" />; 
  return <div className="ml-64 bg-slate-50 min-h-screen">{children}</div>;
};

// --- MAIN APP COMPONENT ---
export default function App() {
  // Check token to decide if we show Sidebar
  const token = localStorage.getItem('token');

  return (
    <Router>
      <div className="font-sans text-slate-900 bg-slate-50 min-h-screen">
        
        {/* Render Sidebar ONLY if logged in */}
        {token && <Sidebar />}

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (Require Login) */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
          <Route path="/approvals" element={<ProtectedRoute><ApprovalDashboard /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}