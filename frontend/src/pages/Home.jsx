
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HandRaisedIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CalendarDaysIcon,
  BellAlertIcon,
  SparklesIcon,
  HeartIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const Home = () => {
  const { user, loading } = useAuth();

  const features = [
    {
      icon: HandRaisedIcon,
      title: 'Give & Receive',
      description: 'Track every Payat transaction with dates and amounts effortlessly.',
      color: 'from-rose-500 to-pink-500',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Automatic Balance',
      description: 'See exactly who owes whom with real-time calculations.',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: DocumentTextIcon,
      title: 'Complete History',
      description: 'Every transaction is stored with date, amount, and notes.',
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: BellAlertIcon,
      title: 'Smart Reminders',
      description: 'Never forget a Payat with automatic reminders.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: CalendarDaysIcon,
      title: 'Date Tracking',
      description: 'Track when you gave and when you received.',
      color: 'from-indigo-500 to-blue-500',
    },
    {
      icon: UserGroupIcon,
      title: 'Community Management',
      description: 'Manage all your community members in one place.',
      color: 'from-teal-500 to-cyan-500',
    },
  ];

  const steps = [
    { number: '01', title: 'Add a Person', desc: 'Add community members to your network' },
    { number: '02', title: 'Record Payat', desc: 'Enter amount, date, and type' },
    { number: '03', title: 'Track Balance', desc: 'See who owes whom automatically' },
  ];

  const stats = [
    { value: '100+', label: 'Happy Users', icon: HeartIcon },
    { value: '10K+', label: 'Transactions', icon: DocumentTextIcon },
    { value: '50+', label: 'Communities', icon: UserGroupIcon },
    { value: '4.9', label: 'User Rating', icon: AcademicCapIcon },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-200 border-t-indigo-600"></div>
          <SparklesIcon className="absolute inset-0 m-auto h-5 w-5 text-indigo-600 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative text-center py-16 px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50/30 rounded-3xl border border-indigo-100/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-sm border border-indigo-100/50">
            <SparklesIcon className="h-4 w-4 text-indigo-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Community Ledger System</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Welcome to <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">PAYAT</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Track, manage, and balance your community financial contributions with simplicity and confidence.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="group px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center gap-2"
                >
                  Get Started
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-2.5 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-gray-300"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="group px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/people"
                  className="px-6 py-2.5 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-gray-300"
                >
                  View People
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 text-center border border-gray-100/80 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Icon className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* What is PAYAT */}
      <div className="text-center py-14 border-t border-gray-100 mt-6">
        <span className="inline-block px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wider uppercase mb-4">
          About PAYAT
        </span>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          What is <span className="text-indigo-600">PAYAT</span>?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          PAYAT is a digital community ledger that helps you track money given and received 
          during community events like weddings, funerals, and other gatherings.
        </p>
      </div>

      {/* Features */}
      <div className="py-12">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div className="py-12 bg-gray-50/80 backdrop-blur-sm rounded-2xl px-6 md:px-10 border border-gray-100/50">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold tracking-wider uppercase mb-3">
            Simple Process
          </span>
          <h3 className="text-2xl font-bold text-gray-900">How It Works</h3>
          <p className="text-sm text-gray-500 mt-1">Get started in 3 easy steps</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                  {step.number}
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-indigo-300 to-purple-300"></div>
                )}
              </div>
              <h4 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {step.title}
              </h4>
              <p className="text-gray-500 text-sm mt-2">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: CheckCircleIcon, label: '100% Free', color: 'emerald' },
          { icon: ShieldCheckIcon, label: 'Secure', color: 'blue' },
          { icon: ClockIcon, label: 'Real-time', color: 'purple' },
          { icon: UserGroupIcon, label: 'Community', color: 'orange' },
        ].map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div
              key={index}
              className={`bg-${benefit.color}-50/80 rounded-2xl p-5 text-center border border-${benefit.color}-200/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
            >
              <Icon className={`h-8 w-8 text-${benefit.color}-500 mx-auto mb-2`} />
              <p className="font-medium text-gray-800 text-sm">{benefit.label}</p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="relative text-center bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl py-12 px-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <h2 className="text-3xl font-bold text-white mb-3">
            Ready to Get Started?
          </h2>
          <p className="text-indigo-100 mb-6 text-lg">
            Start tracking your Payat transactions today.
          </p>
          <Link
            to={user ? '/people' : '/register'}
            className="group inline-flex items-center px-8 py-3 bg-white text-indigo-600 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40"
          >
            {user ? 'Go to People' : 'Get Started'}
            <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-sm text-gray-400 border-t border-gray-100 mt-6">
        <div className="flex items-center justify-center gap-1">
          Made with <HeartIcon className="h-4 w-4 inline text-rose-400 animate-pulse" /> by the <span className="font-medium text-gray-500">PAYAT</span> Team
        </div>
      </div>
    </div>
  );
};

export default Home;
