import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const CreateTransaction = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const preselectedMember = queryParams.get('member');

  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    related_member: preselectedMember || '',
    amount: '',
    type: 'given',
    event: '',
    note: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // ✅ FIXED: Use /members/members/ and /members/events/
      const [membersRes, eventsRes] = await Promise.all([
        api.get('/members/members/'),
        api.get('/members/events/'),
      ]);
      setMembers(membersRes.data.filter(m => m.id !== user?.member?.id));
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.related_member || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // ✅ FIXED: Use /members/transactions/
      await api.post('/members/transactions/', {
        ...formData,
        amount: parseFloat(formData.amount),
      });
      
      toast.success('Transaction recorded successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast.error('Failed to record transaction');
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
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-900">New Transaction</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Transaction Type - Toggle Style */}
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
                Gave Money
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
                Received Money
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Related Member *
            </label>
            <select
              name="related_member"
              value={formData.related_member}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="">Select a member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name} {!member.is_active && '(Deceased)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event (Optional)
            </label>
            <select
              name="event"
              value={formData.event}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            >
              <option value="">No event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <textarea
              name="note"
              value={formData.note}
              onChange={handleChange}
              rows="3"
              placeholder="Add any additional details..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
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
      </div>
    </div>
  );
};

export default CreateTransaction;
