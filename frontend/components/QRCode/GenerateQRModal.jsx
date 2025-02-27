'use client';

import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { generateQRCode } from '@/lib/api/qrcode';
import { getOrganizations } from '@/lib/api/organization';

export default function GenerateQRModal({ onClose, onSuccess }) {
  const [organizations, setOrganizations] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    organizationId: '',
    validFrom: '',
    validUntil: '',
    maxScans: 1,
    allowMultipleScans: false,
  });
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await getOrganizations();
        if (response.success) {
          setOrganizations(response.organizations);
        } else {
          toast.error(response.message || 'Failed to fetch organizations');
        }
      } catch (error) {
        toast.error('An error occurred while fetching organizations');
        console.error('Error:', error);
      } finally {
        setLoadingOrgs(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { organizationId, ...data } = formData;
      
      // Convert dates to ISO strings
      const formattedData = {
        ...data,
        validFrom: data.validFrom ? new Date(data.validFrom).toISOString() : undefined,
        validUntil: data.validUntil ? new Date(data.validUntil).toISOString() : undefined,
      };
      
      const response = await generateQRCode(organizationId, formattedData);
      
      if (response.success) {
        toast.success('QR Code generated successfully!');
        onSuccess(response.qrCode);
        onClose();
      } else {
        toast.error(response.message || 'Failed to generate QR Code');
      }
    } catch (error) {
      toast.error('An error occurred while generating QR Code');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FaTimes />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Generate QR Code</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-black/40 border border-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff0080]"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-black/40 border border-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff0080]"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Organization</label>
            <select
              name="organizationId"
              value={formData.organizationId}
              onChange={handleChange}
              className="w-full bg-black/40 border border-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff0080]"
              required
            >
              <option value="">Select Organization</option>
              {organizations.map(org => (
                <option key={org._id} value={org._id}>
                  {org.name}
                </option>
              ))}
            </select>
            {loadingOrgs && (
              <p className="text-sm text-gray-400 mt-1">Loading organizations...</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">Valid From</label>
              <input
                type="datetime-local"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleChange}
                className="w-full bg-black/40 border border-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff0080]"
                required
              />
            </div>

            <div>
              <label className="block text-white mb-2">Valid Until</label>
              <input
                type="datetime-local"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                className="w-full bg-black/40 border border-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff0080]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-white mb-2">Maximum Scans</label>
            <input
              type="number"
              name="maxScans"
              value={formData.maxScans}
              onChange={handleChange}
              min="1"
              className="w-full bg-black/40 border border-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#ff0080]"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="allowMultipleScans"
              checked={formData.allowMultipleScans}
              onChange={handleChange}
              className="w-4 h-4 text-[#ff0080] bg-black/40 border-gray-800 rounded focus:ring-[#ff0080]"
            />
            <label className="ml-2 text-white">Allow Multiple Scans</label>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingOrgs}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff0080] to-[#7928ca] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate QR Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
