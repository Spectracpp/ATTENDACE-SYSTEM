'use client';

import { useState, useEffect } from 'react';
import { getOrganizations } from '@/lib/api/admin';
import toast from 'react-hot-toast';

export default function OrganizationSelect({ value, onChange, className = '' }) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPreloaded, setIsPreloaded] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await getOrganizations();
      console.log('Organizations response:', response); // Debug log
      if (response.success) {
        setOrganizations(response.data);
        setIsPreloaded(response.isPreloaded);
        if (response.isPreloaded) {
          toast.info('Using demo organizations list');
        }
      } else {
        throw new Error(response.message || 'Failed to fetch organizations');
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error('Failed to fetch organizations. Using demo list.');
      setOrganizations([]); // Set empty list to trigger preloaded organizations
      setIsPreloaded(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <select 
        disabled 
        className={`w-full p-2 border rounded-lg bg-gray-100 ${className}`}
      >
        <option>Loading organizations...</option>
      </select>
    );
  }

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 border rounded-lg ${
          isPreloaded ? 'border-yellow-400' : 'border-gray-300'
        } ${className}`}
      >
        <option value="">Select an organization</option>
        {organizations.map((org) => (
          <option key={org._id || org.name} value={org._id || org.name}>
            {org.name}
          </option>
        ))}
      </select>
      {isPreloaded && (
        <div className="absolute -top-2 right-0 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
          Demo Mode
        </div>
      )}
    </div>
  );
}
