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
  GlobeAsiaAustraliaIcon,
  UsersIcon as UsersSolidIcon,
  LightBulbIcon,
  StarIcon,
  GiftIcon,
  ArrowPathIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ChatBubbleLeftRightIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  UserGroupIcon as UserGroupSolidIcon,
  HandThumbUpIcon,
} from '@heroicons/react/24/solid';

const Home = () => {
  const { user, loading } = useAuth();

  const features = [
    {
      icon: HandRaisedIcon,
      title: 'Give Without Hesitation',
      description: 'Lend money to community members in need, knowing everything is recorded safely.',
      color: 'from-rose-500 to-pink-500',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      hover: 'hover:border-rose-300',
    },
    {
      icon: ArrowPathIcon,
      title: 'Receive When You Need',
      description: 'Get back what you gave when you need it most — no interest, no pressure.',
      color: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      hover: 'hover:border-emerald-300',
    },
    {
      icon: ScaleIcon,
      title: 'Zero Interest, Pure Trust',
      description: 'PAYAT is built on community values — help each other without financial burden.',
      color: 'from-violet-500 to-purple-500',
      bg: 'bg-violet-50',
      border: 'border-violet-100',
      hover: 'hover:border-violet-300',
    },
    {
      icon: CalendarDaysIcon,
      title: 'Track Every Transaction',
      description: 'Know exactly when you gave, who received, and when it\'s time to return the favor.',
      color: 'from-indigo-500 to-blue-500',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      hover: 'hover:border-indigo-300',
    },
    {
      icon: UsersIcon,
      title: 'Community First',
      description: 'Build stronger bonds with your community through transparent financial support.',
      color: 'from-teal-500 to-cyan-500',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
      hover: 'hover:border-teal-300',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Private',
      description: 'Your community financial data stays between you and your trusted circle.',
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      hover: 'hover:border-amber-300',
    },
  ];

  const benefits = [
    {
      icon: HeartSolidIcon,
      title: 'Interest-Free Loans',
      desc: 'Help your community without charging interest — pure support.',
      color: 'rose',
    },
    {
      icon: UserGroupSolidIcon,
      title: 'Community Support',
      desc: 'Stronger together — help each other in times of need.',
      color: 'indigo',
    },
    {
      icon: HandThumbUpIcon,
      title: 'Easy to Use',
      desc: 'Simple interface that anyone can use, regardless of tech skills.',
      color: 'emerald',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Transparent Tracking',
      desc: 'Clear records of every transaction with dates and amounts.',
      color: 'purple',
    },
  ];

  const stats = [
    { value: '₹0', label: 'Interest Charged', icon: CurrencyRupeeIcon, color: 'emerald' },
    { value: '100+', label: 'Communities', icon: UserGroupIcon, color: 'indigo' },
    { value: '10K+', label: 'Transactions Tracked', icon: DocumentTextIcon, color: 'purple' },
    { value: '4.9', label: 'Community Trust Score', icon: StarIcon, color: 'amber' },
  ];

  const storyPoints = [
    {
      icon: HeartIcon,
      title: 'For Life Events',
      desc: 'Weddings, funerals, festivals, and emergencies — always there for each other.',
    },
    {
      icon: BanknotesIcon,
      title: 'Without Interest',
      desc: 'No bank loans, no interest — just community helping community.',
    },
    {
      icon: BuildingLibraryIcon,
      title: 'Build Trust',
      desc: 'Every transaction strengthens the bond between community members.',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Clear Communication',
      desc: 'Know when to give and when to receive with complete clarity.',
    },
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
      {/* Hero Section - Emotional & Impactful */}
      <div className="relative text-center py-16 px-4 bg-gradient-to-br from-indigo-50 via-white to-purple-50/30 rounded-3xl border border-indigo-100/30 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-100/10 rounded-full blur-3xl"></div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-sm border border-indigo-100/50">
            <HeartIcon className="h-4 w-4 text-rose-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-700">Supporting Communities</span>
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
            <span className="text-sm font-medium text-gray-500">Zero Interest</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            Give When They <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-rose-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent animate-gradient">Need. Receive When You Do.</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
            PAYAT is a community financial support system where you lend money without interest, 
            track every transaction, and get back what you gave when you need it most.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="group px-8 py-3 bg-gradient-to-r from-rose-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 flex items-center gap-2"
                >
                  Join the Community
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300 border border-gray-200 hover:border-gray-300"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className="group px-8 py-3 bg-gradient-to-r from-rose-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 flex items-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
              <span className="text-gray-600">Zero Interest</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
              <span className="text-gray-600">Community Trust</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
              <span className="text-gray-600">Secure Tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Impact Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 text-center border border-gray-100/80 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className={`w-12 h-12 bg-${stat.color}-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <Icon className={`h-6 w-6 text-${stat.color}-500`} />
              </div>
              <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* The PAYAT Story - Emotional Connection */}
      <div className="py-14 mt-6 border-t border-gray-100">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold tracking-wider uppercase mb-4">
            The Story Behind PAYAT
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What Makes <span className="text-rose-500">PAYAT</span> Special?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            In every community, there are moments when someone needs a helping hand. 
            PAYAT ensures you can help without hesitation and receive support when you need it — 
            with no strings attached.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {storyPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-rose-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-rose-100 to-rose-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <Icon className="h-7 w-7 text-rose-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-rose-600 transition-colors">
                  {point.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{point.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Why PAYAT - Core Benefits */}
      <div className="py-12 bg-gradient-to-br from-rose-50/50 via-indigo-50/30 to-purple-50/50 rounded-2xl px-6 md:px-10 border border-rose-100/50">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wider uppercase mb-3">
            Why PAYAT
          </span>
          <h3 className="text-2xl font-bold text-gray-900">
            Built on <span className="text-rose-500">Trust</span> and <span className="text-indigo-500">Community</span>
          </h3>
          <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">
            Four pillars that make PAYAT the ideal solution for community financial support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="text-center group">
                <div className={`w-16 h-16 bg-${benefit.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-${benefit.color}-200/50`}>
                  <Icon className={`h-8 w-8 text-${benefit.color}-600`} />
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-1 group-hover:text-rose-600 transition-colors">
                  {benefit.title}
                </h4>
                <p className="text-gray-500 text-xs leading-relaxed">{benefit.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features - Detailed */}
      <div className="py-12">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-semibold tracking-wider uppercase mb-3">
            Features
          </span>
          <h3 className="text-2xl font-bold text-gray-900">
            Everything You Need to <span className="text-indigo-600">Manage Community</span> Finances
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`group ${feature.bg} p-6 rounded-2xl border ${feature.border} hover:${feature.hover} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
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

      {/* How It Works - Simple Steps */}
      <div className="py-12 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl px-6 md:px-10 border border-indigo-100/50">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold tracking-wider uppercase mb-3">
            Simple Process
          </span>
          <h3 className="text-2xl font-bold text-gray-900">How PAYAT Works</h3>
          <p className="text-sm text-gray-500 mt-1">Three simple steps to manage community support</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              number: '01',
              title: 'Add Community Members',
              desc: 'Add people from your community who you support or who support you.',
              icon: UserGroupIcon,
              color: 'from-rose-500 to-pink-500',
            },
            {
              number: '02',
              title: 'Record Each Transaction',
              desc: 'Log every Payat with amount, date, and notes — know who gave what.',
              icon: DocumentTextIcon,
              color: 'from-indigo-500 to-purple-500',
            },
            {
              number: '03',
              title: 'Track & Balance',
              desc: 'See real-time balances — who owes whom and when to return.',
              icon: ChartBarIcon,
              color: 'from-emerald-500 to-teal-500',
            },
          ].map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center group">
                <div className="relative">
                  <div className={`w-20 h-20 bg-gradient-to-br ${step.color} text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-indigo-300 to-purple-300"></div>
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-xs font-bold text-rose-400">{step.number}</span>
                  <h4 className="text-lg font-semibold text-gray-900 mt-1 group-hover:text-indigo-600 transition-colors">
                    {step.title}
                  </h4>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Community Values Section */}
      <div className="py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 border border-rose-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-rose-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <HeartIcon className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Give When They Need</h3>
              <p className="text-gray-600 leading-relaxed">
                Life happens — weddings, funerals, emergencies, celebrations. 
                PAYAT helps you support your community in their time of need without 
                worrying about tracking or repayment.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-indigo-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <GiftIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Receive When You Do</h3>
              <p className="text-gray-600 leading-relaxed">
                Everyone needs help sometimes. When it's your turn, PAYAT ensures 
                you receive what you gave — with zero interest and zero stress. 
                Pure community support.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA - Powerful Call to Action */}
      <div className="relative text-center bg-gradient-to-br from-rose-600 via-indigo-600 to-purple-600 rounded-2xl py-14 px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative">
          <div className="flex justify-center gap-2 mb-4">
            <HeartSolidIcon className="h-8 w-8 text-white/80 animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
            Ready to Strengthen Your Community?
          </h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Join thousands of community members who support each other through PAYAT — 
            with zero interest and complete transparency.
          </p>
          <Link
            to={user ? '/people' : '/register'}
            className="group inline-flex items-center px-10 py-4 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-gray-50 hover:shadow-2xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 text-lg"
          >
            {user ? 'Go to Your Community' : 'Join PAYAT Today'}
            <ArrowRightIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-indigo-200/80 text-sm mt-4">
            ✦ No interest. ✦ No hidden fees. ✦ Just community support.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-sm text-gray-400 border-t border-gray-100 mt-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span>Made with</span>
          <HeartIcon className="h-4 w-4 inline text-rose-400 animate-pulse" />
          <span>by the</span>
          <span className="font-medium text-gray-500">PAYAT</span>
          <span>Team</span>
          <span className="hidden sm:inline">•</span>
          <span className="text-gray-400">Supporting communities with zero interest</span>
        </div>
      </div>
    </div>
  );
};

export default Home;