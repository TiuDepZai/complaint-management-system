import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function EditCategoryForm({ category, onClose, onUpdated }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        status: category.status || 'Active',
      });
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (!formData.name.trim()) {
      setError('Category Name is required');
      return;
    }

    try {
      const res = await axiosInstance.put(
        `/api/categories/${category._id}`,
        {
          name: formData.name.trim(),
          description: formData.description,
          status: formData.status,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      setSuccess('Category updated successfully!');
      onUpdated?.(res.data);
    } catch (err) {
      const status = err?.response?.status;
      const msg =
        status === 409 ? 'Category name already exists'
        : status === 400 ? (err.response?.data?.message || 'Invalid input')
        : err?.response?.data?.message || 'Failed to update category';
      setError(msg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">Edit Category</h1>

      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />

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

      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded">
          Save Changes
        </button>
        <button type="button" onClick={onClose} className="flex-1 bg-gray-200 p-2 rounded">
          Cancel
        </button>
      </div>
    </form>
  );
}
