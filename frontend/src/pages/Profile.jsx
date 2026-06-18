import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  CameraIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  AtSymbolIcon,
  HomeIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile/');
      console.log('📥 Profile data:', response.data);
      setProfile(response.data);
      setFormData({
        name: response.data.member?.name || response.data.name || '',
        phone: response.data.member?.phone || response.data.phone || '',
        email: response.data.member?.email || response.data.email || '',
        address: response.data.member?.address || response.data.address || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('/auth/profile/', formData);
      toast.success('Profile updated successfully! ✨');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('profile_pic', file);

    setUploading(true);
    try {
      const response = await api.patch('/auth/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile(response.data);
      toast.success('Profile photo updated! 📸');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload profile photo');
    } finally {
      setUploading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const profilePic = profile?.member?.profile_pic 
    ? `http://localhost:8000${profile.member.profile_pic}` 
    : profile?.profile_pic 
      ? `http://localhost:8000${profile.profile_pic}`
      : null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-all duration-300 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-200/50">
        
        {/* Cover Image */}
        <div className="relative h-32 bg-gray-900">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Profile Section */}
        <div className="relative px-6 -mt-12">
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-white p-1 shadow-2xl shadow-black/20">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt={profile?.name || profile?.member?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-4xl font-bold text-indigo-600">
                      {(profile?.name || profile?.member?.name || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute bottom-1 right-1 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform duration-200 border-2 border-white disabled:opacity-50"
              >
                {uploading ? (
                  <div className="h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <CameraIcon className="h-4 w-4 text-indigo-600" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePicUpload}
                className="hidden"
              />
            </div>

            {/* Name & Status */}
            <h2 className="text-2xl font-bold text-gray-900 mt-4">
              {profile?.name || profile?.member?.name}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full bg-green-100 text-green-700">
                <ShieldCheckIcon className="h-4 w-4" />
                {profile?.phone_verified ? 'Verified' : 'Pending'}
              </span>
              <span className="text-sm text-gray-500">
                {profile?.member?.joined_date 
                  ? `Member since ${new Date(profile.member.joined_date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}`
                  : ''}
              </span>
            </div>

            {/* Edit Button */}
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="mt-4 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-medium hover:bg-indigo-100 transition-colors flex items-center gap-2"
              >
                <PencilIcon className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6 border-t border-gray-100 mt-4">
          {!editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <EnvelopeIcon className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">Email</p>
                  <p className="text-sm font-medium text-gray-900">{profile?.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <PhoneIcon className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{profile?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl md:col-span-2">
                <MapPinIcon className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">Address</p>
                  <p className="text-sm font-medium text-gray-900">{profile?.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-4 w-4 text-indigo-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DevicePhoneMobileIcon className="h-4 w-4 text-indigo-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AtSymbolIcon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1.5">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HomeIcon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all text-sm resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  <CheckIcon className="h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    fetchProfile();
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
