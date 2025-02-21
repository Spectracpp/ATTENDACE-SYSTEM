'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { organizationService } from '../../services/organization';
import toast from 'react-hot-toast';

const OrganizationContext = createContext(undefined);

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

export function OrganizationProvider({ children }) {
  const [currentOrganization, setCurrentOrganization] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Reset state when user changes
    if (!user) {
      setCurrentOrganization(null);
      setOrganizations([]);
      setError(null);
      setLoading(false);
      return;
    }

    // Load organizations when user is available
    loadOrganizations();
  }, [user]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await organizationService.getUserOrganizations();
      
      if (!data || !data.organizations) {
        throw new Error('Invalid response format');
      }
      
      setOrganizations(data.organizations);
      
      // Set current organization if not set and organizations exist
      if (!currentOrganization && data.organizations.length > 0) {
        setCurrentOrganization(data.organizations[0]);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
      setError(error.message || 'Failed to load organizations');
      toast.error(error.message || 'Failed to load organizations');
      setOrganizations([]);
      setCurrentOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = async (organizationId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await organizationService.switchOrganization(organizationId);
      
      if (!data || !data.organization) {
        throw new Error('Invalid response format');
      }
      
      setCurrentOrganization(data.organization);
      toast.success('Organization switched successfully');
      router.refresh();
    } catch (error) {
      console.error('Failed to switch organization:', error);
      setError(error.message || 'Failed to switch organization');
      toast.error(error.message || 'Failed to switch organization');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentOrganization,
    organizations,
    loading,
    error,
    switchOrganization,
    loadOrganizations, // Expose this to allow manual refresh
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
}
