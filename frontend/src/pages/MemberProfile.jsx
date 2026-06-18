
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    PlusCircleIcon,
    XMarkIcon,
    CameraIcon,
    CalendarIcon,
    CheckIcon,
    PhoneIcon,
    EnvelopeIcon,
    HomeIcon,
    SparklesIcon,
    UserIcon,
    MapPinIcon,
    AtSymbolIcon,
    DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const MemberProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [member, setMember] = useState(null);
    const [transaction, setTransaction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [transactions, setTransactions] = useState([]);

    const [profileForm, setProfileForm] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
    });

    const [formData, setFormData] = useState({
        payat: '',
        payat_date: new Date().toISOString().split('T')[0],
        kittuvan: '',
        ippol_payattiyath: '',
        ippol_date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            console.log('📥 Loading member data for ID:', id);

            const memberRes = await api.get(`/members/members/${id}/`);
            console.log('📥 Member data:', memberRes.data);
            setMember(memberRes.data);

            setProfileForm({
                name: memberRes.data.name || '',
                phone: memberRes.data.phone || '',
                email: memberRes.data.email || '',
                address: memberRes.data.address || '',
            });

            try {
                const transRes = await api.get(`/members/members/${id}/transactions/`);
                console.log('📥 Transactions:', transRes.data);
                setTransactions(transRes.data || []);

                const trans = transRes.data && transRes.data.length > 0 ? transRes.data[0] : null;
                setTransaction(trans);

                if (trans) {
                    setFormData({
                        payat: trans.payat || '',
                        payat_date: trans.payat_date || new Date().toISOString().split('T')[0],
                        kittuvan: trans.kittuvan || '',
                        ippol_payattiyath: trans.ippol_payattiyath || '',
                        ippol_date: trans.ippol_date || new Date().toISOString().split('T')[0],
                    });
                }
            } catch (transError) {
                console.log('No transactions found for this member');
                setTransactions([]);
                setTransaction(null);
            }
        } catch (error) {
            console.error('❌ Error loading data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const calculateValues = (payat, kittuvan, ippol_payattiyath) => {
        const p = parseFloat(payat) || 0;
        const k = parseFloat(kittuvan) || 0;
        const i = parseFloat(ippol_payattiyath) || 0;

        let kodukkan = 0;
        let bakki_kittan = 0;

        if (k > p) {
            kodukkan = 0;
            bakki_kittan = k - p + i;
        } else if (p > k) {
            kodukkan = p - k;
            if (i > kodukkan) {
                bakki_kittan = i - kodukkan;
            } else {
                bakki_kittan = 0;
            }
        } else {
            kodukkan = 0;
            bakki_kittan = i;
        }

        return { kodukkan, bakki_kittan };
    };

    const handleStatusChange = async (newStatus) => {
        try {
            if (newStatus === 'deleted') {
                if (!confirm('Move to Recently Deleted?')) return;
                await api.post(`/members/members/${id}/soft_delete/`);
                toast.success('Moved to Recently Deleted');
                navigate('/people');
                return;
            }

            await api.patch(`/members/members/${id}/`, { status: newStatus });
            const statusLabels = {
                active: 'Active',
                deceased: 'Deceased',
                closed: 'Closed',
            };
            toast.success(`Marked as ${statusLabels[newStatus]}`);
            loadData();
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleRestore = async () => {
        try {
            await api.post(`/members/members/${id}/restore/`);
            toast.success('Restored from Recently Deleted');
            loadData();
        } catch (error) {
            console.error('Error restoring:', error);
            toast.error('Failed to restore');
        }
    };

    const handleSaveProfile = async () => {
        try {
            await api.put(`/members/members/${id}/`, profileForm);
            toast.success('Profile updated! ✨');
            setIsEditingProfile(false);
            loadData();
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        }
    };

    const handleSaveTransaction = async () => {
        if (!formData.payat_date || !formData.ippol_date) {
            toast.error('Please select all dates');
            return;
        }

        const p = parseFloat(formData.payat) || 0;
        const k = parseFloat(formData.kittuvan) || 0;
        const i = parseFloat(formData.ippol_payattiyath) || 0;
        
        if (p === 0 && k === 0 && i === 0) {
            toast.error('Please enter at least one amount');
            return;
        }

        const { kodukkan, bakki_kittan } = calculateValues(p, k, i);

        try {
            // Build payload with all required fields
            const payload = {
                member: parseInt(id),
                type: p > 0 ? 'received' : 'given',
                payat: p,
                payat_date: formData.payat_date,
                kittuvan: k,
                ippol_payattiyath: i,
                ippol_date: formData.ippol_date,
                kodukkan: kodukkan,
                bakki_kittan: bakki_kittan,
                note: '',
                amount: parseFloat(p) || 0, // Always include amount
            };

            console.log('📤 Saving transaction payload:', payload);

            let response;
            if (transaction) {
                response = await api.put(`/members/transactions/${transaction.id}/`, payload);
                toast.success('Transaction updated! ✨');
            } else {
                response = await api.post('/members/transactions/', payload);
                toast.success('Transaction added! 🎉');
            }

            console.log('✅ Transaction response:', response.data);
            
            setIsEditing(false);
            await loadData();
            
        } catch (error) {
            console.error('❌ Error saving transaction:', error);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);
            
            // Show detailed error message from backend
            if (error.response?.data) {
                const errorData = error.response.data;
                if (typeof errorData === 'object') {
                    const messages = Object.entries(errorData)
                        .map(([key, value]) => {
                            if (Array.isArray(value)) {
                                return `${key}: ${value.join(', ')}`;
                            }
                            return `${key}: ${value}`;
                        })
                        .join('\n');
                    toast.error(messages);
                } else {
                    toast.error(errorData);
                }
            } else {
                toast.error('Failed to save transaction. Please try again.');
            }
        }
    };

    const handleDelete = async () => {
        if (!transaction) return;
        if (!confirm('Delete this entry?')) return;
        try {
            await api.delete(`/members/transactions/${transaction.id}/`);
            toast.success('Deleted! 🗑️');
            setTransaction(null);
            setFormData({
                payat: '',
                payat_date: new Date().toISOString().split('T')[0],
                kittuvan: '',
                ippol_payattiyath: '',
                ippol_date: new Date().toISOString().split('T')[0],
            });
            loadData();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            toast.error('Failed to delete');
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const p = parseFloat(formData.payat) || 0;
    const k = parseFloat(formData.kittuvan) || 0;
    const i = parseFloat(formData.ippol_payattiyath) || 0;
    const { kodukkan, bakki_kittan } = calculateValues(p, k, i);

    if (loading) return <LoadingSpinner />;
    if (!member) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">Person not found</h3>
                <button onClick={() => navigate('/people')} className="mt-4 text-indigo-600 hover:text-indigo-700">
                    ← Back to People
                </button>
            </div>
        );
    }

    const profilePic = member.profile_pic_url ? `http://localhost:8000${member.profile_pic_url}` : null;
    const statusLabels = {
        active: 'Active',
        deceased: 'Deceased',
        closed: 'Closed',
    };
    const status = member.is_deleted ? 'Deleted' : statusLabels[member.status] || 'Unknown';
    const statusColors = {
        Active: 'bg-green-100 text-green-700 border-green-200',
        Deceased: 'bg-red-100 text-red-700 border-red-200',
        Closed: 'bg-gray-100 text-gray-700 border-gray-200',
        Deleted: 'bg-red-50 text-red-600 border-red-200',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
            <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/people')}
                    className="group flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-all duration-300 mb-6">
                    <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back</span>
                </button>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 overflow-hidden">
                    {/* Profile Header */}
                    <div className="relative overflow-hidden">
                        <div className="absolute inset-0 bg-gray-900 opacity-90"></div>
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                            }}></div>

                        <div className="relative px-4 sm:px-6 py-4 sm:py-5">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-1 shadow-2xl shadow-black/20">
                                            <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden">
                                                {profilePic ? (
                                                    <img
                                                        src={profilePic}
                                                        alt={member.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = '';
                                                            e.target.onerror = null;
                                                        }}
                                                    />
                                                ) : (
                                                    <span className="text-3xl sm:text-4xl font-bold text-indigo-600">
                                                        {member.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform duration-200 border-2 border-white">
                                            <CameraIcon className="h-3.5 w-3.5 text-indigo-600" />
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (!file) return;
                                                const fd = new FormData();
                                                fd.append('profile_pic', file);
                                                setUploading(true);
                                                try {
                                                    const res = await api.patch(`/members/members/${id}/`, fd, {
                                                        headers: { 'Content-Type': 'multipart/form-data' },
                                                    });
                                                    setMember(res.data);
                                                    toast.success('Photo updated! 📸');
                                                } catch (error) {
                                                    console.error('Error uploading photo:', error);
                                                    toast.error('Failed to upload photo');
                                                }
                                                setUploading(false);
                                            }}
                                            className="hidden"
                                        />
                                    </div>
                                    <div className="text-white">
                                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{member.name}</h2>
                                        <div className="flex flex-wrap items-center gap-3 mt-1">
                                            {member.phone && (
                                                <span className="text-xs sm:text-sm text-white/90 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                                                    <PhoneIcon className="h-3.5 w-3.5" /> {member.phone}
                                                </span>
                                            )}
                                            <span
                                                className={`text-xs sm:text-sm px-3 py-1 rounded-full backdrop-blur-sm ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
                                                {status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    {!member.is_deleted && (
                                        <select
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            className="text-xs sm:text-sm bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-3 py-2 rounded-xl transition-all duration-200 border border-white/30 cursor-pointer"
                                            defaultValue="">
                                            <option value="" className="text-gray-700">
                                                Change Status
                                            </option>
                                            {member.status !== 'active' && (
                                                <option value="active" className="text-gray-700">
                                                    Set Active
                                                </option>
                                            )}
                                            {member.status !== 'deceased' && (
                                                <option value="deceased" className="text-gray-700">
                                                    Set Deceased
                                                </option>
                                            )}
                                            {member.status !== 'closed' && (
                                                <option value="closed" className="text-gray-700">
                                                    Set Closed
                                                </option>
                                            )}
                                            <option value="deleted" className="text-red-600">
                                                🗑️ Move to Deleted
                                            </option>
                                        </select>
                                    )}

                                    {member.is_deleted && (
                                        <button
                                            onClick={handleRestore}
                                            className="text-xs sm:text-sm bg-emerald-500/80 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium border border-white/30">
                                            <ArrowPathIcon className="h-4 w-4" /> Restore
                                        </button>
                                    )}

                                    {!isEditingProfile && !member.is_deleted && (
                                        <button
                                            onClick={() => setIsEditingProfile(true)}
                                            className="text-xs sm:text-sm bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 font-medium border border-white/30">
                                            <PencilIcon className="h-4 w-4" /> Edit Profile
                                        </button>
                                    )}
                                    {isEditingProfile && (
                                        <button
                                            onClick={() => {
                                                setIsEditingProfile(false);
                                                loadData();
                                            }}
                                            className="text-xs sm:text-sm bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-medium hover:bg-white/30 transition-all">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>

                            {isEditingProfile && (
                                <div className="mt-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/30">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="relative">
                                            <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <UserIcon className="h-4 w-4 text-indigo-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={profileForm.name}
                                                    onChange={(e) =>
                                                        setProfileForm({ ...profileForm, name: e.target.value })
                                                    }
                                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
                                                    placeholder="Enter name"
                                                />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
                                                Phone Number
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <DevicePhoneMobileIcon className="h-4 w-4 text-indigo-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={profileForm.phone}
                                                    onChange={(e) =>
                                                        setProfileForm({ ...profileForm, phone: e.target.value })
                                                    }
                                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
                                                    placeholder="Enter phone"
                                                />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
                                                Email
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <AtSymbolIcon className="h-4 w-4 text-indigo-400" />
                                                </div>
                                                <input
                                                    type="email"
                                                    value={profileForm.email}
                                                    onChange={(e) =>
                                                        setProfileForm({ ...profileForm, email: e.target.value })
                                                    }
                                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
                                                    placeholder="Enter email"
                                                />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <label className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block mb-1">
                                                Address
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <MapPinIcon className="h-4 w-4 text-indigo-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={profileForm.address}
                                                    onChange={(e) =>
                                                        setProfileForm({ ...profileForm, address: e.target.value })
                                                    }
                                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
                                                    placeholder="Enter address"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-medium transition-all duration-200">
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Ledger Section */}
                    <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                            <div className="flex items-center gap-3">
                                <SparklesIcon className="h-5 w-5 text-indigo-500" />
                                <h3 className="text-lg font-bold text-slate-800">PAYAT RECORD</h3>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {!isEditing && !member.is_deleted ? (
                                    <>
                                        {transaction ? (
                                            <>
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 sm:gap-2 font-medium">
                                                    <PencilIcon className="h-4 w-4" /> Edit
                                                </button>
                                                <button
                                                    onClick={handleDelete}
                                                    className="text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 sm:gap-2 font-medium">
                                                    <TrashIcon className="h-4 w-4" /> Delete
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="text-xs sm:text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 sm:gap-2 font-medium">
                                                <PlusCircleIcon className="h-4 w-4" /> Add Entry
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    isEditing && (
                                        <>
                                            <button
                                                onClick={handleSaveTransaction}
                                                className="text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 sm:gap-2 font-medium shadow-sm">
                                                <CheckIcon className="h-4 w-4" /> Save
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    loadData();
                                                }}
                                                className="text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 sm:gap-2 font-medium">
                                                <XMarkIcon className="h-4 w-4" /> Cancel
                                            </button>
                                        </>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-200/60">
                            <table className="w-full min-w-[600px]">
                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200">
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            PAYATT
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            MUMB KITTUVAAN
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            KODUKKAAN
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            IPPOL
                                        </th>
                                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            BAKKI KITTAAN
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        className={
                                            isEditing ? 'bg-indigo-50/20' : 'hover:bg-slate-50/50 transition-colors'
                                        }>
                                        <td className="px-3 sm:px-4 py-3 border-b border-slate-100">
                                            {isEditing ? (
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] text-slate-500 font-medium block">
                                                        Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={formData.payat_date}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, payat_date: e.target.value })
                                                        }
                                                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm"
                                                    />
                                                    <label className="text-[10px] text-slate-500 font-medium block mt-1.5">
                                                        Amount
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.payat}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, payat: e.target.value })
                                                        }
                                                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    {p > 0 && (
                                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                            <CalendarIcon className="h-3 w-3" />{' '}
                                                            {formatDate(formData.payat_date)}
                                                        </span>
                                                    )}
                                                    <span
                                                        className={`text-sm sm:text-base font-semibold ${p > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                                                        {p > 0 ? `₹${p.toFixed(0)}` : '—'}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 border-b border-slate-100">
                                            {isEditing ? (
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] text-slate-500 font-medium block">
                                                        Amount
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.kittuvan}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, kittuvan: e.target.value })
                                                        }
                                                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            ) : (
                                                <span
                                                    className={`text-sm sm:text-base font-semibold ${k > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
                                                    {k > 0 ? `₹${k.toFixed(0)}` : '—'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 border-b border-slate-100">
                                            <span
                                                className={`text-sm sm:text-base font-semibold ${kodukkan > 0 ? 'text-amber-600' : 'text-slate-300'}`}>
                                                {kodukkan > 0 ? `₹${kodukkan.toFixed(0)}` : '—'}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 border-b border-slate-100">
                                            {isEditing ? (
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] text-slate-500 font-medium block">
                                                        Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={formData.ippol_date}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, ippol_date: e.target.value })
                                                        }
                                                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm"
                                                    />
                                                    <label className="text-[10px] text-slate-500 font-medium block mt-1.5">
                                                        Amount
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={formData.ippol_payattiyath}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, ippol_payattiyath: e.target.value })
                                                        }
                                                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-xs sm:text-sm"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    {i > 0 && (
                                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                            <CalendarIcon className="h-3 w-3" />{' '}
                                                            {formatDate(formData.ippol_date)}
                                                        </span>
                                                    )}
                                                    <span
                                                        className={`text-sm sm:text-base font-semibold ${i > 0 ? 'text-purple-600' : 'text-slate-300'}`}>
                                                        {i > 0 ? `₹${i.toFixed(0)}` : '—'}
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 border-b border-slate-100">
                                            <div
                                                className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-semibold ${bakki_kittan >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                                                ₹{bakki_kittan.toFixed(0)}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {transaction && (
                            <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                                <div className="bg-emerald-50/80 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center border border-emerald-200/50">
                                    <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">
                                        PAYATT
                                    </p>
                                    <p className="text-sm sm:text-base font-bold text-emerald-700">₹{p.toFixed(0)}</p>
                                </div>
                                <div className="bg-rose-50/80 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center border border-rose-200/50">
                                    <p className="text-[10px] text-rose-600 font-semibold uppercase tracking-wider">
                                        MUMB KITTUVAAN
                                    </p>
                                    <p className="text-sm sm:text-base font-bold text-rose-700">₹{k.toFixed(0)}</p>
                                </div>
                                <div className="bg-amber-50/80 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center border border-amber-200/50">
                                    <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider">
                                        KODUKKAAN
                                    </p>
                                    <p className="text-sm sm:text-base font-bold text-amber-700">₹{kodukkan.toFixed(0)}</p>
                                </div>
                                <div className="bg-purple-50/80 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center border border-purple-200/50">
                                    <p className="text-[10px] text-purple-600 font-semibold uppercase tracking-wider">
                                        IPPOL
                                    </p>
                                    <p className="text-sm sm:text-base font-bold text-purple-700">₹{i.toFixed(0)}</p>
                                </div>
                                <div className="bg-blue-50/80 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-center border border-blue-200/50">
                                    <p className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
                                        BALANCE
                                    </p>
                                    <p
                                        className={`text-sm sm:text-base font-bold ${bakki_kittan >= 0 ? 'text-blue-700' : 'text-rose-700'}`}>
                                        ₹{bakki_kittan.toFixed(0)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {!transaction && !member.is_deleted && (
                            <div className="mt-5 text-center py-8 bg-slate-50/50 rounded-xl border border-slate-200/50">
                                <p className="text-sm text-slate-500">No transactions recorded yet</p>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                                >
                                    + Add your first transaction
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberProfile;
