import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, PlusCircle, LogOut, Activity, ClipboardCheck, UserCircle } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  
  // 1. Get User Details from Local Storage
  const rawRole = localStorage.getItem('userRole');
  const role = rawRole ? rawRole.toLowerCase() : ''; 
  const username = localStorage.getItem('userName') || 'User'; // Fallback if missing

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard size={20} />
    },
    {
      name: 'Marketplace',
      path: '/marketplace',
      icon: <Store size={20} />
    }
  ];

  if (role === 'pharmacy') {
    menuItems.push({
      name: 'Approvals',
      path: '/requests',
      icon: <ClipboardCheck size={20} />
    });

    menuItems.push({
      name: 'Add Medicine',
      path: '/add-medicine',
      icon: <PlusCircle size={20} />
    });
  }

  return (
    <aside className="absolute left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden bg-slate-900 duration-300 ease-linear lg:static lg:translate-x-0 border-r border-slate-800">
      
      {/* Logo Section */}
      <div className="flex items-center justify-center gap-2 px-6 py-5.5 lg:py-6.5 border-b border-slate-800">
        <div className="bg-teal-900/30 p-2 rounded-full">
           <Activity className="text-teal-400" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-white">
          Medi<span className="text-teal-400">Cycle</span>
        </h1>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 px-4 lg:mt-9 lg:px-6">
          <ul className="mb-6 flex flex-col gap-1.5">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-2.5 rounded-lg px-4 py-3 font-medium duration-300 ease-in-out ${
                      isActive
                        ? 'bg-slate-800 text-teal-400 border-r-4 border-teal-400' 
                        : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* 👇 NEW: User Profile & Logout Section */}
      <div className="mt-auto border-t border-slate-800">
        
        {/* Profile Info */}
        <div className="px-6 py-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-teal-400">
            <UserCircle size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white truncate max-w-[140px]">
              {username}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {role || 'Member'} Account
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <div className="px-4 pb-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-slate-800 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition font-medium border border-slate-700"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

    </aside>
  );
}