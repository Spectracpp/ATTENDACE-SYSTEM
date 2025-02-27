'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { FaPlus } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const LeaveRequestModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    type: 'sick',
    reason: ''
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">Request Leave</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(formData);
        }} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-2">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Leave Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
            >
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="emergency">Emergency Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 mb-2">Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pink-500"
              rows="4"
              required
            ></textarea>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function UserLeaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/user/leaves');
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLeave = async (formData) => {
    try {
      await axios.post('/api/user/leaves', formData);
      toast.success('Leave request submitted successfully!');
      setShowModal(false);
      fetchLeaves();
    } catch (error) {
      console.error('Error submitting leave:', error);
      toast.error(error.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleCancelLeave = async (leaveId) => {
    try {
      await axios.delete(`/api/user/leaves/${leaveId}`);
      toast.success('Leave request cancelled successfully!');
      fetchLeaves();
    } catch (error) {
      console.error('Error cancelling leave:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel leave request');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-500 bg-green-500/20';
      case 'rejected':
        return 'text-red-500 bg-red-500/20';
      default:
        return 'text-yellow-500 bg-yellow-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Leave Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          <FaPlus />
          Request Leave
        </button>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Leave Requests</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Start Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">End Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Reason</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id} className="border-b border-gray-700 last:border-0">
                    <td className="py-3 px-4 text-white capitalize">{leave.type}</td>
                    <td className="py-3 px-4 text-white">{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-white">{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-white">{leave.reason}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {leave.status === 'pending' && (
                        <button
                          onClick={() => handleCancelLeave(leave._id)}
                          className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {leaves.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-400">
                      No leave requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Pending Leaves</h3>
          <p className="text-3xl font-bold text-yellow-500">
            {leaves.filter(leave => leave.status === 'pending').length}
          </p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Approved Leaves</h3>
          <p className="text-3xl font-bold text-green-500">
            {leaves.filter(leave => leave.status === 'approved').length}
          </p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Rejected Leaves</h3>
          <p className="text-3xl font-bold text-red-500">
            {leaves.filter(leave => leave.status === 'rejected').length}
          </p>
        </div>
      </div>

      <LeaveRequestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmitLeave}
      />
    </div>
  );
}
