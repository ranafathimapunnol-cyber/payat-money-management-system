import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from '@heroicons/react/24/solid';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon, iconSolid: HomeIconSolid },
    { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon, iconSolid: ChartBarIconSolid },
    { name: 'People', href: '/people', icon: UserGroupIcon, iconSolid: UserGroupIconSolid },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon, iconSolid: UserCircleIconSolid },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = () => {
    const name = user?.member?.name || user?.name || user?.username || 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex justify-around items-center h-16">
            {navigation.map((item) => {
              const active = isActive(item.href);
              const Icon = active ? item.iconSolid : item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center justify-center px-3 py-1 transition-colors duration-200 ${
                    active ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className={`text-[10px] mt-0.5 ${active ? 'font-semibold' : ''}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ${
          isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600">PAYAT</span>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        <div className="px-4 py-6">
          <div className="mb-6 px-3 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
            <p className="text-xs text-gray-500">Welcome back,</p>
            <p className="font-semibold text-gray-900 truncate">
              {user?.member?.name || user?.name || user?.username || 'User'}
            </p>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${active ? 'text-indigo-600' : ''}`} />
                  {item.name}
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition-colors duration-200 mt-2"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={`transition-all duration-300 ${!isMobile ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-3">
              {/* ✅ REMOVED: Hamburger menu button */}
              {isMobile && (
                <span className="text-lg font-bold text-indigo-600">PAYAT</span>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 hidden sm:block">
                {user?.email || user?.username}
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-semibold shadow-md">
                {getInitials()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
