import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, CameraIcon } from '@heroicons/react/24/outline';

const AddPerson = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [profilePic, setProfilePic] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Please enter the person\'s name');
      return;
    }

    setLoading(true);
    try {
      // First create the member
      const memberData = { ...formData };
      const response = await api.post('/members/members/', memberData);
      const memberId = response.data.id;
      
      // If there's a profile picture, upload it
      if (profilePic) {
        const formDataWithPic = new FormData();
        formDataWithPic.append('profile_pic', profilePic);
        await api.patch(`/members/members/${memberId}/`, formDataWithPic, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      
      toast.success('Person added successfully! 🎉');
      navigate('/people');
    } catch (error) {
      console.error('Error adding person:', error);
      toast.error(error.response?.data?.error || 'Failed to add person');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-4 max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <button 
          onClick={() => navigate('/people')} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">Add New Person</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center">
            <div 
              className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors cursor-pointer flex items-center justify-center overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewImage ? (
                <img src={previewImage} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <CameraIcon className="h-8 w-8 text-gray-400" />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Tap to add profile picture</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
              placeholder="Enter full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Enter phone number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              placeholder="Enter address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
              placeholder="Additional notes (optional)"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </span>
            ) : (
              'Add Person'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPerson;
