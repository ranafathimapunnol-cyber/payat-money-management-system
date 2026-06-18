import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const AddTransaction = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedMember = queryParams.get('member');

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    member: preselectedMember || '',
    type: 'given',
    amount: '',
    payat_date: new Date().toISOString().split('T')[0],
    note: '',
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members/members/');
      const filtered = response.data.filter(m => m.id !== user?.member?.id);
      setMembers(filtered);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.member) {
      toast.error('Please select a person');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        member: parseInt(formData.member),
        type: formData.type,
        amount: parseFloat(formData.amount),
        payat: parseFloat(formData.amount), // Same as amount for consistency
        payat_date: formData.payat_date,
        note: formData.note || '',
        kittuvan: 0,
        ippol_payattiyath: 0,
        kodukkan: 0,
        bakki_kittan: 0,
      };
      
      console.log('📤 Sending transaction payload:', payload);
      
      const response = await api.post('/members/transactions/', payload);
      console.log('✅ Transaction created:', response.data);
      
      toast.success(`Transaction recorded successfully! 🎉`);
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Error creating transaction:', error);
      console.error('Response:', error.response);
      console.error('Response data:', error.response?.data);
      
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to record transaction. Please try again.');
      }
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

  return (
    <div className="pb-4 max-w-2xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">Record Transaction</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, type: 'given'})}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  formData.type === 'given'
                    ? 'bg-red-100 text-red-700 border-2 border-red-500'
                    : 'bg-gray-50 text-gray-600 border-2 border-transparent'
                }`}
              >
                <span className="block">⬆️</span>
                I Gave Money
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, type: 'received'})}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                  formData.type === 'received'
                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                    : 'bg-gray-50 text-gray-600 border-2 border-transparent'
                }`}
              >
                <span className="block">⬇️</span>
                I Received Money
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Person *
            </label>
            <select
              name="member"
              value={formData.member}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a person</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} {!member.is_active && '(Deceased)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0.01"
              step="0.01"
              placeholder="0.00"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              name="payat_date"
              value={formData.payat_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note (Optional)
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Add any details..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? 'Recording...' : 'Record Transaction'}
          </button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-xl">
          <p className="text-xs text-blue-600">
            💡 <strong>Balance Explanation:</strong><br />
            • Positive balance = Person owes you money<br />
            • Negative balance = You owe the person<br />
            • Balance = Received - Given
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddTransaction;
