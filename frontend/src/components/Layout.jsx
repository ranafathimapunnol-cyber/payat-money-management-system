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
  HeartIcon,
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 pb-16 md:pb-0">
      {/* Mobile Bottom Navigation - Instagram Style */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100">
          <div className="flex justify-around items-center h-16 px-2">
            {navigation.map((item) => {
              const active = isActive(item.href);
              const Icon = active ? item.iconSolid : item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center justify-center transition-all duration-200 ${
                    active ? 'text-black' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className={`h-7 w-7 ${active ? 'text-black' : 'text-gray-500'}`} />
                  <span className={`text-[10px] mt-0.5 font-medium ${
                    active ? 'text-black' : 'text-gray-500'
                  }`}>
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
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-sm shadow-xl transform transition-transform duration-300 ${
          isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
        }`}
      >
        {/* Sidebar Header with Logo */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <HeartIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-800">PAYAT</span>
              <span className="block text-[10px] text-gray-400 font-medium tracking-wider">COMMUNITY LEDGER</span>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* User Profile Section */}
        <div className="px-4 py-6">
          <div className="relative mb-6 px-4 py-4 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 rounded-2xl border border-indigo-100/50 shadow-sm">
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
                Active
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-lg font-bold shadow-lg shadow-indigo-500/20">
                {getInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 font-medium">Welcome back</p>
                <p className="font-semibold text-gray-800 truncate">
                  {user?.member?.name || user?.name || user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email || user?.username}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              const Icon = active ? item.iconSolid : item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-indigo-600'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg mr-3 transition-all duration-200 ${
                    active ? 'bg-indigo-100' : 'bg-gray-100 group-hover:bg-indigo-50'
                  }`}>
                    <Icon className={`h-5 w-5 ${active ? 'text-indigo-600' : 'text-gray-400'}`} />
                  </div>
                  <span className={active ? 'font-semibold' : ''}>{item.name}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-8 rounded-full bg-indigo-600"></span>
                  )}
                </Link>
              );
            })}

            <div className="border-t border-gray-100 my-3"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <div className="p-1.5 rounded-lg bg-red-50 mr-3">
                <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-500" />
              </div>
              Logout
            </button>

            {/* Footer Info */}
            <div className="mt-6 px-4 py-3 bg-gray-50/80 rounded-xl border border-gray-100">
              <p className="text-[10px] text-gray-400 font-medium tracking-wider">PAYAT v1.0</p>
              <p className="text-[10px] text-gray-300">Supporting communities with zero interest</p>
            </div>
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={`transition-all duration-300 ${!isMobile ? 'lg:ml-72' : 'ml-0'}`}>
        {/* Header - Clean & Minimal */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40 border-b border-gray-100/50">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            {/* Left Side - Empty on desktop, Only Logo on mobile */}
            <div className="flex items-center gap-3">
              {isMobile && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
                    <HeartIcon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-lg font-bold text-gray-800">PAYAT</span>
                </div>
              )}
            </div>

            {/* Right Side - Only Avatar Circle */}
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 cursor-pointer">
                {getInitials()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 pb-20 md:pb-6 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;