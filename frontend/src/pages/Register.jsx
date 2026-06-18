import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    password2: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.username || !formData.email || !formData.phone || !formData.password || !formData.password2) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.password2) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending registration data:', formData);
      
      const response = await api.post('/auth/register/', formData);
      
      console.log('Registration response:', response.data);
      
      sessionStorage.setItem('registration_email', formData.email);
      
      toast.success('Registration successful! Please verify your email.');
      
      navigate('/verify-otp', { 
        state: { 
          email: formData.email,
          name: formData.name
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response);
      
      // Show detailed error messages
      if (error.response?.data) {
        const errors = error.response.data;
        console.log('Full error data:', errors);
        
        // Handle different error formats
        if (typeof errors === 'object') {
          Object.keys(errors).forEach(key => {
            const value = errors[key];
            if (Array.isArray(value)) {
              toast.error(`${key}: ${value.join(', ')}`);
            } else if (typeof value === 'string') {
              toast.error(`${key}: ${value}`);
            } else if (typeof value === 'object') {
              toast.error(`${key}: ${JSON.stringify(value)}`);
            } else {
              toast.error(`${key}: ${value}`);
            }
          });
        } else {
          toast.error(errors || 'Registration failed');
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <span className="text-3xl font-bold text-white">P</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">PAYAT</h1>
          <p className="text-sm text-gray-500 mt-1">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Full Name *"
                required
              />
            </div>

            <div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Username *"
                required
              />
            </div>

            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Email *"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                📧 We'll send verification code to this email
              </p>
            </div>

            <div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="Phone Number *"
                required
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-12"
                placeholder="Password * (min 8 characters)"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword2 ? 'text' : 'password'}
                name="password2"
                value={formData.password2}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-12"
                placeholder="Confirm Password *"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword2(!showPassword2)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword2 ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-medium hover:text-indigo-700">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
