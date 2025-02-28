'use client';

import { useState, useEffect } from 'react';
import { FaBuilding, FaExchangeAlt, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getUserOrganizations, setActiveOrganization } from '@/lib/api/user';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

export default function OrganizationSelector() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);
  const { user, updateUser, updateActiveOrganization } = useAuth();
  const [activeOrgId, setActiveOrgId] = useState(user?.activeOrganization?._id || '');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (user?.activeOrganization?._id) {
      setActiveOrgId(user.activeOrganization._id);
    }
  }, [user]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await getUserOrganizations();
      
      // Check if organizations exist in the response, regardless of success status
      if (response.organizations && Array.isArray(response.organizations)) {
        setOrganizations(response.organizations);
        
        if (!response.success) {
          console.warn('Using fallback organization data:', response.message);
          // Only show a toast if it's not a development fallback
          if (!response.message?.includes('fallback')) {
            toast.warning('Using cached organization data');
          }
        }
      } else {
        console.error('Invalid organizations data:', response);
        toast.error('Failed to load organizations');
        // Set empty array to prevent UI errors
        setOrganizations([]);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Error loading organizations');
      // Set empty array to prevent UI errors
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeOrganization = async (orgId) => {
    if (orgId === activeOrgId) return;
    
    try {
      setChanging(true);
      
      // Check if user has admin role in the target organization
      const targetOrg = organizations.find(org => org._id === orgId);
      const userRole = targetOrg?.userRole || targetOrg?.role || 'member';
      const isAdmin = userRole === 'admin' || userRole === 'owner';
      
      // If the organization doesn't have an admin role for the user, warn them
      if (!isAdmin) {
        console.warn('Changing to organization where user is not an admin');
      }
      
      const response = await setActiveOrganization(orgId);
      if (response.success) {
        setActiveOrgId(orgId);
        
        // Find the selected organization from our list
        const selectedOrg = organizations.find(org => org._id === orgId);
        
        if (selectedOrg) {
          // Update active organization in the auth context
          updateActiveOrganization(selectedOrg);
          
          // If the API returns the updated user, use that instead
          if (response.user) {
            updateUser(response.user);
          }
        }
        
        toast.success('Organization changed successfully');
      } else {
        // Display more detailed error message
        const errorMessage = response.message || 'Failed to change organization';
        console.error('Error changing organization:', errorMessage, response.error);
        toast.error(errorMessage);
      }
    } catch (error) {
      toast.error('Error changing organization');
      console.error('Error:', error);
    } finally {
      setChanging(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 rounded-lg bg-black/50 border border-gray-800 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-6">
          <FaBuilding className="w-5 h-5 text-[#ff0080]" />
          <h2 className="text-lg font-semibold text-white">Organization</h2>
        </div>
        <div className="text-center py-4 text-gray-400">Loading organizations...</div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg bg-black/50 border border-gray-800 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaBuilding className="w-5 h-5 text-[#ff0080]" />
          <h2 className="text-lg font-semibold text-white">Organization</h2>
        </div>
        <Link 
          href={user?.role === 'admin' ? '/admin/organizations' : '/user/organizations'}
          className="text-sm text-[#ff0080] hover:underline flex items-center gap-1"
        >
          <FaPlus className="w-3 h-3" />
          <span>Join/Create</span>
        </Link>
      </div>

      {organizations.length === 0 ? (
        <div className="text-center py-4 text-gray-400">
          You are not a member of any organization.
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Active Organization
            </label>
            <select
              value={activeOrgId}
              onChange={(e) => handleChangeOrganization(e.target.value)}
              disabled={changing}
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-800 text-white focus:outline-none focus:border-[#ff0080]"
            >
              <option value="" disabled>Select an organization</option>
              {organizations.map((org) => (
                <option key={org._id} value={org._id}>
                  {org.name} ({org.type})
                </option>
              ))}
            </select>
          </div>

          {activeOrgId && (
            <div className="bg-black/30 p-4 rounded-lg border border-gray-800">
              <h3 className="text-white font-medium mb-2">Active Organization Details</h3>
              {organizations.find(org => org._id === activeOrgId) && (
                <div className="space-y-2 text-sm text-gray-300">
                  <p>
                    <span className="text-gray-400">Name:</span>{' '}
                    {organizations.find(org => org._id === activeOrgId).name}
                  </p>
                  <p>
                    <span className="text-gray-400">Type:</span>{' '}
                    {organizations.find(org => org._id === activeOrgId).type}
                  </p>
                  <p>
                    <span className="text-gray-400">Your Role:</span>{' '}
                    {organizations.find(org => org._id === activeOrgId).members.find(
                      m => m.user._id === user?._id
                    )?.role || 'Member'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
