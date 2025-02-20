'use client';

import { useState } from 'react';

const departments = [
  { id: 'ee', name: 'Electrical Engineering' },
  { id: 'ece', name: 'Electronics Engineering' },
  { id: 'cse', name: 'Computer Science Engineering' },
  { id: 'me', name: 'Mechanical Engineering' },
  { id: 'ce', name: 'Civil Engineering' },
  { id: 'it', name: 'Information Technology' },
  { id: 'ai', name: 'Artificial Intelligence & Machine Learning' }
];

export default function DepartmentSelect({ value, onChange, error }) {
  return (
    <div className="space-y-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 bg-[#0D1117] border ${
          error ? 'border-red-500' : 'border-gray-600'
        } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
      >
        <option value="">Select Department</option>
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
