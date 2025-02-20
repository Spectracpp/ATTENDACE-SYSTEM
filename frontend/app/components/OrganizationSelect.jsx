'use client';

import { useState, useEffect } from 'react';
import { FaBuilding } from 'react-icons/fa';

export default function OrganizationSelect({ 
  value, 
  onChange, 
  error, 
  disabled = false,
  required = true,
  className = ''
}) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch('/api/organizations');
        if (!response.ok) {
          throw new Error('Failed to fetch organizations');
        }
        const data = await response.json();
        setOrganizations(data.organizations || []);
      } catch (error) {
        console.error('Error fetching organizations:', error);
        setFetchError('Failed to load organizations');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleChange = (e) => {
    // Create a synthetic event that matches the parent's expected format
    onChange({
      target: {
        name: 'organizationName',
        value: e.target.value
      }
    });
  };

  if (loading) {
    return (
      <div className="w-full px-3 py-2 bg-[#0D1117] border border-gray-600 rounded-lg text-gray-400">
        Loading organizations...
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="w-full px-3 py-2 bg-[#0D1117] border border-red-500 rounded-lg text-red-500">
        {fetchError}
      </div>
    );
  }

  return (
    <div className="relative space-y-1">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <FaBuilding className="h-5 w-5 text-gray-400" />
      </div>
      <select
        name="organizationName"
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        className={`block w-full pl-10 pr-3 py-2 rounded-md text-sm bg-[#161B22] border ${
          error ? 'border-red-500' : 'border-gray-700'
        } focus:outline-none focus:border-[#00f2ea] text-white ${className}`}
      >
        <option value="">Select Organization</option>
        {organizations.map((org) => (
          <option key={org._id} value={org.name}>
            {org.name}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
