'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function OrganizationSettings() {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    workingHours: {
      start: '',
      end: ''
    },
    departments: [],
    holidays: []
  });
  const [newDepartment, setNewDepartment] = useState('');
  const [newHoliday, setNewHoliday] = useState({
    name: '',
    date: ''
  });

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      const response = await fetch('/api/admin/organization', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setOrganization(data);
      setFormData({
        name: data.name || '',
        address: data.address || '',
        workingHours: {
          start: data.workingHours?.start || '',
          end: data.workingHours?.end || ''
        },
        departments: data.departments || [],
        holidays: data.holidays || []
      });
    } catch (error) {
      console.error('Error fetching organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('workingHours.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/admin/organization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Organization settings updated successfully!' });
        fetchOrganization();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update organization settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating organization settings' });
    }
  };

  const handleAddDepartment = () => {
    if (newDepartment.trim()) {
      setFormData(prev => ({
        ...prev,
        departments: [...prev.departments, newDepartment.trim()]
      }));
      setNewDepartment('');
    }
  };

  const handleRemoveDepartment = (index) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.filter((_, i) => i !== index)
    }));
  };

  const handleAddHoliday = () => {
    if (newHoliday.name.trim() && newHoliday.date) {
      setFormData(prev => ({
        ...prev,
        holidays: [...prev.holidays, { ...newHoliday }]
      }));
      setNewHoliday({ name: '', date: '' });
    }
  };

  const handleRemoveHoliday = (index) => {
    setFormData(prev => ({
      ...prev,
      holidays: prev.holidays.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Organization Settings</h1>

      {message.text && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Organization Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Working Hours Start</label>
              <input
                type="time"
                name="workingHours.start"
                value={formData.workingHours.start}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Working Hours End</label>
              <input
                type="time"
                name="workingHours.end"
                value={formData.workingHours.end}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md shadow-sm py-2 px-3"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Departments</h2>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              placeholder="Enter department name"
              className="flex-1 border rounded-md shadow-sm py-2 px-3"
            />
            <button
              type="button"
              onClick={handleAddDepartment}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {formData.departments.map((dept, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span>{dept}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDepartment(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Holidays</h2>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newHoliday.name}
              onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Holiday name"
              className="flex-1 border rounded-md shadow-sm py-2 px-3"
            />
            <input
              type="date"
              value={newHoliday.date}
              onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
              className="border rounded-md shadow-sm py-2 px-3"
            />
            <button
              type="button"
              onClick={handleAddHoliday}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {formData.holidays.map((holiday, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <div>
                  <span className="font-medium">{holiday.name}</span>
                  <span className="text-gray-600 ml-2">
                    {new Date(holiday.date).toLocaleDateString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveHoliday(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
