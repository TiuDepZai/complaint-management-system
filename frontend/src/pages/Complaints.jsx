import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ComplaintForm from '../components/ComplaintForm';

export default function Complaints() {
  const { user } = useAuth();
  const [search, setSearch] = useSearchParams();
  const [open, setOpen] = useState(false);

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

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Register Complaint</h1>
        {user?.token && (
          <button
            onClick={() => { setOpen(true); search.set('new', '1'); setSearch(search, { replace: true }); }}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow"
          >
            Add New Complaint
          </button>
        )}
      </div>

      {!user?.token && (
        <div className="text-gray-700">Please log in to register a complaint.</div>
      )}

      {open && user?.token && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-full max-w-lg">
            <ComplaintForm
              onClose={closeForm}
              onSubmitted={() => closeForm()}  // just close for now
            />
          </div>
        </div>
      )}
    </div>
  );
}
