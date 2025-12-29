import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, PlusCircle, LogOut, Activity, ClipboardCheck } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole'); // 'pharmacy' or 'individual'

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

  // 👇 ADDED BACK: Only Pharmacies need to see "Approvals" (Requests) and "Add Medicine"
  if (role === 'pharmacy') {
    menuItems.push({
      name: 'Approvals', // Restored Feature
      path: '/requests', // Check if this matches your Route path
      icon: <ClipboardCheck size={20} />
    });

    menuItems.push({
      name: 'Add Medicine',
      path: '/add-medicine',
      icon: <PlusCircle size={20} />
    });
  }

  return (
    // 👇 REVERTED TO DARK THEME (bg-slate-900)
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
                        ? 'bg-slate-800 text-teal-400 border-r-4 border-teal-400' // Active: Darker bg + Teal Text
                        : 'text-gray-400 hover:bg-slate-800 hover:text-white'     // Inactive: Gray Text
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

      {/* Logout Button */}
      <div className="mt-auto p-6 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-4 py-3 text-red-400 hover:bg-slate-800 hover:text-red-300 transition font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}