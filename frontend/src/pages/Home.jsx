import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRegisterComplaint = () => {
    const target = '/complaints?new=1';
    if (!user?.token) {
      navigate('/login', { state: { redirectTo: target } });
    } else {
      navigate(target);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-3">Welcome</h1>
      <p className="text-gray-700 mb-6">Public content goes here.</p>
      <button
        onClick={handleRegisterComplaint}
        className="bg-blue-600 text-white px-4 py-2 rounded shadow"
      >
        Register Complaint
      </button>
    </div>
  );
}
