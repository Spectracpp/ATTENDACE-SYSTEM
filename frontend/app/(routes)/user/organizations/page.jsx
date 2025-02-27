'use client';

import { useState, useEffect } from 'react';
import { FaBuilding, FaPlus, FaUsers, FaQrcode, FaSearch } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getUserOrganizations, joinOrganization } from '@/lib/api/user';
import { getPublicOrganizations } from '@/lib/api/organization';
import { useAuth } from '@/app/context/AuthContext';

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
    try {
      setLoading(true);
      
      // Fetch user's organizations
      const myOrgsResponse = await getUserOrganizations();
      if (myOrgsResponse.organizations) {
        setMyOrganizations(myOrgsResponse.organizations);
        if (!myOrgsResponse.success) {
          toast.warning('Using fallback organization data');
          console.warn('Using fallback organization data:', myOrgsResponse.message);
        }
      } else {
        toast.error('Failed to load your organizations');
        console.error('No organizations data returned:', myOrgsResponse);
        setMyOrganizations([]);
      }
      
      // Fetch public organizations
      const publicOrgsResponse = await getPublicOrganizations();
      if (publicOrgsResponse.organizations) {
        setPublicOrganizations(publicOrgsResponse.organizations);
        if (!publicOrgsResponse.success) {
          console.warn('Using fallback public organization data:', publicOrgsResponse.message);
        }
      } else {
        console.error('No public organizations data returned:', publicOrgsResponse);
        setPublicOrganizations([]);
      }
    } catch (error) {
      toast.error('Error loading organizations');
      console.error('Error fetching organizations:', error);
      // Set empty arrays to prevent UI errors
      setMyOrganizations([]);
      setPublicOrganizations([]);
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
    
    try {
      setJoining(true);
      const response = await joinOrganization(joinCode.trim());
      
      if (response.success) {
        toast.success('Successfully joined organization');
        setJoinCode('');
        fetchOrganizations();
        
        // Update active organization if this is the user's first organization
        if (response.organization && (!user.activeOrganization || myOrganizations.length === 0)) {
          updateActiveOrganization(response.organization);
          
          if (response.user) {
            updateUser(response.user);
          }
        }
      } else {
        toast.error(response.message || 'Failed to join organization');
      }
    } catch (error) {
      toast.error('Error joining organization');
      console.error('Error:', error);
    } finally {
      setJoining(false);
    }
  };

  const filteredPublicOrgs = publicOrganizations.filter(org => {
    // Filter out organizations the user is already a member of
    const isMember = myOrganizations.some(myOrg => myOrg._id === org._id);
    if (isMember) return false;
    
    // Filter by search query if provided
    if (searchQuery) {
      return (
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="animate-pulse text-[#ff0080]">Loading organizations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Organizations</h1>
        <p className="text-gray-400">Manage your organization memberships</p>
      </div>

      {/* Join Organization Form */}
      <div className="p-6 rounded-lg bg-black/50 border border-gray-800 backdrop-blur-xl">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FaQrcode className="text-[#ff0080]" />
          Join an Organization
        </h2>
        
        <form onSubmit={handleJoinOrganization} className="flex gap-4">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Enter organization code"
            className="flex-1 px-4 py-2 rounded-lg bg-black/50 border border-gray-800 text-white focus:outline-none focus:border-[#ff0080]"
          />
          <button
            type="submit"
            disabled={joining || !joinCode.trim()}
            className="px-6 py-2 rounded-lg bg-[#ff0080] text-white hover:bg-[#ff0080]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {joining ? 'Joining...' : 'Join'}
          </button>
        </form>
      </div>

      {/* My Organizations */}
      <div className="p-6 rounded-lg bg-black/50 border border-gray-800 backdrop-blur-xl">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <FaBuilding className="text-[#ff0080]" />
          My Organizations
        </h2>
        
        {myOrganizations.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            You are not a member of any organization yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myOrganizations.map((org) => (
              <div
                key={org._id}
                className="p-4 rounded-lg bg-black/30 border border-gray-800 hover:border-[#ff0080]/30 transition-colors"
              >
                <h3 className="text-lg font-medium text-white mb-1">{org.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#ff0080]/20 text-[#ff0080]">
                    {org.type}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                    {org.members.find(m => m.user._id === user?._id)?.role || 'Member'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {org.description || 'No description available'}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <FaUsers className="mr-1" />
                  <span>{org.memberCount || org.members.length} members</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Public Organizations */}
      <div className="p-6 rounded-lg bg-black/50 border border-gray-800 backdrop-blur-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FaUsers className="text-[#ff0080]" />
            Public Organizations
          </h2>
          
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search organizations"
              className="pl-10 pr-4 py-2 rounded-lg bg-black/50 border border-gray-800 text-white focus:outline-none focus:border-[#ff0080] w-64"
            />
          </div>
        </div>
        
        {filteredPublicOrgs.length === 0 ? (
          <div className="text-center py-6 text-gray-400">
            {searchQuery ? 'No organizations match your search.' : 'No public organizations available.'}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPublicOrgs.map((org) => (
              <div
                key={org._id}
                className="p-4 rounded-lg bg-black/30 border border-gray-800 hover:border-[#ff0080]/30 transition-colors"
              >
                <h3 className="text-lg font-medium text-white mb-1">{org.name}</h3>
                <div className="mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#ff0080]/20 text-[#ff0080]">
                    {org.type}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {org.description || 'No description available'}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <FaUsers className="mr-1" />
                    <span>{org.memberCount || 0} members</span>
                  </div>
                  <button
                    onClick={() => {
                      // Copy join code to clipboard if available
                      if (org.joinCode) {
                        navigator.clipboard.writeText(org.joinCode);
                        toast.success('Join code copied to clipboard');
                        setJoinCode(org.joinCode);
                      } else {
                        toast.error('Join code not available');
                      }
                    }}
                    className="text-xs text-[#ff0080] hover:underline"
                  >
                    Get Join Code
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
