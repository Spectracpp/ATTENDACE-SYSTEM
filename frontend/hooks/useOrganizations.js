'use client';

import { useState, useEffect } from 'react';
import { getPublicOrganizations } from '@/lib/api/organization';
import { toast } from 'react-hot-toast';

export function useOrganizations() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await getPublicOrganizations();
        if (response.success) {
          setOrganizations(response.organizations);
        } else {
          toast.error(response.message || 'Failed to fetch organizations');
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
        toast.error('Error loading organizations');
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizations();
  }, []);

  return { organizations, loading };
}
