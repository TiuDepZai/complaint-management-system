import React, { useEffect, useState } from 'react';
import AddCategoryForm from '../components/AddCategoryForm';
import EditCategoryForm from '../components/EditCategoryForm';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

export default function Categories() {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageSuccess, setPageSuccess] = useState(''); // <-- NEW
  const { user } = useAuth();

  const StatusBadge = ({ status }) => {
    const isActive = (status || '').toLowerCase() === 'active';
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border 
          ${isActive ? 'bg-green-100 text-green-800 border-green-200'
                     : 'bg-gray-100 text-gray-800 border-gray-200'}`}
      >
        {status || '-'}
      </span>
    );
  };

  // Load categories (refetch if token changes)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const headers = user?.token ? { Authorization: `Bearer ${user.token}` } : {};
        const res = await axiosInstance.get('/api/categories', { headers });
        if (isMounted) setCategories(res.data || []);
      } catch (err) {
        if (isMounted) setError('Failed to load categories.');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [user?.token]); // <-- updated

  const handleCreated = (newCategory) => {
    setCategories((prev) => [newCategory, ...prev]);
    setPageSuccess('Category created successfully!');        // <-- NEW
    setTimeout(() => setPageSuccess(''), 3000);              // <-- NEW (auto-hide)
  };

  const handleUpdated = (updated) => {
    setCategories((prev) => prev.map(c => (c._id === updated._id ? updated : c)));
    setPageSuccess('Category updated successfully!');        // <-- NEW
    setTimeout(() => setPageSuccess(''), 3000);              // <-- NEW
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

      {/* Page-level success banner */}
      {pageSuccess && (
        <div
          className="mb-3 flex items-center justify-between rounded border border-green-200 bg-green-50 px-4 py-2 text-green-800"
          role="status" aria-live="polite"
        >
          <span>{pageSuccess}</span>
          <button
            onClick={() => setPageSuccess('')}
            className="text-green-700 hover:text-green-900"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {loading && <div className="text-gray-600">Loading…</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-4 font-semibold px-4 py-3 border-b bg-gray-50">
          <div>Name</div>
          <div>Description</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {categories.map((c) => (
          <div
            key={c._id}
            className="grid grid-cols-4 px-4 py-3 border-b hover:bg-gray-50 transition-colors"
          >
            <div>{c.name}</div>
            <div className="truncate">{c.description || '-'}</div>
            <div><StatusBadge status={c.status} /></div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingCategory(c)}
                className="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring focus:ring-blue-200"
                aria-label={`Edit ${c.name}`}
                title="Edit"
              >
                {/* Pencil icon (inline SVG) */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-8.5 8.5a2 2 0 01-.878.517l-3 .75a1 1 0 01-1.213-1.213l.75-3a2 2 0 01.517-.878l8.5-8.5zM12 5l3 3" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {!loading && categories.length === 0 && (
          <div className="px-4 py-3 text-gray-600">No categories yet.</div>
        )}
      </div>

      {/* Add Category Modal */}
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

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-full max-w-lg">
            <EditCategoryForm
              category={editingCategory}
              onClose={() => setEditingCategory(null)}
              onUpdated={(u) => { handleUpdated(u); setEditingCategory(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
