'use client';

import { useState, useEffect } from 'react';
import { FaBuilding, FaPlus, FaUsers, FaSearch, FaQrcode } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getUserOrganizations, joinOrganization } from '@/lib/api/user';
import { getPublicOrganizations } from '@/lib/api/organization';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

export default function OrganizationsPage() {
  const [myOrganizations, setMyOrganizations] = useState([]);
  const [publicOrganizations, setPublicOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, updateUser, updateActiveOrganization } = useAuth();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const userOrgsResponse = await getUserOrganizations();
      if (userOrgsResponse.success) {
        setMyOrganizations(userOrgsResponse.organizations);
      }

      const publicOrgsResponse = await getPublicOrganizations();
      if (publicOrgsResponse.success) {
        setPublicOrganizations(publicOrgsResponse.organizations);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOrganization = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast.error('Please enter a join code');
      return;
    }

    setJoining(true);
    try {
      const response = await joinOrganization(joinCode);
      if (response.success) {
        toast.success('Successfully joined organization!');
        setJoinCode('');
        fetchOrganizations();
      } else {
        toast.error(response.message || 'Failed to join organization');
      }
    } catch (error) {
      console.error('Error joining organization:', error);
      toast.error('Failed to join organization');
    } finally {
      setJoining(false);
    }
  };

  const handleSetActiveOrganization = (org) => {
    updateActiveOrganization(org);
    toast.success(`${org.name} set as active organization`);
  };

  const filteredPublicOrganizations = publicOrganizations.filter((org) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      org.name.toLowerCase().includes(query) ||
      (org.description && org.description.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-8">Organizations</h1>
      
      {/* Join Organization Form */}
      <div className="p-6 rounded-lg bg-black/50 border border-gray-800 backdrop-blur-xl mb-8">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FaPlus className="text-[#ff0080]" />
          Join an Organization
        </h2>
        
        <form onSubmit={handleJoinOrganization} className="space-y-4">
          <div>
            <label htmlFor="joinCode" className="block text-sm font-medium text-gray-400 mb-1">
              Organization Join Code
            </label>
            <input
              type="text"
              id="joinCode"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter join code"
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0080] text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={joining}
            className="w-full py-2 bg-gradient-to-r from-[#7928ca] to-[#ff0080] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center"
          >
            {joining ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                Joining...
              </>
            ) : (
              'Join Organization'
            )}
          </button>
        </form>
      </div>

      {/* My Organizations */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FaBuilding className="text-[#ff0080]" />
          My Organizations
        </h2>
        
        {myOrganizations.length === 0 ? (
          <div className="p-6 rounded-lg bg-gray-800/30 border border-gray-700 text-center">
            <p className="text-gray-400">You haven't joined any organizations yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myOrganizations.map((org) => (
              <div
                key={org._id}
                className={`p-6 rounded-lg ${
                  user?.activeOrganization === org._id
                    ? 'bg-gradient-to-r from-[#7928ca]/20 to-[#ff0080]/20 border border-[#ff0080]/30'
                    : 'bg-gray-800/30 border border-gray-700'
                } backdrop-blur-md`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white">{org.name}</h3>
                  {user?.activeOrganization === org._id ? (
                    <span className="px-2 py-1 bg-[#ff0080]/20 text-[#ff0080] text-xs rounded-full">
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetActiveOrganization(org)}
                      className="text-xs text-[#ff0080] hover:underline"
                    >
                      Set as Active
                    </button>
                  )}
                </div>
                
                {org.description && (
                  <p className="text-gray-400 text-sm mb-4">{org.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <FaUsers className="mr-1" />
                    <span>
                      {org.memberCount || (org.members && Array.isArray(org.members) ? org.members.length : 0)} members
                    </span>
                  </div>
                  <Link href="/user/attendance" className="text-xs text-[#ff0080] hover:underline flex items-center gap-1">
                    <FaQrcode className="text-xs" />
                    Scan Attendance QR
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Public Organizations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FaBuilding className="text-[#ff0080]" />
            Public Organizations
          </h2>
          
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search organizations..."
              className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff0080] text-white text-sm"
            />
          </div>
        </div>
        
        {filteredPublicOrganizations.length === 0 ? (
          <div className="p-6 rounded-lg bg-gray-800/30 border border-gray-700 text-center">
            <p className="text-gray-400">No public organizations found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPublicOrganizations.map((org) => (
              <div
                key={org._id}
                className="p-6 rounded-lg bg-gray-800/30 border border-gray-700 backdrop-blur-md"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{org.name}</h3>
                {org.description && (
                  <p className="text-gray-400 text-sm mb-4">{org.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <FaUsers className="mr-1" />
                    <span>
                      {org.memberCount || (org.members && Array.isArray(org.members) ? org.members.length : 0)} members
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (org.joinCode) {
                        setJoinCode(org.joinCode);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        toast.error('Join code not available');
                      }
                    }}
                    className="text-xs text-[#ff0080] hover:underline"
                  >
                    Join
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
