import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Store, PlusCircle, LogOut, Activity } from 'lucide-react';

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

  // Only show "Add Medicine" if the user is a Pharmacy (Seller)
  if (role === 'pharmacy') {
    menuItems.push({
      name: 'Add Medicine',
      path: '/add-medicine',
      icon: <PlusCircle size={20} />
    });
  }

  return (
    <aside className="absolute left-0 top-0 z-50 flex h-screen w-72 flex-col overflow-y-hidden bg-white duration-300 ease-linear lg:static lg:translate-x-0 border-r border-gray-200">
      
      {/* Logo Section */}
      <div className="flex items-center justify-center gap-2 px-6 py-5.5 lg:py-6.5 border-b border-gray-100">
        <div className="bg-teal-50 p-2 rounded-full">
           <Activity className="text-primary" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">
          Medi<span className="text-primary">Cycle</span>
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
                        ? 'bg-teal-50 text-primary'
                        : 'text-gray-600 hover:bg-gray-50'
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

      {/* Logout Button (at bottom) */}
      <div className="mt-auto p-6 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-4 py-3 text-red-500 hover:bg-red-50 transition font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}