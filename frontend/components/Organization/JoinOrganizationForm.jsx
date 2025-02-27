'use client';

import { useState } from 'react';
import { FaBuilding, FaArrowRight } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { joinOrganization } from '@/lib/api/user';
import { useAuth } from '@/app/context/AuthContext';

export default function JoinOrganizationForm({ onSuccess }) {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error('Please enter an organization code');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await joinOrganization(code.trim());
      
      if (response.success) {
        toast.success(response.message);
        setCode('');
        
        // If the API returns updated user data, update the auth context
        if (response.user) {
          updateUser(response.user);
        }
        
        // Call the success callback if provided
        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess();
        }
      } else {
        toast.error(response.message || 'Failed to join organization');
      }
    } catch (error) {
      console.error('Error joining organization:', error);
      toast.error('An error occurred while joining the organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-lg bg-black/50 border border-gray-800 backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6">
        <FaBuilding className="w-5 h-5 text-[#ff0080]" />
        <h2 className="text-lg font-semibold text-white">Join Organization</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="orgCode" className="block text-sm font-medium text-gray-300 mb-1">
            Organization Code
          </label>
          <input
            id="orgCode"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter organization code"
            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-[#ff0080] focus:border-transparent"
            disabled={isSubmitting}
            maxLength={10}
          />
          <p className="mt-1 text-xs text-gray-400">
            Try one of these codes: MRIU, DPS, IITD, AIIMS, JMI
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? (
            'Joining...'
          ) : (
            <>
              Join <FaArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
