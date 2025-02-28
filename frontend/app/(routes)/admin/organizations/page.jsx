'use client';

import { useState, useEffect } from 'react';
import { FaBuilding, FaUsers, FaQrcode, FaEdit, FaTrash, FaPlus, FaSignInAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrganizations, deleteOrganization } from '@/lib/api/organization';
import toast from 'react-hot-toast';
import CreateOrganizationModal from '@/components/Organization/CreateOrganizationModal';
import JoinOrganizationModal from '@/components/Organization/JoinOrganizationModal';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true);
      const response = await getOrganizations();
      
      if (response.success) {
        setOrganizations(response.organizations || []);
      } else {
        toast.error(response.message || 'Failed to fetch organizations');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while fetching organizations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleDelete = async (orgId) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      try {
        const response = await deleteOrganization(orgId);
        if (response.success) {
          toast.success('Organization deleted successfully');
          await fetchOrganizations(); // Refresh the list
        } else {
          toast.error(response.message || 'Failed to delete organization');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred while deleting the organization');
      }
    }
  };

  const handleEdit = (org) => {
    setSelectedOrg(org);
    setShowAddModal(true);
  };

  const handleCloseModal = async (shouldRefresh) => {
    setShowAddModal(false);
    setSelectedOrg(null);
    if (shouldRefresh) {
      await fetchOrganizations();
    }
  };

  const handleCloseJoinModal = async (shouldRefresh) => {
    setShowJoinModal(false);
    if (shouldRefresh) {
      await fetchOrganizations();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Organizations</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
          >
            <FaSignInAlt className="text-sm" />
            <span>Join Organization</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition duration-200"
          >
            <FaPlus className="text-sm" />
            <span>Add Organization</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {organizations.map((org) => (
            <motion.div
              key={org._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <FaBuilding className="text-2xl text-blue-500" />
                  <h2 className="text-xl font-semibold text-gray-800">{org.name}</h2>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(org)}
                    className="text-blue-500 hover:text-blue-600 transition duration-200"
                  >
                    <FaEdit className="text-lg" />
                  </button>
                  <button
                    onClick={() => handleDelete(org._id)}
                    className="text-red-500 hover:text-red-600 transition duration-200"
                  >
                    <FaTrash className="text-lg" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{org.description}</p>

              <div className="flex justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <FaUsers className="text-blue-400" />
                  <span>{org.membersCount || 0} members</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaQrcode className="text-green-400" />
                  <span>{org.qrCodesCount || 0} QR codes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaUsers className="text-emerald-500" />
                  <span>{org.attendanceCount || 0} attendance</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {showAddModal && (
        <CreateOrganizationModal
          isOpen={showAddModal}
          onClose={handleCloseModal}
          organization={selectedOrg}
          onSuccess={() => {
            fetchOrganizations();
            handleCloseModal();
          }}
        />
      )}
      {showJoinModal && (
        <JoinOrganizationModal
          isOpen={showJoinModal}
          onClose={handleCloseJoinModal}
          onSuccess={() => {
            fetchOrganizations();
            handleCloseJoinModal();
          }}
        />
      )}
    </div>
  );
}
