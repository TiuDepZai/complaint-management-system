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
      if (onCreated) onCreated(res.data);
      if (onClose) onClose();
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
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
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
