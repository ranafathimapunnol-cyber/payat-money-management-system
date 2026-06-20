
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    PlusCircleIcon,
    MagnifyingGlassIcon,
    TrashIcon,
    ArrowPathIcon,
    ClockIcon,
    UserGroupIcon,
    HeartIcon,
    ArchiveBoxIcon,
    CheckBadgeIcon,
    PhoneIcon,
    EllipsisVerticalIcon,
    UserPlusIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/LoadingSpinner';

const People = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [people, setPeople] = useState([]);
    const [deletedPeople, setDeletedPeople] = useState([]);
    const [filteredPeople, setFilteredPeople] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [deletedLoading, setDeletedLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('active');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
    const [showActionMenu, setShowActionMenu] = useState(null);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchPeople();
        fetchDeletedPeople();
    }, []);

    useEffect(() => {
        filterPeople();
    }, [people, searchQuery, activeTab]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowActionMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    const getMemberStatus = (person) => {
        if (person.is_deleted) return 'deleted';
        if (person.status) return person.status;
        if (person.is_active !== undefined && person.is_active !== null) {
            return person.is_active === true ? 'active' : 'deceased';
        }
        return 'active';
    };

    const filterPeople = () => {
        let filtered = [...people];
        const peopleWithStatus = filtered.map((p) => ({
            ...p,
            _status: getMemberStatus(p),
        }));

        if (activeTab === 'all') {
            filtered = peopleWithStatus.filter((p) => p._status !== 'deleted');
        } else if (activeTab === 'active') {
            filtered = peopleWithStatus.filter((p) => p._status === 'active');
        } else if (activeTab === 'deceased') {
            filtered = peopleWithStatus.filter((p) => p._status === 'deceased');
        } else if (activeTab === 'closed') {
            filtered = peopleWithStatus.filter((p) => p._status === 'closed');
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(
                (p) =>
                    p.name?.toLowerCase().includes(query) ||
                    (p.phone && p.phone.includes(query))
            );
        }
        setFilteredPeople(filtered);
    };

    const handleStatusChange = async (personId, newStatus) => {
        try {
            await api.patch(`/members/members/${personId}/`, { status: newStatus });
            const statusLabels = { active: 'Active', deceased: 'Deceased', closed: 'Closed' };
            toast.success(`Marked as ${statusLabels[newStatus]}`);
            await fetchPeople();
            setShowActionMenu(null);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleSoftDelete = async (personId) => {
        if (!confirm('Move this person to Recently Deleted?')) return;
        try {
            await api.post(`/members/members/${personId}/soft_delete/`);
            toast.success('Moved to Recently Deleted');
            await Promise.all([fetchPeople(), fetchDeletedPeople()]);
            setShowActionMenu(null);
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

    const getFullName = (person) => {
        if (!person) return 'Unknown';
        return person.name || person.full_name || 'Unknown';
    };

    const getProfilePicUrl = (person) => {
        if (!person) return null;
        const picUrl = person.profile_pic || person.profile_pic_url;
        if (picUrl) {
            if (picUrl.startsWith('http')) return picUrl;
            return `http://localhost:8000${picUrl}`;
        }
        return null;
    };

    const getStatusBadge = (person) => {
        const status = getMemberStatus(person);
        if (status === 'deleted') return { label: 'Deleted', color: 'bg-gray-500' };
        if (status === 'deceased') return { label: 'Deceased', color: 'bg-red-500' };
        if (status === 'closed') return { label: 'Closed', color: 'bg-gray-500' };
        return { label: 'Active', color: 'bg-emerald-500' };
    };

    const getStatusColor = (person) => {
        const status = getMemberStatus(person);
        if (status === 'deleted') return 'text-gray-500 bg-gray-50 border-gray-200';
        if (status === 'deceased') return 'text-red-600 bg-red-50 border-red-200';
        if (status === 'closed') return 'text-gray-600 bg-gray-50 border-gray-200';
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    };

    const getInitialsColor = (name) => {
        const colors = [
            'from-indigo-500 to-purple-600',
            'from-rose-500 to-pink-600',
            'from-emerald-500 to-teal-600',
            'from-amber-500 to-orange-600',
            'from-cyan-500 to-blue-600',
            'from-violet-500 to-purple-600',
            'from-fuchsia-500 to-pink-600',
            'from-sky-500 to-blue-600',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    if (loading) return <LoadingSpinner />;

    const activeCount = people.filter((p) => getMemberStatus(p) === 'active').length;
    const deceasedCount = people.filter((p) => getMemberStatus(p) === 'deceased').length;
    const closedCount = people.filter((p) => getMemberStatus(p) === 'closed').length;
    const deletedCount = deletedPeople.length;

    const tabs = [
        { id: 'all', label: 'All', icon: UserGroupIcon, count: people.filter((p) => getMemberStatus(p) !== 'deleted').length, color: 'indigo' },
        { id: 'active', label: 'Active', icon: CheckBadgeIcon, count: activeCount, color: 'emerald' },
        { id: 'deceased', label: 'Deceased', icon: HeartIcon, count: deceasedCount, color: 'red' },
        { id: 'closed', label: 'Closed', icon: ArchiveBoxIcon, count: closedCount, color: 'gray' },
    ];

    // ✅ FIXED: Mobile Row - Dropdown appears ABOVE the card
    const renderMobileRow = (person) => {
        const profilePic = getProfilePicUrl(person);
        const status = getStatusBadge(person);
        const statusColor = getStatusColor(person);
        const fullName = getFullName(person);
        const initialsColor = getInitialsColor(fullName);
        const isActionOpen = showActionMenu === person.id;

        return (
            <div
                key={person.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-visible border border-gray-100 hover:border-indigo-200 relative"
            >
                <div className="flex items-center px-3 py-2 gap-2">
                    {/* Profile Picture */}
                    <Link to={`/profile/${person.id}`} className="flex-shrink-0">
                        <div className="relative">
                            {profilePic ? (
                                <div className="w-10 h-10 rounded-full ring-2 ring-gray-200 overflow-hidden">
                                    <img
                                        src={profilePic}
                                        alt={fullName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            ) : (
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br ${initialsColor} ring-2 ring-gray-200`}
                                >
                                    {getInitials(fullName)}
                                </div>
                            )}
                            <div
                                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${status.color} ring-2 ring-white shadow-sm`}
                            ></div>
                        </div>
                    </Link>

                    {/* Name */}
                    <Link to={`/profile/${person.id}`} className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                            {fullName}
                        </h3>
                    </Link>

                    {/* Status Badge with Dropdown - Opens BELOW */}
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowActionMenu(isActionOpen ? null : person.id);
                            }}
                            className={`text-[10px] px-2 py-0.5 rounded-full border ${statusColor} font-medium whitespace-nowrap flex items-center gap-0.5 hover:opacity-80 transition-opacity`}
                        >
                            {status.label}
                            <ChevronDownIcon className="h-3 w-3" />
                        </button>

                        {isActionOpen && (
                            <div
                                ref={menuRef}
                                className="absolute right-0 z-[9999] w-44 bg-white rounded-xl shadow-2xl border border-gray-100 py-1"
                                style={{
                                    top: 'calc(100% + 8px)',
                                    bottom: 'auto',
                                }}
                            >
                                {getMemberStatus(person) !== 'active' && (
                                    <button
                                        onClick={() => {
                                            setShowActionMenu(null);
                                            handleStatusChange(person.id, 'active');
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 text-xs text-emerald-600 hover:bg-emerald-50 transition-colors w-full"
                                    >
                                        <CheckBadgeIcon className="h-4 w-4" /> Set Active
                                    </button>
                                )}
                                {getMemberStatus(person) !== 'deceased' && (
                                    <button
                                        onClick={() => {
                                            setShowActionMenu(null);
                                            handleStatusChange(person.id, 'deceased');
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors w-full"
                                    >
                                        <HeartIcon className="h-4 w-4" /> Set Deceased
                                    </button>
                                )}
                                {getMemberStatus(person) !== 'closed' && (
                                    <button
                                        onClick={() => {
                                            setShowActionMenu(null);
                                            handleStatusChange(person.id, 'closed');
                                        }}
                                        className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors w-full"
                                    >
                                        <ArchiveBoxIcon className="h-4 w-4" /> Set Closed
                                    </button>
                                )}
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                    onClick={() => {
                                        setShowActionMenu(null);
                                        handleSoftDelete(person.id);
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors w-full"
                                >
                                    <TrashIcon className="h-4 w-4" /> Move to Deleted
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // Desktop Grid View
    const renderDesktopCard = (person) => {
        const profilePic = getProfilePicUrl(person);
        const status = getStatusBadge(person);
        const statusColor = getStatusColor(person);
        const fullName = getFullName(person);
        const initialsColor = getInitialsColor(fullName);
        const isActionOpen = showActionMenu === person.id;

        return (
            <div
                key={person.id}
                className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200 hover:-translate-y-1 relative`}
            >
                <Link to={`/profile/${person.id}`} className="block p-4">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative">
                            {profilePic ? (
                                <div className="w-20 h-20 rounded-full ring-2 ring-gray-200 overflow-hidden">
                                    <img
                                        src={profilePic}
                                        alt={fullName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                </div>
                            ) : (
                                <div
                                    className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br ${initialsColor} ring-2 ring-gray-200`}
                                >
                                    {getInitials(fullName)}
                                </div>
                            )}
                            <div
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${status.color} ring-2 ring-white shadow-sm`}
                            ></div>
                        </div>

                        <h3 className="text-sm font-bold text-gray-900 mt-3 group-hover:text-indigo-600 transition-colors truncate w-full max-w-[120px]">
                            {fullName}
                        </h3>

                        <span
                            className={`text-xs px-3 py-1 rounded-full mt-2 border ${statusColor} font-medium inline-flex items-center gap-1`}
                        >
                            {status.label}
                        </span>

                        {person.phone && (
                            <p className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-1">
                                <PhoneIcon className="h-3 w-3" /> {person.phone}
                            </p>
                        )}
                    </div>
                </Link>

                <div className="absolute top-2 right-2">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setShowActionMenu(isActionOpen ? null : person.id);
                        }}
                        className={`p-1.5 rounded-full transition-all duration-200 ${
                            isActionOpen
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-indigo-100 hover:text-indigo-600'
                        } shadow-lg`}
                    >
                        <EllipsisVerticalIcon className="h-4 w-4" />
                    </button>

                    {isActionOpen && (
                        <div
                            ref={menuRef}
                            className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-50"
                        >
                            {getMemberStatus(person) !== 'active' && (
                                <button
                                    onClick={() => {
                                        setShowActionMenu(null);
                                        handleStatusChange(person.id, 'active');
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 transition-colors w-full"
                                >
                                    <CheckBadgeIcon className="h-4 w-4" /> Set Active
                                </button>
                            )}
                            {getMemberStatus(person) !== 'deceased' && (
                                <button
                                    onClick={() => {
                                        setShowActionMenu(null);
                                        handleStatusChange(person.id, 'deceased');
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                                >
                                    <HeartIcon className="h-4 w-4" /> Set Deceased
                                </button>
                            )}
                            {getMemberStatus(person) !== 'closed' && (
                                <button
                                    onClick={() => {
                                        setShowActionMenu(null);
                                        handleStatusChange(person.id, 'closed');
                                    }}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors w-full"
                                >
                                    <ArchiveBoxIcon className="h-4 w-4" /> Set Closed
                                </button>
                            )}
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                                onClick={() => {
                                    setShowActionMenu(null);
                                    handleSoftDelete(person.id);
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                            >
                                <TrashIcon className="h-4 w-4" /> Move to Deleted
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="pb-4 max-w-7xl mx-auto px-2 sm:px-4">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <UserGroupIcon className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-500" />
                            Community Members
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {people.filter((p) => getMemberStatus(p) !== 'deleted').length} total members
                        </p>
                    </div>
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                            onClick={() => setActiveTab(activeTab === 'deleted' ? 'active' : 'deleted')}
                            className={`px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                                activeTab === 'deleted'
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                            }`}
                        >
                            <ClockIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline font-semibold">Recently Deleted</span>
                            <span className="xs:hidden font-semibold">Deleted</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                                activeTab === 'deleted' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                            }`}>
                                {deletedCount}
                            </span>
                        </button>
                        <Link
                            to="/person/add"
                            className="bg-indigo-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-indigo-700 transition-all duration-200 flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30"
                        >
                            <UserPlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden xs:inline font-semibold">Add Member</span>
                            <span className="xs:hidden font-semibold">Add</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recently Deleted View */}
            {activeTab === 'deleted' ? (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-4 sm:p-6 bg-gradient-to-r from-red-50 to-red-100/50 border-b border-red-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-red-700 flex items-center gap-3">
                                    <TrashIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                    Recently Deleted
                                    <span className="text-sm font-normal text-red-500">({deletedPeople.length} items)</span>
                                </h3>
                                <p className="text-xs text-red-400 mt-0.5">Items stay here for 30 days before permanent deletion</p>
                            </div>
                            <button
                                onClick={() => setActiveTab('active')}
                                className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1 bg-white/80 px-3 py-1.5 rounded-lg"
                            >
                                <XMarkIcon className="h-4 w-4" /> Close
                            </button>
                        </div>
                    </div>

                    {deletedLoading ? (
                        <div className="p-12 text-center"><LoadingSpinner /></div>
                    ) : deletedPeople.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <TrashIcon className="h-10 w-10 text-gray-300" />
                            </div>
                            <p className="font-medium text-lg">No recently deleted items</p>
                            <button
                                onClick={() => setActiveTab('active')}
                                className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium inline-flex items-center gap-1"
                            >
                                ← Back to Members
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {deletedPeople.map((person) => {
                                const fullName = getFullName(person);
                                const profilePic = getProfilePicUrl(person);
                                return (
                                    <div key={person.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            {profilePic ? (
                                                <img src={profilePic} alt={fullName} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" onError={(e) => { e.target.style.display = 'none'; }} />
                                            ) : (
                                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getInitialsColor(fullName)} flex items-center justify-center text-white font-bold text-base`}>
                                                    {getInitials(fullName)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-900">{fullName}</p>
                                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                                    <ClockIcon className="h-3 w-3" />
                                                    Deleted: {person.deleted_at ? new Date(person.deleted_at).toLocaleDateString() : 'Unknown'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleRestore(person.id)}
                                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-emerald-600/20"
                                            >
                                                <ArrowPathIcon className="h-4 w-4" /> Restore
                                            </button>
                                            <button
                                                onClick={() => handlePermanentDelete(person.id)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-red-600/20"
                                            >
                                                <TrashIcon className="h-4 w-4" /> Delete Forever
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* Tabs */}
                    <div className="flex gap-1 sm:gap-2 mb-4 bg-white p-1 rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const colorClasses = {
                                indigo: isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'hover:bg-indigo-50 text-gray-700 hover:text-indigo-600',
                                emerald: isActive ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'hover:bg-emerald-50 text-gray-700 hover:text-emerald-600',
                                red: isActive ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'hover:bg-red-50 text-gray-700 hover:text-red-600',
                                gray: isActive ? 'bg-gray-700 text-white shadow-lg shadow-gray-200' : 'hover:bg-gray-50 text-gray-700 hover:text-gray-900',
                            };
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap ${
                                        isActive ? `${colorClasses[tab.color]}` : `bg-transparent ${colorClasses[tab.color]}`
                                    }`}
                                >
                                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                                    <span className={isActive ? 'text-white' : 'text-gray-700'}>{tab.label}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                        isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Search Bar */}
                    <div className="bg-white rounded-xl shadow-sm p-2 sm:p-3 mb-4 border border-gray-200">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-indigo-400" />
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-gray-800 placeholder-gray-400 transition-all"
                            />
                        </div>
                    </div>

                    {/* Members Display */}
                    {filteredPeople.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <UserGroupIcon className="h-10 w-10 text-indigo-400" />
                            </div>
                            <p className="text-gray-500 font-medium text-lg">No {activeTab} members found</p>
                            {searchQuery && <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>}
                        </div>
                    ) : (
                        <div className={isMobile ? 'space-y-2' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4'}>
                            {filteredPeople.map((person) =>
                                isMobile ? renderMobileRow(person) : renderDesktopCard(person)
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default People;
