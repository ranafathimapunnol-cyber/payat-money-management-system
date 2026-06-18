import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    PlusCircleIcon,
    MagnifyingGlassIcon,
    UserCircleIcon,
    TrashIcon,
    ArrowPathIcon,
    ClockIcon,
    UserGroupIcon,
    HeartIcon,
    ArchiveBoxIcon,
    SparklesIcon,
    CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const People = () => {
    const { user } = useAuth();
    const [people, setPeople] = useState([]);
    const [deletedPeople, setDeletedPeople] = useState([]);
    const [filteredPeople, setFilteredPeople] = useState([]);
    const [showDeleted, setShowDeleted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [deletedLoading, setDeletedLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('active');

    useEffect(() => {
        fetchPeople();
        fetchDeletedPeople();
    }, []);

    useEffect(() => {
        filterPeople();
    }, [people, searchQuery, activeTab]);

    const fetchPeople = async () => {
        try {
            setLoading(true);
            const response = await api.get('/members/members/');
            const currentUserId = user?.id || user?.member?.id;
            const otherMembers = response.data.filter((m) => {
                if (currentUserId) return m.id !== currentUserId;
                if (user?.member?.id) return m.id !== user.member.id;
                return true;
            });
            setPeople(otherMembers);
            setFilteredPeople(otherMembers);
        } catch (error) {
            console.error('Error fetching people:', error);
            toast.error('Failed to load people');
        } finally {
            setLoading(false);
        }
    };

    const fetchDeletedPeople = async () => {
        try {
            setDeletedLoading(true);
            const response = await api.get('/members/members/deleted/');
            setDeletedPeople(response.data);
        } catch (error) {
            setDeletedPeople([]);
        } finally {
            setDeletedLoading(false);
        }
    };

    const filterPeople = () => {
        let filtered = [...people];
        
        if (activeTab === 'active') {
            filtered = filtered.filter(p => p.status === 'active' || p.is_active === true);
        } else if (activeTab === 'deceased') {
            filtered = filtered.filter(p => p.status === 'deceased' || p.is_active === false);
        } else if (activeTab === 'closed') {
            filtered = filtered.filter(p => p.status === 'closed');
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter((p) => 
                p.name.toLowerCase().includes(query) || 
                (p.phone && p.phone.includes(query))
            );
        }
        setFilteredPeople(filtered);
    };

    const handleSoftDelete = async (personId) => {
        if (!confirm('Move this person to Recently Deleted?')) return;
        try {
            await api.post(`/members/members/${personId}/soft_delete/`);
            toast.success('Moved to Recently Deleted');
            await Promise.all([fetchPeople(), fetchDeletedPeople()]);
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const handleRestore = async (personId) => {
        try {
            await api.post(`/members/members/${personId}/restore/`);
            toast.success('Restored successfully!');
            await Promise.all([fetchPeople(), fetchDeletedPeople()]);
        } catch (error) {
            toast.error('Failed to restore');
        }
    };

    const handlePermanentDelete = async (personId) => {
        if (!confirm('⚠️ Permanently delete this person? This cannot be undone!')) return;
        try {
            await api.delete(`/members/members/${personId}/permanent_delete/`);
            toast.success('Permanently deleted');
            await fetchDeletedPeople();
        } catch (error) {
            toast.error('Failed to permanently delete');
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getStatusBadge = (person) => {
        if (person.is_deleted) return { label: 'Deleted', color: 'bg-gray-400' };
        if (person.status === 'deceased' || person.is_active === false) return { label: 'Deceased', color: 'bg-red-500' };
        if (person.status === 'closed') return { label: 'Closed', color: 'bg-gray-500' };
        return { label: 'Active', color: 'bg-emerald-500' };
    };

    const getStatusColor = (person) => {
        if (person.is_deleted) return 'text-gray-500 bg-gray-50 border-gray-200';
        if (person.status === 'deceased' || person.is_active === false) return 'text-red-600 bg-red-50 border-red-200';
        if (person.status === 'closed') return 'text-gray-600 bg-gray-50 border-gray-200';
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    };

    if (loading) return <LoadingSpinner />;

    const activeCount = people.filter(p => p.status === 'active' || p.is_active === true).length;
    const deceasedCount = people.filter(p => p.status === 'deceased' || p.is_active === false).length;
    const closedCount = people.filter(p => p.status === 'closed').length;

    const tabs = [
        { id: 'active', label: 'Active', icon: CheckBadgeIcon, count: activeCount, color: 'emerald' },
        { id: 'deceased', label: 'Deceased', icon: HeartIcon, count: deceasedCount, color: 'red' },
        { id: 'closed', label: 'Closed', icon: ArchiveBoxIcon, count: closedCount, color: 'gray' },
    ];

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <UserGroupIcon className="h-7 w-7 text-indigo-500" />
                            Community
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {people.length} members in your community
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setShowDeleted(!showDeleted)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                                showDeleted 
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }`}
                        >
                            <ClockIcon className="h-4 w-4" />
                            {showDeleted ? 'View Members' : `Deleted (${deletedPeople.length})`}
                        </button>
                        <Link
                            to="/person/add"
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30"
                        >
                            <PlusCircleIcon className="h-4 w-4" /> Add Member
                        </Link>
                    </div>
                </div>
            </div>

            {!showDeleted ? (
                <>
                    {/* Tabs */}
                    <div className="flex gap-1 mb-4 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const colorClasses = {
                                emerald: isActive ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-emerald-50 text-gray-600',
                                red: isActive ? 'bg-red-100 text-red-700' : 'hover:bg-red-50 text-gray-600',
                                gray: isActive ? 'bg-gray-200 text-gray-700' : 'hover:bg-gray-100 text-gray-600',
                            };
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive ? `${colorClasses[tab.color]} shadow-sm` : `text-gray-600 ${colorClasses[tab.color]}`
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                        isActive ? 'bg-white/50 text-gray-700' : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-xl shadow-sm p-3 mb-4 border border-gray-100">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all"
                            />
                        </div>
                    </div>

                    {/* Members Grid */}
                    {filteredPeople.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <UserGroupIcon className="h-10 w-10 text-indigo-400" />
                            </div>
                            <p className="text-gray-500 font-medium">No {activeTab} members found</p>
                            {searchQuery && <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>}
                            {!searchQuery && activeTab === 'active' && (
                                <Link to="/person/add" className="text-indigo-600 font-medium hover:text-indigo-700 mt-3 inline-flex items-center gap-1">
                                    Add your first member <ArrowPathIcon className="h-4 w-4" />
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredPeople.map((person) => {
                                const profilePic = person.profile_pic_url
                                    ? `http://localhost:8000${person.profile_pic_url}`
                                    : null;
                                const status = getStatusBadge(person);
                                const statusColor = getStatusColor(person);

                                return (
                                    <div
                                        key={person.id}
                                        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200 hover:-translate-y-1"
                                    >
                                        <Link to={`/profile/${person.id}`} className="block p-5">
                                            <div className="flex flex-col items-center text-center">
                                                {/* Profile Picture */}
                                                <div className="relative">
                                                    {profilePic ? (
                                                        <div className="w-20 h-20 rounded-full ring-2 ring-gray-200 group-hover:ring-indigo-400 transition-all duration-300 overflow-hidden">
                                                            <img
                                                                src={profilePic}
                                                                alt={person.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                                                            person.status === 'deceased' || person.is_active === false 
                                                                ? 'bg-gradient-to-br from-gray-400 to-gray-500' 
                                                                : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                                        } ring-2 ring-gray-200 group-hover:ring-indigo-400 transition-all duration-300`}>
                                                            {getInitials(person.name)}
                                                        </div>
                                                    )}
                                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${status.color} ring-2 ring-white`}></div>
                                                </div>

                                                {/* Name */}
                                                <h3 className="text-sm font-semibold text-gray-900 mt-3 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                                    {person.name}
                                                </h3>
                                                
                                                {/* Status Badge */}
                                                <span className={`text-xs px-3 py-1 rounded-full mt-2 border ${statusColor} font-medium`}>
                                                    {status.label}
                                                </span>

                                                {/* Phone */}
                                                {person.phone && (
                                                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                                        📞 {person.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Delete Button - Appears on Hover */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleSoftDelete(person.id);
                                            }}
                                            className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur-sm text-red-500 rounded-full hover:bg-red-600 hover:text-white shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                            title="Move to Recently Deleted"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            ) : (
                // Recently Deleted
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-5 bg-gradient-to-r from-red-50 to-red-100/50 border-b border-red-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                                    <TrashIcon className="h-5 w-5" />
                                    Recently Deleted
                                    <span className="text-sm font-normal text-red-500 ml-2">
                                        ({deletedPeople.length} items)
                                    </span>
                                </h3>
                                <p className="text-xs text-red-400 mt-0.5">Items stay here until permanently deleted</p>
                            </div>
                            {deletedPeople.length > 0 && (
                                <button
                                    onClick={() => setShowDeleted(false)}
                                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    ✕ Close
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {deletedLoading ? (
                        <div className="p-12 text-center">
                            <LoadingSpinner />
                        </div>
                    ) : deletedPeople.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <TrashIcon className="h-10 w-10 text-gray-300" />
                            </div>
                            <p className="font-medium">No recently deleted items</p>
                            <button
                                onClick={() => setShowDeleted(false)}
                                className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium inline-flex items-center gap-1"
                            >
                                ← Back to Members
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {deletedPeople.map((person) => {
                                const profilePic = person.profile_pic_url
                                    ? `http://localhost:8000${person.profile_pic_url}`
                                    : null;

                                return (
                                    <div key={person.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            {profilePic ? (
                                                <img
                                                    src={profilePic}
                                                    alt={person.name}
                                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-bold text-sm">
                                                    {getInitials(person.name)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{person.name}</p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <ClockIcon className="h-3 w-3" />
                                                    Deleted: {person.deleted_at ? new Date(person.deleted_at).toLocaleDateString() : 'Unknown'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleRestore(person.id)}
                                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-all duration-200 flex items-center gap-1 shadow-sm hover:shadow-emerald-600/20"
                                            >
                                                <ArrowPathIcon className="h-3.5 w-3.5" /> Restore
                                            </button>
                                            <button
                                                onClick={() => handlePermanentDelete(person.id)}
                                                className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-all duration-200 flex items-center gap-1 shadow-sm hover:shadow-red-600/20"
                                            >
                                                <TrashIcon className="h-3.5 w-3.5" /> Delete Forever
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default People;
