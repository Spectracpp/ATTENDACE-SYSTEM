'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import { 
  getMyOrganizations, 
  createOrganization, 
  updateOrganization, 
  deleteOrganization,
  getOrganizationMembers
} from '@/lib/api/organization';

export default function OrganizationSection() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'business'
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await getMyOrganizations();
      if (response.success) {
        setOrganizations(response.organizations);
      } else {
        toast.error(response.message || 'Failed to fetch organizations');
      }
    } catch (error) {
      toast.error('Error fetching organizations');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = selectedOrg
        ? await updateOrganization(selectedOrg._id, formData)
        : await createOrganization(formData);

      if (response.success) {
        toast.success(response.message);
        fetchOrganizations();
        handleCloseModal();
      } else {
        toast.error(response.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Error performing operation');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (orgId) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) {
      return;
    }

    try {
      const response = await deleteOrganization(orgId);
      if (response.success) {
        toast.success(response.message);
        fetchOrganizations();
      } else {
        toast.error(response.message || 'Failed to delete organization');
      }
    } catch (error) {
      toast.error('Error deleting organization');
      console.error('Error:', error);
    }
  };

  const handleEdit = (org) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      description: org.description || '',
      type: org.type
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedOrg(null);
    setFormData({
      name: '',
      description: '',
      type: 'business'
    });
  };

  if (loading) {
    return <div className="text-center py-4">Loading organizations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FaBuilding className="text-primary" />
          Organizations
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          <FaPlus /> Create Organization
        </button>
      </div>

      {organizations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          You haven't created or joined any organizations yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <div
              key={org._id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className="card-body">
                <h3 className="card-title flex justify-between items-start">
                  {org.name}
                  <span className="badge badge-primary">{org.type}</span>
                </h3>
                <p className="text-gray-600">{org.description}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FaUsers />
                  <span>{org.memberCount || 0} members</span>
                </div>
                <div className="card-actions justify-end mt-4">
                  <button
                    onClick={() => handleEdit(org)}
                    className="btn btn-ghost btn-sm"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(org._id)}
                    className="btn btn-ghost btn-sm text-error"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">
              {showEditModal ? 'Edit Organization' : 'Create Organization'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Name</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="textarea textarea-bordered"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="select select-bordered"
                  required
                >
                  <option value="business">Business</option>
                  <option value="education">Education</option>
                  <option value="government">Government</option>
                  <option value="non-profit">Non-Profit</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  {showEditModal ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
