import React, { useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function AddCategoryForm({ onClose, onCreated }) {
  const { user } = useAuth();  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Category Name is required');
      return;
    }

    try {
      const res = await axiosInstance.post('/api/categories', {
        name: formData.name.trim(),
        description: formData.description,
        status: formData.status,
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setSuccess('Category created successfully!');
      setFormData({ name: '', description: '', status: 'Active' });
      onCreated?.(res.data);
      onClose?.();
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        status === 401 ? 'Please log in again.'
        : status === 403 ? 'Only admins can create categories.'
        : err?.response?.data?.message || 'Failed to create category';
      setError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative bg-white p-6 shadow-md rounded mb-6">
      {/* Close (X) button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-3 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        {/* X icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <h1 className="text-2xl font-bold mb-4">Add New Category</h1>

      {/* Name */}
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      {/* Description */}
      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      {/* Status Dropdown */}
      <select
        value={formData.status}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>

      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}

      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        Create Category
      </button>
    </form>
  );
}
