import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function EditComplaintModal({ complaint, onClose, onUpdated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    description: complaint.description || '',
    category: complaint.category?._id || complaint.category || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Load Active categories
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState('');

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setCatLoading(true);
        setCatError('');
        const res = await axiosInstance.get('/api/categories/active', {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        if (!ignore) setCategories(res.data || []);
      } catch (e) {
        if (!ignore) setCatError('Failed to load categories');
      } finally {
        if (!ignore) setCatLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [user?.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const desc = String(form.description || '').trim();
    if (!desc) {
      setError('Description is required');
      return;
    }
    if (!form.category) {
      setError('Please select a category');
      return;
    }

    try {
      setSaving(true);
      const res = await axiosInstance.put(
        `/api/complaints/${complaint._id}`,
        { description: desc, category: form.category },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      onUpdated?.(res.data);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 403
          ? 'You are not allowed to update this complaint'
          : 'Failed to update complaint');
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative bg-white p-6 shadow-md rounded">
      {/* Close (X) */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-3 p-1 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <h2 className="text-xl font-semibold mb-4">Edit Complaint</h2>

      <label className="block text-sm font-medium mb-1">Category</label>
      <select
        value={form.category}
        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
        disabled={catLoading}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="">{catLoading ? 'Loading categories…' : 'Select Category'}</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </select>
      {catError && <div className="text-red-600 text-sm mb-2">{catError}</div>}

      <label className="block text-sm font-medium mb-1">Description</label>
      <textarea
        rows={4}
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        className="w-full mb-4 p-2 border rounded"
      />

      {error && <div className="text-red-600 mb-2">{error}</div>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className={`flex-1 p-2 rounded text-white ${
            saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button type="button" onClick={onClose} className="flex-1 bg-gray-200 p-2 rounded">
          Cancel
        </button>
      </div>
    </form>
  );
}
