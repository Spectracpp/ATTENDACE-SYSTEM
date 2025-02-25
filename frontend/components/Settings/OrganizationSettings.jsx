'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaBuilding, FaPlus, FaEdit, FaTrash, FaUsers, FaCog } from 'react-icons/fa';
import { 
  getMyOrganizations, 
  createOrganization, 
  updateOrganization, 
  deleteOrganization,
  getOrganizationMembers
} from '@/lib/api/organization';

export default function OrganizationSettings({ isAdmin, profileData }) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'business',
    settings: {
      allowMemberInvites: false,
      requireAdminApproval: true,
      attendanceRadius: 100,
      qrCodeExpiry: 5,
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }
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
    // Check if user has permission to delete this organization
    const org = organizations.find(o => o._id === orgId);
    const userRole = org.members.find(m => m.user._id === profileData?._id)?.role;
    const canDelete = isAdmin || userRole === 'owner';

    if (!canDelete) {
      toast.error('You do not have permission to delete this organization');
      return;
    }

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
    // Check if user has permission to edit this organization
    const userRole = org.members.find(m => m.user._id === profileData?._id)?.role;
    const canEdit = isAdmin || ['owner', 'admin'].includes(userRole);

    if (!canEdit) {
      toast.error('You do not have permission to edit this organization');
      return;
    }

    setSelectedOrg(org);
    setFormData({
      name: org.name,
      description: org.description || '',
      type: org.type,
      settings: {
        ...formData.settings,
        ...org.settings
      }
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
      type: 'business',
      settings: {
        allowMemberInvites: false,
        requireAdminApproval: true,
        attendanceRadius: 100,
        qrCodeExpiry: 5,
        workingHours: {
          start: '09:00',
          end: '17:00'
        },
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      }
    });
  };

  const canCreateOrg = isAdmin;

  if (loading) {
    return <div className="text-center py-4">Loading organizations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <FaBuilding className="text-primary" />
          Organization Management
        </h2>
        {canCreateOrg && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-sm flex items-center gap-2"
          >
            <FaPlus /> Create Organization
          </button>
        )}
      </div>

      {organizations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No organizations found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => {
            const userRole = org.members.find(m => m.user._id === profileData?._id)?.role;
            const canEdit = isAdmin || ['owner', 'admin'].includes(userRole);
            const canDelete = isAdmin || userRole === 'owner';

            return (
              <div
                key={org._id}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
              >
                <div className="card-body">
                  <h3 className="card-title flex justify-between items-start">
                    {org.name}
                    <div className="flex gap-2">
                      <span className="badge badge-primary">{org.type}</span>
                      {userRole && (
                        <span className="badge badge-secondary">{userRole}</span>
                      )}
                    </div>
                  </h3>
                  <p className="text-gray-600">{org.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaUsers />
                      <span>{org.memberCount || 0} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaCog />
                      <span>
                        {org.settings?.attendanceRadius || 100}m radius
                      </span>
                    </div>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    {canEdit && (
                      <button
                        onClick={() => handleEdit(org)}
                        className="btn btn-ghost btn-sm"
                        title="Edit Organization"
                      >
                        <FaEdit />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(org._id)}
                        className="btn btn-ghost btn-sm text-error"
                        title="Delete Organization"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl">
            <h3 className="font-bold text-lg">
              {showEditModal ? 'Edit Organization' : 'Create Organization'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  rows={3}
                />
              </div>

              <div className="divider">Settings</div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Allow Member Invites</span>
                    <input
                      type="checkbox"
                      checked={formData.settings.allowMemberInvites}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            allowMemberInvites: e.target.checked
                          }
                        })
                      }
                      className="checkbox"
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Require Admin Approval</span>
                    <input
                      type="checkbox"
                      checked={formData.settings.requireAdminApproval}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          settings: {
                            ...formData.settings,
                            requireAdminApproval: e.target.checked
                          }
                        })
                      }
                      className="checkbox"
                    />
                  </label>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Attendance Radius (meters)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.settings.attendanceRadius}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          attendanceRadius: parseInt(e.target.value)
                        }
                      })
                    }
                    className="input input-bordered"
                    min="1"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">QR Code Expiry (minutes)</span>
                  </label>
                  <input
                    type="number"
                    value={formData.settings.qrCodeExpiry}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          qrCodeExpiry: parseInt(e.target.value)
                        }
                      })
                    }
                    className="input input-bordered"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Working Hours Start</span>
                  </label>
                  <input
                    type="time"
                    value={formData.settings.workingHours.start}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          workingHours: {
                            ...formData.settings.workingHours,
                            start: e.target.value
                          }
                        }
                      })
                    }
                    className="input input-bordered"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Working Hours End</span>
                  </label>
                  <input
                    type="time"
                    value={formData.settings.workingHours.end}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        settings: {
                          ...formData.settings,
                          workingHours: {
                            ...formData.settings.workingHours,
                            end: e.target.value
                          }
                        }
                      })
                    }
                    className="input input-bordered"
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Working Days</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <label key={day} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.settings.workingDays.includes(day)}
                        onChange={(e) => {
                          const newDays = e.target.checked
                            ? [...formData.settings.workingDays, day]
                            : formData.settings.workingDays.filter(d => d !== day);
                          setFormData({
                            ...formData,
                            settings: {
                              ...formData.settings,
                              workingDays: newDays
                            }
                          });
                        }}
                        className="checkbox checkbox-sm"
                      />
                      <span className="text-sm">{day}</span>
                    </label>
                  ))}
                </div>
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
