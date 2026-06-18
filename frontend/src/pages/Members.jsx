import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { 
  MagnifyingGlassIcon,
  UserPlusIcon,
  UserCircleIcon,
  CheckBadgeIcon,
  ClockIcon,
  UserGroupIcon,
  TrashIcon,
  ArrowPathIcon,
  UserIcon,
  HeartIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';

const Members = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [deletedMembers, setDeletedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletedLoading, setDeletedLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchMembers();
    fetchDeletedMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [members, searchQuery, activeTab]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/members/members/');
      console.log('📥 Members response:', response.data);
      
      const currentUserId = user?.id || user?.member?.id;
      const otherMembers = response.data.filter(m => m.id !== currentUserId);
      setMembers(otherMembers);
      setFilteredMembers(otherMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedMembers = async () => {
    try {
      setDeletedLoading(true);
      const response = await api.get('/members/members/deleted/');
      setDeletedMembers(response.data);
    } catch (error) {
      console.error('Error fetching deleted members:', error);
      setDeletedMembers([]);
    } finally {
      setDeletedLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];

    if (activeTab === 'active') {
      filtered = filtered.filter(m => m.status === 'active' && m.is_deleted === false);
    } else if (activeTab === 'deceased') {
      filtered = filtered.filter(m => m.status === 'deceased' && m.is_deleted === false);
    } else if (activeTab === 'closed') {
      filtered = filtered.filter(m => m.status === 'closed' && m.is_deleted === false);
    }

    if (searchQuery.trim() && activeTab !== 'deleted') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(query) ||
        (m.phone && m.phone.includes(query))
      );
    }

    setFilteredMembers(filtered);
  };

  // Update status
  const handleStatusChange = async (memberId, newStatus) => {
    try {
      await api.patch(`/members/members/${memberId}/`, { status: newStatus });
      const statusLabels = {
        active: 'Active',
        deceased: 'Deceased',
        closed: 'Closed'
      };
      toast.success(`Marked as ${statusLabels[newStatus]}`);
      await fetchMembers();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Soft delete - move to recently deleted
  const handleMoveToDeleted = async (memberId) => {
    if (!confirm('Move this person to Recently Deleted?')) return;
    try {
      await api.post(`/members/members/${memberId}/soft_delete/`);
      toast.success('Moved to Recently Deleted');
      await Promise.all([fetchMembers(), fetchDeletedMembers()]);
    } catch (error) {
      console.error('Error moving to deleted:', error);
      toast.error('Failed to move to deleted');
    }
  };

  // Restore from deleted
  const handleRestore = async (memberId) => {
    try {
      await api.post(`/members/members/${memberId}/restore/`);
      toast.success('Restored successfully!');
      await Promise.all([fetchMembers(), fetchDeletedMembers()]);
    } catch (error) {
      console.error('Error restoring:', error);
      toast.error('Failed to restore');
    }
  };

  // Permanent delete
  const handlePermanentDelete = async (memberId) => {
    if (!confirm('⚠️ Permanently delete this person? This CANNOT be undone!')) return;
    try {
      await api.delete(`/members/members/${memberId}/permanent_delete/`);
      toast.success('Permanently deleted');
      await fetchDeletedMembers();
    } catch (error) {
      console.error('Error permanent deleting:', error);
      toast.error('Failed to permanently delete');
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (member) => {
    if (member.is_deleted) return { label: 'Deleted', color: 'bg-red-500' };
    const statusMap = {
      active: { label: 'Active', color: 'bg-green-500' },
      deceased: { label: 'Deceased', color: 'bg-red-500' },
      closed: { label: 'Closed', color: 'bg-gray-500' },
    };
    return statusMap[member.status] || { label: 'Unknown', color: 'bg-gray-400' };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const activeCount = members.filter(m => m.status === 'active' && !m.is_deleted).length;
  const deceasedCount = members.filter(m => m.status === 'deceased' && !m.is_deleted).length;
  const closedCount = members.filter(m => m.status === 'closed' && !m.is_deleted).length;
  const deletedCount = deletedMembers.length;

  const tabs = [
    { id: 'active', label: 'Active', icon: UserIcon, count: activeCount, color: 'green' },
    { id: 'deceased', label: 'Deceased', icon: HeartIcon, count: deceasedCount, color: 'red' },
    { id: 'closed', label: 'Closed', icon: ArchiveBoxIcon, count: closedCount, color: 'gray' },
  ];

  return (
    <div className="pb-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">People</h2>
          <p className="text-sm text-gray-500">
            {activeCount} Active • {deceasedCount} Deceased • {closedCount} Closed
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              // Show recently deleted
              setActiveTab('deleted');
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'deleted' 
                ? 'bg-red-600 text-white' 
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            <TrashIcon className="h-4 w-4" />
            Recently Deleted ({deletedCount})
          </button>
          <Link
            to="/person/add"
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-1.5"
          >
            <UserPlusIcon className="h-4 w-4" />
            Add Person
          </Link>
        </div>
      </div>

      {/* Tabs */}
      {activeTab !== 'deleted' && (
        <div className="flex space-x-1 mb-4 bg-gray-100 rounded-xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const colorClasses = {
              green: isActive ? 'bg-green-500 text-white' : 'hover:bg-green-100 text-green-700',
              red: isActive ? 'bg-red-500 text-white' : 'hover:bg-red-100 text-red-700',
              gray: isActive ? 'bg-gray-600 text-white' : 'hover:bg-gray-200 text-gray-700',
            };
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive ? 'bg-white shadow-sm' : `bg-transparent ${colorClasses[tab.color]}`
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-gray-200 text-gray-700' : 'bg-white/50 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Search Bar */}
      {activeTab !== 'deleted' && (
        <div className="bg-white rounded-xl shadow-sm p-3 mb-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab} members...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      )}

      {/* Recently Deleted List */}
      {activeTab === 'deleted' ? (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
            <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
              <TrashIcon className="h-5 w-5" />
              Recently Deleted
              <span className="text-sm font-normal text-red-500 ml-2">
                ({deletedMembers.length} items)
              </span>
            </h3>
            <p className="text-xs text-red-400 mt-0.5">Items stay here until permanently deleted</p>
          </div>
          
          {deletedLoading ? (
            <div className="p-8 text-center">
              <LoadingSpinner />
            </div>
          ) : deletedMembers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TrashIcon className="h-16 w-16 text-gray-300 mx-auto mb-3" />
              <p>No recently deleted items</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {deletedMembers.map((person) => {
                const profilePic = person.profile_pic_url 
                  ? `http://localhost:8000${person.profile_pic_url}` 
                  : null;

                return (
                  <div key={person.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {profilePic ? (
                        <img
                          src={profilePic}
                          alt={person.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm">
                          {getInitials(person.name)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{person.name}</p>
                        <p className="text-xs text-gray-400">
                          Deleted: {person.deleted_at ? new Date(person.deleted_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRestore(person.id)}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1"
                      >
                        <ArrowPathIcon className="h-3.5 w-3.5" /> Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(person.id)}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
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
      ) : (
        // Active/Deceased/Closed Members Grid
        filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No {activeTab} members found</p>
            {searchQuery && (
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
            )}
            {!searchQuery && activeTab === 'active' && (
              <Link to="/person/add" className="text-indigo-600 font-medium hover:text-indigo-700 mt-3 inline-block">
                Add your first person →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredMembers.map((member) => {
              const profilePic = member.profile_pic_url 
                ? `http://localhost:8000${member.profile_pic_url}` 
                : null;
              const status = getStatusBadge(member);

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200 group relative"
                >
                  <Link to={`/profile/${member.id}`} className="block p-4">
                    <div className="flex flex-col items-center text-center">
                      {/* Profile Picture */}
                      <div className="relative">
                        {profilePic ? (
                          <img
                            src={profilePic}
                            alt={member.name}
                            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 group-hover:border-indigo-400 transition-colors"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div class="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600">
                                  ${getInitials(member.name)}
                                </div>
                              `;
                            }}
                          />
                        ) : (
                          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold ${
                            member.status === 'deceased' ? 'bg-gray-400' : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                          }`}>
                            {getInitials(member.name)}
                          </div>
                        )}
                        <div className={`absolute -bottom-1 -right-1 rounded-full p-1 border-2 border-white ${status.color}`}>
                          <div className="h-2 w-2 rounded-full"></div>
                        </div>
                      </div>

                      {/* Name */}
                      <h3 className="text-sm font-semibold text-gray-900 mt-3 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {member.name}
                      </h3>
                      
                      {/* Phone */}
                      {member.phone && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          📞 {member.phone}
                        </p>
                      )}

                      {/* Status Badge */}
                      <span className={`text-xs px-2.5 py-1 rounded-full mt-2 ${
                        status.label === 'Active' ? 'bg-green-100 text-green-700' :
                        status.label === 'Deceased' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {status.label}
                      </span>
                    </div>
                  </Link>

                  {/* Status Change Dropdown */}
                  <div className="absolute top-2 right-2">
                    <select
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === 'deleted') {
                          handleMoveToDeleted(member.id);
                        } else {
                          handleStatusChange(member.id, value);
                        }
                      }}
                      value=""
                      className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 cursor-pointer"
                    >
                      <option value="">Status</option>
                      {member.status !== 'active' && <option value="active">Set Active</option>}
                      {member.status !== 'deceased' && <option value="deceased">Set Deceased</option>}
                      {member.status !== 'closed' && <option value="closed">Set Closed</option>}
                      <option value="deleted" className="text-red-600">🗑️ Move to Deleted</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default Members;
