import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ComplaintForm from '../components/ComplaintForm';
import axiosInstance from '../axiosConfig';

export default function Complaints() {
  const { user } = useAuth();
  const [search, setSearch] = useSearchParams();
  const [open, setOpen] = useState(false);

  const [pageSuccess, setPageSuccess] = useState('');
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const isAdmin = user?.role === 'admin';
  const showUserCol = isAdmin && search.get('all') === '1'; // show "User" column only for admin all=1

  // Small priority badge
  const PriorityBadge = ({ value }) => {
    const cls =
      value === 'Urgent'
        ? 'bg-red-100 text-red-800 border-red-200'
        : value === 'High'
        ? 'bg-orange-100 text-orange-800 border-orange-200'
        : value === 'Medium'
        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
        : 'bg-green-100 text-green-800 border-green-200';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
        {value}
      </span>
    );
  };

  // Open modal if ?new=1
  useEffect(() => {
    if (search.get('new') === '1' && user?.token) setOpen(true);
  }, [search, user?.token]);

  const closeForm = () => {
    setOpen(false);
    if (search.get('new')) {
      search.delete('new');
      setSearch(search, { replace: true });
    }
  };

  // Fetch complaints (supports admin ?all=1)
  const fetchComplaints = async () => {
    if (!user?.token) {
      setComplaints([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setLoadError('');

      const wantAll = search.get('all') === '1';
      const qs = isAdmin && wantAll ? '?all=1' : '';

      const res = await axiosInstance.get(`/api/complaints${qs}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setComplaints(res.data || []);
    } catch (e) {
      setLoadError('Failed to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  // Load (or reload if token OR querystring changes)
  useEffect(() => {
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.token, search.toString()]);

  // After submit: close modal, show success with reference, then refetch list
  const handleSubmitted = async (created) => {
    closeForm();
    setPageSuccess(`Complaint submitted successfully! Reference: ${created.reference}`);
    setTimeout(() => setPageSuccess(''), 4000);
    await fetchComplaints();
  };

  const headerCols = showUserCol ? 'grid-cols-5' : 'grid-cols-4';

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Complaints</h1>
        {user?.token && user?.role !== 'admin' && (
          <button
            onClick={() => {
              setOpen(true);
              search.set('new', '1');
              setSearch(search, { replace: true });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow"
          >
            Add New Complaint
          </button>
        )}
      </div>

      {pageSuccess && (
        <div
          className="mb-3 flex items-center justify-between rounded border border-green-200 bg-green-50 px-4 py-2 text-green-800"
          role="status"
          aria-live="polite"
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

      {!user?.token && <div className="text-gray-700 mb-4">Please log in to register a complaint.</div>}

      {/* List table (only when logged in) */}
      {user?.token && (
        <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
          <div className={`grid ${headerCols} font-semibold px-4 py-3 border-b bg-gray-50`}>
            {showUserCol && <div>User</div>}
            <div>Reference</div>
            <div>Category</div>
            <div>Priority</div>
            <div>Description</div>
          </div>

          {loading && <div className="px-4 py-3 text-gray-600">Loading…</div>}
          {loadError && <div className="px-4 py-3 text-red-600">{loadError}</div>}

          {!loading &&
            !loadError &&
            complaints.map((c) => (
              <div
                key={c._id}
                className={`grid ${headerCols} px-4 py-3 border-b hover:bg-gray-50 transition-colors`}
              >
                {showUserCol && (
                  <div title={c.createdBy?.email}>
                    {c.createdBy?.name || c.createdBy?.email || '-'}
                  </div>
                )}
                <div className="font-mono">{c.reference}</div>
                <div>{c.category?.name || '-'}</div>
                <div>
                  <PriorityBadge value={c.priority} />
                </div>
                <div className="truncate" title={c.description}>
                  {c.description}
                </div>
              </div>
            ))}

          {!loading && !loadError && complaints.length === 0 && (
            <div className="px-4 py-3 text-gray-600">No complaints yet.</div>
          )}
        </div>
      )}

      {open && user?.token && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-full max-w-lg">
            <ComplaintForm onClose={closeForm} onSubmitted={handleSubmitted} />
          </div>
        </div>
      )}
    </div>
  );
}
