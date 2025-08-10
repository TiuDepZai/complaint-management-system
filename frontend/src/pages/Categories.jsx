import React, { useEffect, useState } from 'react';
import AddCategoryForm from '../components/AddCategoryForm';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function Categories() {
  const [showForm, setShowForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();


  // Load categories on mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const headers = user?.token
        ? { Authorization: `Bearer ${user.token}` }
        : {};
        const res = await axiosInstance.get('/api/categories', { headers });
        if (isMounted) setCategories(res.data || []);
      } catch (err) {
        if (isMounted) setError('Failed to load categories.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const handleCreated = (newCategory) => {
    // Optimistically append the new item
    setCategories((prev) => [newCategory, ...prev]);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          Add New Category
        </button>
      </div>

      {loading && <div className="text-gray-600">Loading…</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      {/* Simple list/table of categories */}
      <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-3 font-semibold px-4 py-3 border-b bg-gray-50">
            <div>Name</div>
            <div>Description</div>
            <div>Status</div>
        </div>

        {categories.map((c) => (
            <div
            key={c._id}
            className="grid grid-cols-3 px-4 py-3 border-b hover:bg-gray-50 transition-colors"
            >
            <div>{c.name}</div>
            <div className="truncate">{c.description || '-'}</div>
            <div>{c.status}</div>
            </div>
        ))}

        {!loading && categories.length === 0 && (
            <div className="px-4 py-3 text-gray-600">No categories yet.</div>
        )}
        </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-full max-w-lg">
            <AddCategoryForm
              onClose={() => setShowForm(false)}
              onCreated={handleCreated}
            />
          </div>
        </div>
      )}
    </div>
  );
}
