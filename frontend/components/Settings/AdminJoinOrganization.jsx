'use client';

import { useState } from 'react';
import { FaBuilding, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { joinOrganization } from '@/lib/api/organizations';
import { setActiveOrganization } from '@/lib/api/user';
import { useAuth } from '@/app/context/AuthContext';

export default function AdminJoinOrganization() {
  const [inviteCode, setInviteCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { updateUser, updateActiveOrganization } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code');
      return;
    }
    
    setIsJoining(true);
    
    try {
      // Join the organization as an admin
      const joinResponse = await joinOrganization(inviteCode, 'admin');
      
      if (!joinResponse.success) {
        toast.error(joinResponse.message || 'Failed to join organization');
        setIsJoining(false);
        return;
      }
      
      // Set the newly joined organization as active
      if (joinResponse.organization && joinResponse.organization._id) {
        const setActiveResponse = await setActiveOrganization(joinResponse.organization._id);
        
        if (setActiveResponse.success) {
          // Update the active organization in auth context
          updateActiveOrganization(joinResponse.organization);
          
          // If the API returns the updated user, use that
          if (setActiveResponse.user) {
            updateUser(setActiveResponse.user);
          }
          
          toast.success('Successfully joined organization as admin');
        } else {
          toast.warning('Joined successfully, but couldn\'t set as active organization');
        }
      } else {
        toast.success('Successfully joined organization');
      }
      
      // Clear the form
      setInviteCode('');
      
    } catch (error) {
      console.error('Error joining organization:', error);
      toast.error('An error occurred while joining organization');
    } finally {
      setIsJoining(false);
    }
  };
  
  return (
    <div className="p-6 rounded-lg bg-black/50 border border-gray-800 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <FaBuilding className="w-5 h-5 text-[#ff0080]" />
        <h2 className="text-lg font-semibold text-white">Join Organization as Admin</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-300 mb-1">
            Organization Invite Code
          </label>
          <input
            id="inviteCode"
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter invite code"
            disabled={isJoining}
          />
        </div>
        
        <button
          type="submit"
          disabled={isJoining || !inviteCode.trim()}
          className={`w-full px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
            isJoining || !inviteCode.trim()
              ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
              : 'bg-[#ff0080] text-white hover:bg-[#ff0080]/90'
          }`}
        >
          {isJoining ? (
            <>
              <FaSpinner className="animate-spin w-4 h-4" />
              Joining...
            </>
          ) : (
            <>
              <FaCheckCircle className="w-4 h-4" />
              Join as Admin
            </>
          )}
        </button>
      </form>
      
      <div className="mt-4 text-sm text-gray-400">
        <p>Note: Use this only if you need to join an organization with administrator privileges.</p>
      </div>
    </div>
  );
}
