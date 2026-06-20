import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UsersIcon,
  UserGroupIcon,
  ChartBarIcon,
  PlusCircleIcon,
  EyeIcon,
  ArrowPathIcon,
  ClockIcon,
  SparklesIcon,
  UserPlusIcon,
  UserIcon,
  HeartIcon,
  CheckBadgeIcon,
  UserMinusIcon,
  WalletIcon,
  CalculatorIcon,
  ArchiveBoxIcon,
  CurrencyRupeeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  HomeIcon,
  BellIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import { getDashboardData } from '../services/dashboardService';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalKittuvan: 0,
    totalKodukkan: 0,
    totalPayat: 0,
    totalIppolPayattiyath: 0,
    totalBakki: 0,
    activeMembers: 0,
    totalMembers: 0,
    totalTransactions: 0,
    deceasedMembers: 0,
    closedMembers: 0,
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardData();
      
      const membersRes = await api.get('/members/members/');
      const allMembers = membersRes.data || [];
      
      const currentUserId = user?.id || user?.member?.id;
      const otherMembers = allMembers.filter(m => m.id !== currentUserId);
      
      const totalMembers = otherMembers.length;
      const deceasedMembers = otherMembers.filter(m => 
        m.status === 'deceased' || m.is_active === false
      ).length;
      const closedMembers = otherMembers.filter(m => 
        m.status === 'closed'
      ).length;
      const activeMembers = totalMembers - deceasedMembers - closedMembers;
      
      setDashboardData({
        ...data,
        totalMembers: totalMembers,
        activeMembers: activeMembers,
        deceasedMembers: deceasedMembers,
        closedMembers: closedMembers,
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed!');
  };

  const navigateToPeople = (filter) => {
    navigate('/people', { state: { filter } });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const memberStats = [
    {
      id: 'total',
      title: 'Total Members',
      value: dashboardData.totalMembers,
      icon: UsersIcon,
      bg: 'from-indigo-500 to-purple-600',
      lightBg: 'bg-indigo-50',
      text: 'text-indigo-600',
      filter: 'all',
      onClick: () => navigateToPeople('all'),
    },
    {
      id: 'active',
      title: 'Active Members',
      value: dashboardData.activeMembers,
      icon: UserGroupIcon,
      bg: 'from-emerald-500 to-teal-600',
      lightBg: 'bg-emerald-50',
      text: 'text-emerald-600',
      filter: 'active',
      onClick: () => navigateToPeople('active'),
    },
    {
      id: 'deceased',
      title: 'Deceased',
      value: dashboardData.deceasedMembers,
      icon: HeartIcon,
      bg: 'from-red-500 to-pink-600',
      lightBg: 'bg-red-50',
      text: 'text-red-600',
      filter: 'deceased',
      onClick: () => navigateToPeople('deceased'),
    },
    {
      id: 'closed',
      title: 'Closed Accounts',
      value: dashboardData.closedMembers,
      icon: ArchiveBoxIcon,
      bg: 'from-gray-500 to-gray-600',
      lightBg: 'bg-gray-50',
      text: 'text-gray-600',
      filter: 'closed',
      onClick: () => navigateToPeople('closed'),
    },
  ];

  const quickActions = [
    {
      id: 'add-person',
      title: 'Add Member',
      icon: UserPlusIcon,
      onClick: () => navigate('/person/add'),
    },
    {
      id: 'view-people',
      title: 'View All',
      icon: UserGroupIcon,
      onClick: () => navigateToPeople('all'),
    },
    {
      id: 'profile',
      title: 'My Profile',
      icon: UserIcon,
      onClick: () => navigate('/profile'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header - Logo + Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-black shadow-lg shadow-indigo-500/25">
            <ChartBarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Community & Financial Overview</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => navigateToPeople('all')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-500 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]"
          >
            <EyeIcon className="h-4 w-4" />
            View All
          </button>
        </div>
      </div>

      {/* Balance Card - Dark Color */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 p-6 text-white shadow-2xl shadow-gray-900/30">
        {/* Subtle Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gray-600 rounded-full blur-1xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gray-600 rounded-full blur-1xl"></div>
        </div>
        
        <div className="relative">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Balance</p>
              <p className="text-3xl font-bold text-black mt-1">{formatCurrency(dashboardData.totalBakki)}</p>
              <p className="text-xs text-gray-400 mt-1">Net balance across all members</p>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <WalletIcon className="h-6 w-6 text-black" />
            </div>
          </div>
          
          
        </div>
      </div>

      {/* Member Stats - Clean Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {memberStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`${stat.lightBg} rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] border border-transparent hover:border-white`}
              onClick={stat.onClick}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-xl bg-white/80 border border-gray-100`}>
                  <Icon className={`h-5 w-5 ${stat.text}`} />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-end">
                <span className="text-[10px] text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1">
                  View →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/25">
              <PlusCircleIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Quick Actions</h3>
              <p className="text-xs text-gray-400">Manage your community</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 transition-all duration-200"
              >
                <div className="p-2.5 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                  {action.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <CurrencyRupeeIcon className="h-3 w-3" />
            All amounts in INR
          </span>
          <span className="w-px h-4 bg-gray-200"></span>
          <span className="flex items-center gap-1.5">
            <ClockIcon className="h-3 w-3" />
            Updated: {lastUpdated.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;