
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
} from '@heroicons/react/24/outline';
import { getDashboardData } from '../services/dashboardService';
import api from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const navigate = useNavigate();
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
      // Get financial data
      const data = await getDashboardData();
      
      // Get all members to count by status
      const membersRes = await api.get('/members/members/');
      const allMembers = membersRes.data || [];
      
      // Count by status
      const deceasedCount = allMembers.filter(m => m.status === 'deceased').length;
      const closedCount = allMembers.filter(m => m.status === 'closed').length;
      
      setDashboardData({
        ...data,
        deceasedMembers: deceasedCount,
        closedMembers: closedCount,
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

  // Engagement rate
  const engagementRate = dashboardData.totalMembers > 0 
    ? Math.round((dashboardData.activeMembers / dashboardData.totalMembers) * 100) 
    : 0;

  // Financial Summary Cards
  const financialCards = [
    {
      id: 'balance',
      title: 'Total Balance',
      value: formatCurrency(dashboardData.totalBakki),
      icon: WalletIcon,
      color: 'from-indigo-500 to-purple-500',
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-600',
      description: 'Net balance across all members',
    },
    {
      id: 'kodukkan',
      title: 'Kodukkan',
      value: formatCurrency(dashboardData.totalKodukkan),
      icon: CalculatorIcon,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-600',
      description: 'Total amount to be paid',
    },
  ];

  // Member stats with real counts
  const memberStats = [
    {
      id: 'total',
      title: 'Total Members',
      value: dashboardData.totalMembers,
      icon: UsersIcon,
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      text: 'text-indigo-600',
    },
    {
      id: 'active',
      title: 'Active Members',
      value: dashboardData.activeMembers,
      icon: UserGroupIcon,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-600',
    },
    {
      id: 'deceased',
      title: 'Deceased',
      value: dashboardData.deceasedMembers,
      icon: HeartIcon,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600',
    },
    {
      id: 'closed',
      title: 'Closed',
      value: dashboardData.closedMembers,
      icon: ArchiveBoxIcon,
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-600',
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
      onClick: () => navigate('/people'),
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ChartBarIcon className="h-7 w-7 text-indigo-500" />
            Dashboard
            <span className="text-sm font-normal text-gray-400 flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4" />
              {lastUpdated.toLocaleTimeString()}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Community & Financial Overview</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-all duration-200 border border-gray-200 shadow-sm disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={() => navigate('/people')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30"
          >
            <EyeIcon className="h-4 w-4" />
            View People
          </button>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-900 p-6 text-white shadow-xl shadow-purple-500/20">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <SparklesIcon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Welcome to PAYAT</h2>
              <p className="text-indigo-100 text-sm">Community & Financial Overview</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-indigo-200">Total Balance</p>
              <p className="text-xl font-bold">{formatCurrency(dashboardData.totalBakki)}</p>
            </div>
            <div className="w-px h-10 bg-white/30"></div>
            <div className="text-right">
              <p className="text-xs text-indigo-200">Members</p>
              <p className="text-xl font-bold">{dashboardData.totalMembers}</p>
            </div>
            <div className="w-px h-10 bg-white/30"></div>
            <div className="text-right">
              <p className="text-xs text-indigo-200">Active</p>
              <p className="text-xl font-bold">{dashboardData.activeMembers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary - 2 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {financialCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className={`${card.bg} border ${card.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{card.description}</p>
                </div>
                <div className={`p-2.5 rounded-xl bg-white/80 border ${card.border}`}>
                  <Icon className={`h-5 w-5 ${card.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Stats - 4 Cards (Total, Active, Deceased, Closed) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {memberStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`${stat.bg} border ${stat.border} rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer`}
              onClick={() => {
                if (stat.id === 'total' || stat.id === 'active') {
                  navigate('/people');
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-xl bg-white/80 border ${stat.border}`}>
                  <Icon className={`h-4 w-4 ${stat.text}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <PlusCircleIcon className="h-4 w-4 text-indigo-500" />
            Quick Actions
          </h3>
          <span className="text-xs text-gray-400">Manage your community</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
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
      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-4">
        <span>All amounts in ₹ (Indian Rupees)</span>
        <span>Updated: {lastUpdated.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default Dashboard;
