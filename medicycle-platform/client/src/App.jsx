import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Import your components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Marketplace from './components/Marketplace';
import AddMedicine from './components/AddMedicine';

// 1️⃣ Helper Component: Protects "Public" pages
// If user has a token, force them to Dashboard. Otherwise, show the page.
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
};

// 2️⃣ Helper Component: Protects "Private" pages (Optional but good practice)
// If user has NO token, force them to Login.
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
};

function AppContent() {
  const location = useLocation();
  const noSidebarRoutes = ['/', '/register'];
  const showSidebar = !noSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar only shows if showSidebar is true */}
      {showSidebar && <Sidebar />}

      <div className={`relative flex flex-col ${showSidebar ? 'flex-1 overflow-y-auto overflow-x-hidden' : 'w-full'}`}>
        <main>
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <Routes>
              {/* 3️⃣ PUBLIC ROUTES (Login/Register)
                  Wrapped in <PublicRoute> so logged-in users get auto-redirected 
              */}
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

              {/* 4️⃣ PRIVATE ROUTES (Dashboard/Marketplace)
                  Wrapped in <PrivateRoute> to block strangers
              */}
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