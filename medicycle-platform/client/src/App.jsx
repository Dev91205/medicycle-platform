import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Import ALL your components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Marketplace from './components/Marketplace'; // Ensure you have this file
import AddMedicine from './components/AddMedicine';
import Requests from './components/Requests'; // ✅ Approvals Page

// Helper: Redirects logged-in users away from Login/Register
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
};

// Helper: Protects private pages from logged-out users
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
};

function AppContent() {
  const location = useLocation();
  
  // Pages where Sidebar should be HIDDEN
  const noSidebarRoutes = ['/', '/register'];
  const showSidebar = !noSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      {showSidebar && <Sidebar />}

      {/* Main Content Area */}
      <div className={`relative flex flex-col ${showSidebar ? 'flex-1 overflow-y-auto overflow-x-hidden' : 'w-full'}`}>
        <main>
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <Routes>
              {/* === PUBLIC ROUTES === */}
              <Route path="/" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />

              {/* === PRIVATE ROUTES === */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/marketplace" element={
                <PrivateRoute>
                  <Marketplace />
                </PrivateRoute>
              } />
              
              <Route path="/add-medicine" element={
                <PrivateRoute>
                  <AddMedicine />
                </PrivateRoute>
              } />

              {/* ✅ THE APPROVALS ROUTE */}
              <Route path="/requests" element={
                <PrivateRoute>
                  <Requests />
                </PrivateRoute>
              } />

            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}