'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createOrganization, updateOrganization } from '@/lib/api/organization';
import toast from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';

export default function CreateOrganizationModal({ organization, onClose, onSuccess = () => {} }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'business',
    description: '',
    customCode: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        code: organization.code || '',
        type: organization.type || 'business',
        description: organization.description || '',
        customCode: organization.customCode || ''
      });
    }
  }, [organization]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const submissionData = {
        name: formData.name,
        type: formData.type,
        description: formData.description
      };

      // Add code if provided
      if (formData.customCode) {
        submissionData.code = formData.customCode;
      }

      const response = organization
        ? await updateOrganization(organization._id, submissionData)
        : await createOrganization(submissionData);

      if (response.success) {
        toast.success(
          organization 
            ? 'Organization updated successfully' 
            : `Organization created successfully! Code: ${response.organization?.code || 'N/A'}`
        );
        onSuccess();
      } else {
        toast.error(response.message || 'Failed to save organization');
      }
    } catch (error) {
      console.error('Error saving organization:', error);
      toast.error('An error occurred while saving the organization');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg p-6 rounded-xl bg-black/90 border border-gray-800"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#ff0080] to-[#7928ca] bg-clip-text text-transparent">
            {organization ? 'Edit Organization' : 'Create Organization'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff0080] transition-colors"
              placeholder="Enter organization name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Organization Code
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff0080] transition-colors"
              placeholder="Enter organization code"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Organization Code
            </label>
            <input
              type="text"
              name="customCode"
              value={formData.customCode}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff0080] transition-colors"
              placeholder="Enter custom organization code (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-800 text-white focus:outline-none focus:border-[#ff0080] transition-colors"
            >
              <option value="business">Business</option>
              <option value="education">Education</option>
              <option value="nonprofit">Non-Profit</option>
              <option value="government">Government</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 rounded-lg bg-black/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff0080] transition-colors"
              placeholder="Enter organization description"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-800 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : organization ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
